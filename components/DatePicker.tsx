import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type DatePickerProps = {
  visible: boolean;
  date: Date;
  onChange: (date: Date) => void;
  onCancel: () => void;
  onConfirm: () => void;
  maximumDate?: Date;
  minimumDate?: Date;
};

export default function DatePicker({
  visible,
  date,
  onChange,
  onCancel,
  onConfirm,
  maximumDate,
  minimumDate,
}: DatePickerProps) {
  const isDateValid = date instanceof Date && !isNaN(date.getTime());
  const safeDate = isDateValid ? date : new Date();

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === "set" && selectedDate) {
      selectedDate.setHours(12, 0, 0, 0);
      onChange(selectedDate);
    }

    if (Platform.OS === "android") {
      event.type === "set" ? onConfirm() : onCancel();
    }
  };

  if (Platform.OS === "ios") {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <DateTimePicker
              mode="date"
              display="spinner"
              value={safeDate}
              onChange={handleChange}
              themeVariant="light"
              maximumDate={maximumDate}
              minimumDate={minimumDate}
              style={styles.datePickerIOS}
            />
            <View style={styles.iosButtons}>
              <TouchableOpacity
                style={[styles.pickerButton, { backgroundColor: "#eee" }]}
                onPress={onCancel}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.pickerButton, { backgroundColor: "#3a92c9" }]}
                onPress={onConfirm}
              >
                <Text style={styles.confirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    visible && (
      <DateTimePicker
        mode="date"
        display="default"
        value={safeDate}
        onChange={handleChange}
        maximumDate={maximumDate}
        minimumDate={minimumDate}
      />
    )
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 20,
    width: "85%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  datePickerIOS: {
    height: 200,
    width: 300,
  },
  iosButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 15,
  },
  pickerButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 15,
    marginHorizontal: 8,
  },
  cancelText: {
    color: "#555",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
