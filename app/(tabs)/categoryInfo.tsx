import { eventType } from "@/assets/types/types";
import { formattedDate } from "@/assets/utils/dateUtils";
import { usePetContext } from "@/context/PetContext";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const API_URL =
  Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";

export default function CategoryInfo() {
  const { petId, categoryName } = useLocalSearchParams();
  const { pets } = usePetContext();
  const [events, setEvents] = useState<eventType[]>([]);

  const pet = useMemo(() => pets.find((p) => p._id === petId), [pets, petId]);

  useEffect(() => {
    const fetchMedicalEvents = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/medical/${petId}/${categoryName}`
        );
        if (!response.ok) throw new Error("Failed to fetch events");

        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("Error fetching medical events:", error);
      }
    };

    if (petId && categoryName) fetchMedicalEvents();
  }, [petId, categoryName]);

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{pet?.name ?? "Pet's Health"}</Text>
      <Text style={styles.sectionTitle}>
        {String(categoryName).charAt(0).toUpperCase() +
          String(categoryName).slice(1)}
      </Text>

      <FlatList
        data={events}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/currentMedEvent",
                params: { eventId: item._id, petId },
              })
            }
            style={styles.eventCard}
          >
            <Text style={styles.eventType}>{item.event_name}</Text>

            <View style={styles.row}>
              <Text style={styles.label}>Date: </Text>
              <Text>{formattedDate(item.date)}</Text>
            </View>

            {item.next_date && (
              <View style={styles.row}>
                <Text style={styles.label}>Next date: </Text>
                <Text>{formattedDate(item.next_date)}</Text>
              </View>
            )}

            {item.notes && (
              <Text style={styles.notes} numberOfLines={2}>
                <Text style={styles.label}>Notes: </Text>
                {item.notes}
              </Text>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No records found</Text>}
        ListFooterComponent={
          <TouchableOpacity
            style={styles.addButton}
            onPress={() =>
              router.push({
                pathname: "/addMedEvent",
                params: {
                  petId: pet?._id,
                  categoryName: categoryName,
                },
              })
            }
          >
            <Text style={styles.addButtonText}>+ Add Record</Text>
          </TouchableOpacity>
        }
        contentContainerStyle={{ paddingBottom: 50 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#d0ecf5",
  },
  name: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    color: "#333",
    marginTop: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    color: "#555",
    marginBottom: 20,
  },
  eventCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventType: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3a92c9",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    marginBottom: 4,
  },
  label: {
    fontWeight: "600",
    color: "#444",
  },
  notes: {
    marginTop: 4,
    color: "#666",
    fontStyle: "italic",
  },
  empty: {
    textAlign: "center",
    color: "#999",
    marginTop: 40,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: "#3a92c9",
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
