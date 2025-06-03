import { eventType } from "@/assets/types/types";
import DatePicker from "@/components/DatePicker";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
} from "react-native";

export default function EditCurrentMedEvent() {
  const { eventId } = useLocalSearchParams();

  const [editEventName, setEditEventName] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editNextData, setEditNextData] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const [showDatePicker, setShowDatePicker] = useState<
    null | "date" | "nextDate"
  >(null);
  const [tempDate, setTempDate] = useState(new Date());

  const [curEvent, setCurEvent] = useState<eventType | null>(null);

  useEffect(() => {
    if (curEvent) {
      setEditEventName(curEvent?.event_name);
      setEditDate(curEvent?.date);
      setEditNextData(curEvent?.next_date);
      setEditNotes(curEvent?.notes);

      setTempDate(new Date(curEvent.date));
    }
  }, [curEvent]);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(
          `https://api.petcare.cyou/v1/event/${eventId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch event");
        }

        const data = await response.json();
        setCurEvent(data);
      } catch (error) {
        console.error("Error fetching event:", error);
      }
    };
    fetchEvent();
  }, [eventId]);

  const handleDateChange = (date: Date) => {
    const iso = date.toISOString().split("T")[0];
    if (showDatePicker === "date") setEditDate(iso);
    if (showDatePicker === "nextDate") setEditNextData(iso);
    setTempDate(date);
  };

  const handleCancel = () => {
    setShowDatePicker(null);
  };

  const handleConfirm = () => {
    const iso = tempDate.toISOString().split("T")[0];
    if (showDatePicker === "date") setEditDate(iso);
    if (showDatePicker === "nextDate") setEditNextData(iso);
    setShowDatePicker(null);
  };

  const editEvent = async () => {
    if (!editEventName || !editDate) {
      alert("Please fill in name and date.");
      return;
    }

    const newEvent = {
      event_name: editEventName,
      date: editDate,
      next_date: editNextData,
      notes: editNotes,
    };

    try {
      const response = await fetch(
        `https://api.petcare.cyou/v1/event/${eventId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newEvent),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to edit event");
      }

      alert("Event edit successfully");
      setEditEventName("");
      setEditDate("");
      setEditEventName("");
      setEditNotes("");
      router.push({
        pathname: "/currentMedEvent",
        params: { eventId },
      });
    } catch (error) {
      console.error("Save failed", error);
      alert("Error edit event");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Edit Medical Event</Text>

          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Med Name"
              value={editEventName}
              onChangeText={setEditEventName}
              style={styles.input}
              placeholderTextColor="#7d7c7c"
            />

            <TouchableOpacity
              onPress={() => {
                setTempDate(editDate ? new Date(editDate) : new Date());
                setShowDatePicker("date");
              }}
              style={styles.input}
            >
              <Text
                style={{ color: editDate ? "#333" : "#7d7c7c", fontSize: 18 }}
              >
                {editDate ? new Date(editDate).toDateString() : "Select Date"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setTempDate(editNextData ? new Date(editNextData) : new Date());
                setShowDatePicker("nextDate");
              }}
              style={styles.input}
            >
              <Text
                style={{
                  color: editNextData ? "#333" : "#7d7c7c",
                  fontSize: 18,
                }}
              >
                {editNextData
                  ? new Date(editNextData).toDateString()
                  : "Select Next Date"}
              </Text>
            </TouchableOpacity>

            <TextInput
              placeholder="Notes"
              value={editNotes}
              onChangeText={setEditNotes}
              style={[styles.input, styles.notesInput]}
              placeholderTextColor="#7d7c7c"
              multiline
            />
          </View>

          <View style={styles.iosButtons}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#3a92c9" }]}
              onPress={() =>
                router.push({
                  pathname: "/currentMedEvent",
                  params: { eventId },
                })
              }
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#008000" }]}
              onPress={editEvent}
            >
              <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
          </View>

          <DatePicker
            visible={showDatePicker !== null}
            date={tempDate}
            onChange={handleDateChange}
            onCancel={handleCancel}
            onConfirm={handleConfirm}
            maximumDate={
              showDatePicker === "date"
                ? new Date()
                : new Date(new Date().setFullYear(new Date().getFullYear() + 2))
            }
          />
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 80,
    backgroundColor: "#d0ecf5",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 30,
    color: "#333",
  },
  inputContainer: {
    marginTop: 30,
  },
  input: {
    height: 50,
    marginBottom: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: 20,
    backgroundColor: "#fff",
    fontSize: 18,
    justifyContent: "center",
  },
  addButton: {
    backgroundColor: "#3a92c9",
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 30,
    shadowColor: "#3a92c9",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  pickerButton: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 10,
    backgroundColor: "#fff",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "100%",
    alignItems: "center",
  },
  notesInput: {
    height: 120,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  iosButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 20,
  },
  button: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 25,
    shadowColor: "#3a92c9",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
