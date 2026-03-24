import { formattedDate } from "@/assets/utils/dateUtils";
import RemoveModal from "@/components/RemoveModal";
import { scheduleReminder } from "@/components/scheduleReminder";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const API_URL =
  Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";

export default function CurrentMedEvent() {
  const { eventId, petId, categoryName } = useLocalSearchParams();
  const router = useRouter();
  const [curEvent, setCurEvent] = useState<any>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchEvent = async () => {
        try {
          const response = await fetch(
            `${API_URL}/api/medical-event/${eventId}`
          );
          if (!response.ok) throw new Error("Failed to fetch event");

          const data = await response.json();
          setCurEvent(data);

          if (data.next_date) {
            await scheduleReminder(data.event_name, data.next_date);
          }
        } catch (error) {
          console.error("Error fetching event:", error);
        }
      };
      if (eventId) fetchEvent();
    }, [eventId])
  );
  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_URL}/api/medical-event/${eventId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete event");

      setConfirmVisible(false);
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to delete event");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() =>
          router.push({
            pathname: "/editCurrentMedEvent",
            params: { eventId, petId, categoryName },
          })
        }
      >
        <Feather name="edit-3" size={24} color="#3a92c9" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{curEvent?.event_name || "Loading..."}</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Date: </Text>
          <Text style={styles.text}>{formattedDate(curEvent?.date)}</Text>
        </View>

        {curEvent?.next_date && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Next planned date: </Text>
            <Text style={styles.text}>
              {formattedDate(curEvent?.next_date)}
            </Text>
          </View>
        )}

        {curEvent?.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.label}>Notes:</Text>
            <Text style={styles.notesText}>{curEvent.notes}</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.deleteButtonContainer}
        onPress={() => setConfirmVisible(true)}
      >
        <Feather name="trash-2" size={28} color="#d9534f" />
      </TouchableOpacity>

      <RemoveModal
        handleDelete={handleDelete}
        modalText="Are you sure you want to delete this record?"
        confirmVisible={confirmVisible}
        setConfirmVisible={setConfirmVisible}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 100,
    backgroundColor: "#d0ecf5",
  },
  content: {
    padding: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
  },
  label: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3a92c9",
  },
  text: {
    fontSize: 18,
    color: "#444",
  },
  notesContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
  },
  notesText: {
    fontSize: 18,
    color: "#555",
    marginTop: 8,
    lineHeight: 24,
  },
  deleteButtonContainer: {
    position: "absolute",
    width: 55,
    height: 55,
    bottom: 40,
    right: 30,
    backgroundColor: "#fff",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  editButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 50,
    elevation: 3,
    zIndex: 10,
  },
});
