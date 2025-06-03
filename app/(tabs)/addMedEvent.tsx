import DatePicker from "@/components/DatePicker";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
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

export default function AddMedEvent() {
  const { petId, petName, categoryId, categoryName } = useLocalSearchParams();

  const [name, setName] = useState("");
  const [data, setData] = useState("");
  const [nextData, setNextData] = useState("");
  const [notes, setNotes] = useState("");

  const [showDatePicker, setShowDatePicker] = useState<
    null | "date" | "nextDate"
  >(null);
  const [tempDate, setTempDate] = useState(new Date());

  const handleDateChange = (date: Date) => {
    const iso = date.toISOString().split("T")[0];
    if (showDatePicker === "date") setData(iso);
    if (showDatePicker === "nextDate") setNextData(iso);
    setTempDate(date);
  };

  const handleCancel = () => {
    setShowDatePicker(null);
  };

  const handleConfirm = () => {
    const iso = tempDate.toISOString().split("T")[0];
    if (showDatePicker === "date") setData(iso);
    if (showDatePicker === "nextDate") setNextData(iso);
    setShowDatePicker(null);
  };

  const createEvent = async () => {
    if (!name || !data) {
      alert("Please fill in name and date.");
      return;
    }

    const newEvent = {
      event_name: name,
      date: data,
      next_date: nextData,
      notes,
    };

    try {
      const response = await fetch(
        `https://api.petcare.cyou/v1/event/${categoryId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newEvent),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save event");
      }

      // const data = await response.json();
      // setEvents((prevPets) => [...prevPets, data]);
      alert("Event saved successfully");
      setName("");
      setData("");
      setNextData("");
      setNotes("");
      router.push({
        pathname: "/categoryInfo",
        params: { categoryId, petId, categoryName },
      });
    } catch (error) {
      console.error("Save failed", error);
      alert("Error saving event");
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
          <Text style={styles.title}>
            Add {categoryName} {categoryName === 'other' ? 'event ' : ''}for {petName}
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Med Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholderTextColor="#7d7c7c"
            />

            <TouchableOpacity
              onPress={() => {
                setTempDate(data ? new Date(data) : new Date());
                setShowDatePicker("date");
              }}
              style={styles.input}
            >
              <Text style={{ color: data ? "#333" : "#7d7c7c", fontSize: 18 }}>
                {data ? new Date(data).toDateString() : "Select Date"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setTempDate(nextData ? new Date(nextData) : new Date());
                setShowDatePicker("nextDate");
              }}
              style={styles.input}
            >
              <Text
                style={{ color: nextData ? "#333" : "#7d7c7c", fontSize: 18 }}
              >
                {nextData
                  ? new Date(nextData).toDateString()
                  : "Select Next Date"}
              </Text>
            </TouchableOpacity>

            <TextInput
              placeholder="Notes"
              value={notes}
              onChangeText={setNotes}
              style={[styles.input, styles.notesInput]}
              placeholderTextColor="#7d7c7c"
              multiline
            />
          </View>

          <TouchableOpacity style={styles.addButton} onPress={createEvent}>
            <Text style={styles.addButtonText}>Save</Text>
          </TouchableOpacity>

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
  }
});
