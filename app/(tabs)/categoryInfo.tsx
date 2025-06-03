import { medicalEventType } from "@/assets/types/types";
import { formattedDate } from "@/assets/utils/dateUtils";
import { usePetContext } from "@/context/PetContext";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity
} from "react-native";

export default function CategoryInfo() {
  const { categoryId } = useLocalSearchParams();
  const { pets } = usePetContext();
  const [category, setCategory] = useState<medicalEventType | null>(null);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await fetch(
          `https://api.petcare.cyou/v1/medical_events/${categoryId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch pet");
        }

        const data = await response.json();
        setCategory(data);
      } catch (error) {
        console.error("Error fetching pet:", error);
      }
    };
    fetchPets();
  }, [categoryId, category]);

  const pet = pets.filter((pet) => pet.id === category?.animal_id)[0];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.name}>{pet?.name ?? ""}</Text>

      <Text style={styles.sectionTitle}>
        {(category?.category_name ?? "").charAt(0).toUpperCase() +
          (category?.category_name ?? "").slice(1)}
      </Text>

      <FlatList
        data={category?.event_details}
        keyExtractor={(item) => item?.id.toString()}
        renderItem={({ item }) => (
          // <View style={styles.eventCard}>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/currentMedEvent",
                params: { eventId: item.id, categoryId },
              })
            }
            style={styles.eventCard}
          >
            <Text style={styles.eventType}>{item?.event_name}</Text>
            <Text>
              <Text style={styles.label}>Date: </Text>
              {formattedDate(item?.date)}
            </Text>

            <Text>
              <Text style={styles.label}>Next date: </Text>
              {formattedDate(item?.next_date)}
            </Text>

            {item?.notes ? (
              <Text>
                <Text style={styles.label}>Notes: </Text>
                {item?.notes}
              </Text>
            ) : null}
            {/* </View> */}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No events yet</Text>}
        ListFooterComponent={
          <TouchableOpacity
            style={styles.addButton}
            onPress={() =>
              router.push({
                pathname: "/addMedEvent",
                params: {
                  petId: pet?.id,
                  petName: pet?.name,
                  categoryId,
                  categoryName: category?.category_name,
                },
              })
            }
          >
            <Text style={styles.addButtonText}>Add Record</Text>
          </TouchableOpacity>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </ScrollView>
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
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
    color: "#444",
    marginVertical: 20,
  },
  eventCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  eventType: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  empty: {
    textAlign: "center",
    color: "#999",
    fontSize: 16,
    marginTop: 30,
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
  label: {
    fontWeight: "600",
  },
});
