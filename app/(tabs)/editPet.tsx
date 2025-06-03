import { petType } from "@/assets/types/types";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
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

import Avatar from "@/components/Avatar";
import DatePicker from "@/components/DatePicker";
import UploadModal from "@/components/UploadModal";
import { usePetContext } from "@/context/PetContext";

export default function EditPet() {
  const { petId } = useLocalSearchParams();
  const { setPets } = usePetContext();

  const [pet, setPet] = useState<petType | null>(null);

  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("");
  const [editBirthday, setEditBirthday] = useState("");
  const [editImage, setEditImage] = useState("");

  const [modalVisible, setModalVisible] = useState(false);

  const [date, setDate] = useState(new Date());

  const [showDatePicker, setShowDatePicker] = useState(false);

  const toggleDatePicker = () => setShowDatePicker(!showDatePicker);

  useEffect(() => {
    if (pet) {
      setEditName(pet.name);
      setEditType(pet.type);
      setEditBirthday(pet.birth_date);
      setEditImage(pet.photo);

      setDate(new Date(pet.birth_date));
    }
  }, [pet]);
  

  useEffect(() => {
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
  }, [petId]);

  const editPet = async () => {
    if (!pet) return;

    try {
      const updatedData = {
        name: editName,
        type: editType,
        birth_date: editBirthday,
        photo: editImage,
      };

      const response = await fetch(
        `https://api.petcare.cyou/v1/animal/${pet.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update pet");
      }

      const updatedPet = await response.json();
      setPet(updatedPet);
      setPets((prev) =>
        prev.map((p) => (p.id === updatedPet.id ? updatedPet : p))
      );
      router.push({ pathname: "/petInfo", params: { petId: pet.id } });
    } catch (error) {
      Alert.alert("Error", "Failed to save pet info");
    }
  };

  const uploadImage = async (mode: "camera" | "gallery") => {
    try {
      const permissionResult =
        mode === "camera"
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        alert("Permission to access media is required!");
        return;
      }

      const result = await (mode === "camera"
        ? ImagePicker.launchCameraAsync
        : ImagePicker.launchImageLibraryAsync)({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setEditImage(uri);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setModalVisible(false);
    }
  };

  const removeImage = () => {
    setEditImage("");
    setModalVisible(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Edit Pet Info</Text>
          <Avatar
            onButtonPress={() => setModalVisible(true)}
            uri={editImage}
          />

          <View style={styles.inputContainer}>
            <TextInput
              value={editName}
              onChangeText={setEditName}
              style={styles.input}
              placeholderTextColor="#7d7c7c"
            />
            <TextInput
              value={editType}
              onChangeText={setEditType}
              style={styles.input}
              placeholderTextColor="#7d7c7c"
            />
            <TextInput
              value={editBirthday ? new Date(editBirthday).toDateString() : ""}
              editable={false}
              onPressIn={toggleDatePicker}
              style={styles.input}
              placeholderTextColor="#7d7c7c"
            />

            {showDatePicker && (
              <DatePicker
                visible={showDatePicker}
                date={date}
                onChange={(newDate) => setDate(newDate)}
                onCancel={toggleDatePicker}
                onConfirm={() => {
                  setEditBirthday(date.toISOString().split("T")[0]);
                  toggleDatePicker();
                }}
              />
            )}
          </View>

          <View style={styles.iosButtons}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#3a92c9" }]}
              onPress={() => router.push({ pathname: "/petInfo", params: { petId: pet?.id } })}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#008000" }]}
              onPress={editPet}
            >
              <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
          </View>

          <UploadModal
            modalVisible={modalVisible}
            onBackPress={() => setModalVisible(false)}
            onCameraPress={() => uploadImage("camera")}
            onGalleryPress={() => uploadImage("gallery")}
            onRemovePress={removeImage}
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
    borderRadius: 16,
    paddingVertical: 35,
    marginHorizontal: 5,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3a92c9",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  eventType: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  deleteButtonContainer: {
    position: "absolute",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    elevation: 5,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalCancel: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
  modalConfirm: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
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
    color: "#333",
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
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 30,
    color: "#333",
  },
  iosButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 20,
  },
  button: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 25,
    shadowColor: "#3a92c9",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
