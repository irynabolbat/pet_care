import { petType } from "@/assets/types/types";
import { usePetContext } from "@/context/PetContext";
import { Feather } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import RemoveModal from "@/components/RemoveModal";
import { formattedDate, getCurrentAge } from "../../assets/utils/dateUtils";

const API_URL =
  Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";

export default function PetInfo() {
  const { petId } = useLocalSearchParams();
  const { pets, setPets } = usePetContext();
  const [pet, setPet] = useState<petType | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchPetDetails = async () => {
        try {
          const url = `${API_URL}/api/pets/${petId}`;
          console.log("Fetching from:", url);

          const response = await fetch(url);

          if (!response.ok) {
            const text = await response.text();
            console.error("Server error text:", text);
            return;
          }

          const data = await response.json();
          console.log("Success! Data received:", data);
          setPet(data);
        } catch (error) {
          console.error("Network or parsing error:", error);
        }
      };

      if (petId) fetchPetDetails();
    }, [petId])
  );

  function getNoPhotoImage(type: string) {
    const normalizedType = type?.toLowerCase();
    if (normalizedType === "cat")
      return require("../../assets/images/no-photo-cat.png");
    if (normalizedType === "dog")
      return require("../../assets/images/no-photo-dog.png");
    return require("../../assets/images/no-photo.png");
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_URL}/api/pets/${petId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete pet");

      setPets((prevPets) => prevPets.filter((p) => p._id !== petId));
      setConfirmVisible(false);
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Error", "Failed to delete pet");
    }
  };

  const medicalCategories = [
    { id: 1, category_name: "vaccine" },
    { id: 2, category_name: "prevention" },
    { id: 3, category_name: "check up" },
    { id: 4, category_name: "other" },
  ];

  console.log("Pet details:", pet);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 50 }}
    >
      <View style={styles.photoWrapper}>
        <Image
          source={
            pet?.photo ? { uri: pet.photo } : getNoPhotoImage(pet?.type || "")
          }
          style={styles.photo}
        />

        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            router.push({ pathname: "/editPet", params: { petId } })
          }
        >
          <Feather name="edit-3" size={24} color="#3a92c9" />
        </TouchableOpacity>
      </View>

      <Text style={styles.name}>{pet?.name || "Loading..."}</Text>
      <Text style={styles.type}>{pet?.type}</Text>
      {pet?.birth_date && (
        <Text style={styles.dob}>
          Birthday: {formattedDate(pet?.birth_date)} (
          {getCurrentAge(pet?.birth_date)})
        </Text>
      )}

      <View style={styles.medicalSection}>
        <Text style={styles.sectionTitle}>Medical Info</Text>

        <View style={styles.grid}>
          {medicalCategories.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.eventCard}
              onPress={() =>
                router.push({
                  pathname: "/categoryInfo",
                  params: {
                    categoryId: item.id,
                    petId,
                    categoryName: item.category_name,
                  },
                })
              }
            >
              <Text style={styles.eventType}>
                {item.category_name.charAt(0).toUpperCase() +
                  item.category_name.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={styles.deleteButtonContainer}
        onPress={() => setConfirmVisible(true)}
      >
        <Feather name="trash-2" size={28} color="#d9534f" />
      </TouchableOpacity>

      <RemoveModal
        handleDelete={handleDelete}
        modalText="Are you sure you want to delete this pet?"
        confirmVisible={confirmVisible}
        setConfirmVisible={setConfirmVisible}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 30,
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#d0ecf5",
  },
  photoWrapper: {
    position: "relative",
    marginTop: 50,
    marginBottom: 16,
  },
  photo: {
    width: "100%",
    height: 240,
    borderRadius: 20,
    resizeMode: "cover",
    backgroundColor: "#e0e0e0",
  },
  editButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#fff",
    borderRadius: 30,
    padding: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  name: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    color: "#333",
    marginBottom: 4,
  },
  type: {
    fontSize: 18,
    textAlign: "center",
    color: "#666",
    marginBottom: 4,
  },
  dob: {
    fontSize: 16,
    textAlign: "center",
    color: "#444",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginVertical: 16,
    color: "#2c3e50",
  },
  list: {
    marginHorizontal: -8,
  },
  row: {
    flex: 1,
    justifyContent: "space-between",
    marginBottom: 12,
  },
  eventCard: {
    backgroundColor: "#3a92c9",
    borderRadius: 25,
    paddingVertical: 35,
    marginHorizontal: 5,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3a92c9",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  eventType: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  deleteButtonContainer: {
    width: 48,
    height: 48,
    bottom: 0,
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
  medicalSection: {
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 8,
  },
});
