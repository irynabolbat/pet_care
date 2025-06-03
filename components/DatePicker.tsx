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
};

export default function DatePicker({
  visible,
  date,
  onChange,
  onCancel,
  onConfirm,
	maximumDate,
}: DatePickerProps) {
  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === "set" && selectedDate) {
      // Устанавливаем время на 12:00, чтобы избежать сдвига даты
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
              value={date}
              onChange={handleChange}
              themeVariant="dark"
              maximumDate={maximumDate || new Date()}
              style={[styles.datePicker, { backgroundColor: "#3a92c9" }]}
            />
            <View style={styles.iosButtons}>
              <TouchableOpacity
                style={[styles.pickerButton, { backgroundColor: "#eee" }]}
                onPress={onCancel}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.pickerButton, { backgroundColor: "#3a92c9" }]}
                onPress={onConfirm}
              >
                <Text style={{ color: "#fff" }}>Confirm</Text>
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
        value={date}
        onChange={handleChange}
        maximumDate={maximumDate}
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
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  datePicker: {
    height: 200,
    marginBottom: 10,
    backgroundColor: "#e6f2f8",
    borderRadius: 10,
  },
  iosButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 10,
  },
  pickerButton: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 10,
  },
});
