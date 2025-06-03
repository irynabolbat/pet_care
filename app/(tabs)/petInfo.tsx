import { petType } from "@/assets/types/types";
import { usePetContext } from "@/context/PetContext";
import { Feather } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import RemoveModal from "@/components/RemoveModal";
import { formattedDate, getCurrentAge } from "../../assets/utils/dateUtils";

export default function PetInfo() {
  const { petId } = useLocalSearchParams();
  const { setPets } = usePetContext();
  const [pet, setPet] = useState<petType | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchPets = async () => {
        try {
          const response = await fetch(
            `https://api.petcare.cyou/v1/animal/${petId}`
          );
  
          if (!response.ok) {
            throw new Error("Failed to fetch pet");
          }
  
          const data = await response.json();
          setPet(data);
        } catch (error) {
          console.error("Error fetching pet:", error);
        }
      };
  
      fetchPets();
    }, [petId])
  );

  function getNoPhotoImage(type: string) {
    const normalizedType = type.toLowerCase();

    if (normalizedType === "cat") {
      return require("../../assets/images/no-photo-cat.png");
    } else if (normalizedType === "dog") {
      return require("../../assets/images/no-photo-dog.png");
    } else {
      return require("../../assets/images/no-photo.png");
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `https://api.petcare.cyou/v1/animal/${petId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete pet");
      }

      setPets((prevPets) => prevPets.filter((p) => p.id !== pet?.id));

      setConfirmVisible(false);
      router.push("/");
    } catch (error) {
      Alert.alert("Error", "Failed to delete pet");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.photoWrapper}>
        {pet?.photo ? (
          <Image source={{ uri: pet.photo }} style={styles.photo} />
        ) : (
          <Image
            source={getNoPhotoImage(pet?.type || "")}
            style={styles.photo}
          />
        )}

        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            router.push({ pathname: "/editPet", params: { petId: pet?.id } })
          }
        >
          <Feather name="edit-3" size={24} color="#0275d8" />
        </TouchableOpacity>
      </View>

      <Text style={styles.name}>{pet?.name}</Text>
      <Text style={styles.type}>{pet?.type}</Text>
      <Text style={styles.dob}>
        Birthday: {formattedDate(pet?.birth_date)} (
        {getCurrentAge(pet?.birth_date)})
      </Text>

      <Text style={styles.sectionTitle}>Medical Info</Text>

      <FlatList
        data={[...(pet?.medical_events || [])].sort((a, b) => {
          const order = ["vaccine", "prevention", "check up", "other"];
          return (
            order.indexOf(a.category_name) - order.indexOf(b.category_name)
          );
        })}
        style={styles.list}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.eventCard}
            onPress={() =>
              router.push({
                pathname: "/categoryInfo",
                params: {
                  categoryId: item.id,
                  petId: pet?.id,
                  categoryName: item?.category_name,
                },
              })
            }
          >
            <Text style={styles.eventType}>
              {item?.category_name?.charAt(0).toUpperCase() +
                item?.category_name?.slice(1)}
            </Text>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <TouchableOpacity
            style={styles.deleteButtonContainer}
            onPress={() => setConfirmVisible(true)}
          >
            <Feather name="trash-2" size={28} color="#d9534f" />
          </TouchableOpacity>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <RemoveModal
        handleDelete={handleDelete}
        modalText="Are you sure you want to delete this pet account?"
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
});
