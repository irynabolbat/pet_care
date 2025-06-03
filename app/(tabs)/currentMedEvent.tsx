import { eventType } from "@/assets/types/types";
import { formattedDate } from "@/assets/utils/dateUtils";
import RemoveModal from "@/components/RemoveModal";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
	Alert,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

export default function CurrentMedEvent() {
  const { eventId, categoryId } = useLocalSearchParams();
  const router = useRouter();
  const [curEvent, setCurEvent] = useState<eventType | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
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
    }, [eventId])
  );

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `https://api.petcare.cyou/v1/event/${eventId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete event");
      }

      setCurEvent(null);
      setConfirmVisible(false);
      router.push({ pathname: "/categoryInfo", params: { categoryId } });
    } catch (error) {
      Alert.alert("Error", "Failed to delete event");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() =>
          router.push({ pathname: "/editCurrentMedEvent", params: { eventId } })
        }
      >
        <Feather name="edit-3" size={24} color="#0275d8" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{curEvent?.event_name}</Text>
        <Text style={styles.text}>
          <Text style={styles.label}>Date: </Text>
          {formattedDate(curEvent?.date)}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.label}>Next date: </Text>
          {formattedDate(curEvent?.next_date)}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.label}>Notes: </Text>
          {curEvent?.notes}
        </Text>
      </ScrollView>

      <TouchableOpacity
        style={styles.deleteButtonContainer}
        onPress={() => setConfirmVisible(true)}
      >
        <Feather name="trash-2" size={28} color="#d9534f" />
      </TouchableOpacity>

      <RemoveModal
        handleDelete={handleDelete}
        modalText="Are you sure you want to delete this event?"
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
    paddingTop: 120,
    backgroundColor: "#d0ecf5",
  },
  content: {
    padding: 20,
    paddingTop: 0,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    justifyContent: "center",
    textAlign: "center",
  },
  text: {
    fontSize: 20,
    marginBottom: 12,
    color: "#444",
  },
  label: {
    fontWeight: "bold",
    color: "#222",
  },
  deleteButtonContainer: {
    width: 48,
    height: 48,
    bottom: 100,
    left: 20,
    backgroundColor: "#fff",
    borderRadius: 50,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  editButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "white",
    padding: 8,
    borderRadius: 50,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    zIndex: 10,
  },
});
