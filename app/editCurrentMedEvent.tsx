import { getValidDate } from "@/assets/utils/getValidDate";
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

const API_URL =
  Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";

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

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`${API_URL}/api/medical-event/${eventId}`);
        if (!response.ok) throw new Error("Failed to fetch event");

        const data = await response.json();
        setEditEventName(data.event_name);
        setEditDate(data.date || "");
        setEditNextData(data.next_date || "");
        setEditNotes(data.notes || "");

        setTempDate(getValidDate(data.date));
      } catch (error) {
        console.error("Error fetching event:", error);
      }
    };
    if (eventId) fetchEvent();
  }, [eventId]);

  const handleConfirm = () => {
    const iso = tempDate.toISOString().split("T")[0];
    if (showDatePicker === "date") setEditDate(iso);
    if (showDatePicker === "nextDate") setEditNextData(iso);
    setShowDatePicker(null);
  };

  const saveEdit = async () => {
    if (!editEventName || !editDate) {
      alert("Please fill in name and date.");
      return;
    }

    const updatedEvent = {
      event_name: editEventName,
      date: editDate,
      next_date: editNextData,
      notes: editNotes,
    };

    try {
      const response = await fetch(`${API_URL}/api/medical-event/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedEvent),
      });

      if (!response.ok) throw new Error("Failed to edit event");
      alert("Changes saved successfully");
      router.back();
    } catch (error) {
      console.error("Update failed", error);
      alert("Error updating event");
    }
  };

  const DateField = ({
    value,
    label,
    onPress,
    onClear,
  }: {
    value: string;
    label: string;
    onPress: () => void;
    onClear?: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.inputRow}
    >
      <View style={{ flex: 1 }} pointerEvents="none">
        <Text style={{ color: value ? "#333" : "#7d7c7c", fontSize: 18 }}>
          {value ? getValidDate(value).toDateString() : label}
        </Text>
      </View>

      {value && onClear && (
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            onClear();
          }}
          style={styles.clearIcon}
        >
          <Text style={{ fontSize: 22, color: "#999", fontWeight: "bold" }}>
            ✕
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

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
          <Text style={styles.title}>Edit Record</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Event Name</Text>
            <TextInput
              value={editEventName}
              onChangeText={setEditEventName}
              style={styles.input}
              placeholderTextColor="#7d7c7c"
            />

            <Text style={styles.label}>Date</Text>
            <DateField
              value={editDate}
              label="Select Date"
              onPress={() => {
                setTempDate(getValidDate(editDate));
                setShowDatePicker("date");
              }}
            />

            <Text style={styles.label}>Next Visit</Text>
            <DateField
              value={editNextData}
              label="Select Next Date"
              onPress={() => {
                if (!editNextData || editNextData === "") {
                  setTempDate(new Date());
                } else {
                  setTempDate(getValidDate(editNextData));
                }
                setShowDatePicker("nextDate");
              }}
              onClear={() => setEditNextData("")}
            />

            <Text style={styles.label}>Notes</Text>
            <TextInput
              value={editNotes}
              onChangeText={setEditNotes}
              style={[styles.input, styles.notesInput]}
              placeholderTextColor="#7d7c7c"
              multiline
            />
          </View>

          <View style={styles.iosButtons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => router.back()}
            >
              <Text style={[styles.buttonText, { color: "#3a92c9" }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={saveEdit}
            >
              <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
          </View>

          <DatePicker
            key={showDatePicker}
            visible={showDatePicker !== null}
            date={tempDate}
            onChange={(d) => setTempDate(d)}
            onCancel={() => setShowDatePicker(null)}
            onConfirm={handleConfirm}
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
    paddingTop: 60,
    backgroundColor: "#d0ecf5",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  inputContainer: { marginTop: 10 },
  label: { fontSize: 14, color: "#666", marginBottom: 5, marginLeft: 10 },
  input: {
    height: 55,
    marginBottom: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: 20,
    backgroundColor: "#fff",
    fontSize: 18,
    justifyContent: "center",
    color: "#333",
  },
  inputRow: {
    height: 55,
    marginBottom: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: 20,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  notesInput: { height: 120, textAlignVertical: "top", paddingTop: 12 },
  iosButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 15,
  },
  button: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 55,
    borderRadius: 25,
    elevation: 4,
  },
  cancelButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#3a92c9",
  },
  confirmButton: { backgroundColor: "#3a92c9" },
  buttonText: { fontSize: 18, fontWeight: "700", color: "#fff" },
  clearIcon: { padding: 10, marginRight: -5 },
});
