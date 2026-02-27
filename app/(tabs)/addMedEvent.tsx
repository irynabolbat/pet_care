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

const API_URL =
  Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";

export default function AddMedEvent() {
  const { petId, petName, categoryName } = useLocalSearchParams();

  const [name, setName] = useState("");
  const [data, setData] = useState("");
  const [nextData, setNextData] = useState("");
  const [notes, setNotes] = useState("");

  const [showDatePicker, setShowDatePicker] = useState<
    null | "date" | "nextDate"
  >(null);
  const [tempDate, setTempDate] = useState(new Date());

  const handleConfirm = () => {
    const iso = tempDate.toISOString().split("T")[0];
    if (showDatePicker === "date") setData(iso);
    if (showDatePicker === "nextDate") setNextData(iso);
    setShowDatePicker(null);
  };

  const createEvent = async () => {
    console.log("Submitting with petId:", petId);

    if (!name || !data) {
      alert("Please fill in name and date.");
      return;
    }

    const newEvent = {
      petId: petId,
      category_name: categoryName,
      event_name: name,
      date: data,
      next_date: nextData,
      notes,
    };

    try {
      const response = await fetch(`${API_URL}/api/medical`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save");
      }

      alert("Event saved successfully");
      router.back();
    } catch (error) {
      console.error("Save failed", error);
      alert(`Error: ${error}`);
    }
  };

  const getMinDate = () => {
    if (showDatePicker === "nextDate" && data) {
      return new Date(data);
    }
    return undefined;
  };

  const getMaxDate = () => {
    const today = new Date();
    if (showDatePicker === "date") {
      return today;
    }
    if (showDatePicker === "nextDate") {
      return new Date(today.setFullYear(today.getFullYear() + 2));
    }
    return undefined;
  };

  const DateField = ({
    value,
    placeholder,
    onPress,
    onClear,
  }: {
    value: string;
    placeholder: string;
    onPress: () => void;
    onClear?: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.input,
        Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {},
      ]}
    >
      <View pointerEvents="none">
        <Text style={{ color: value ? "#333" : "#7d7c7c", fontSize: 18 }}>
          {value ? new Date(value).toDateString() : placeholder}
        </Text>

        {value && onClear ? (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onClear();
            }}
            style={styles.clearIcon}
          >
            <Text
              style={{ color: "#ff4444", fontSize: 20, fontWeight: "bold" }}
            >
              ✕
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
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
          <Text style={styles.title}>
            Add {categoryName} for {petName}
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Record Name (e.g. Rabies Vaccine)"
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholderTextColor="#7d7c7c"
            />

            <DateField
              value={data}
              placeholder="Event Date"
              onPress={() => {
                setTempDate(data ? new Date(data) : new Date());
                setShowDatePicker("date");
              }}
            />

            <DateField
              value={nextData}
              placeholder="Next Date (Optional)"
              onPress={() => {
                setTempDate(nextData ? new Date(nextData) : new Date());
                setShowDatePicker("nextDate");
              }}
              onClear={() => setNextData("")}
            />

            <TextInput
              placeholder="Notes (Medicine brand, dose, etc.)"
              value={notes}
              onChangeText={setNotes}
              style={[styles.input, styles.notesInput]}
              placeholderTextColor="#7d7c7c"
              multiline
            />
          </View>

          <TouchableOpacity style={styles.addButton} onPress={createEvent}>
            <Text style={styles.addButtonText}>Save Record</Text>
          </TouchableOpacity>

          <DatePicker
            visible={showDatePicker !== null}
            date={tempDate}
            onChange={(d) => setTempDate(d)}
            onCancel={() => setShowDatePicker(null)}
            onConfirm={handleConfirm}
            minimumDate={getMinDate()}
            maximumDate={getMaxDate()}
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
    color: "#333",
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
  clearIcon: {
    padding: 5,
    marginLeft: 10,
  },
});
