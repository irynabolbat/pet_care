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

const API_URL =
  Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";

export default function EditPet() {
  const { petId } = useLocalSearchParams();
  const { setPets } = usePetContext();

  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("");
  const [editBirthday, setEditBirthday] = useState("");
  const [editImage, setEditImage] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const toggleDatePicker = () => setShowDatePicker(!showDatePicker);

  useEffect(() => {
    const fetchPetData = async () => {
      try {
        console.log("Fetching pet for edit:", petId);
        const response = await fetch(`${API_URL}/api/pets/${petId}`);

        if (!response.ok) throw new Error("Failed to fetch pet details");

        const data = await response.json();

        setEditName(data.name || "");
        setEditType(data.type || "");
        setEditBirthday(data.birth_date || "");
        setEditImage(data.photo || "");

        if (data.birth_date) {
          setDate(new Date(data.birth_date));
        }
      } catch (error) {
        console.error("Error fetching pet for edit:", error);
        Alert.alert("Error", "Could not load pet data");
      }
    };

    if (petId) fetchPetData();
  }, [petId]);

  const savePetChanges = async () => {
    if (!editName.trim() || !editType.trim()) {
      Alert.alert("Wait", "Name and Type are required!");
      return;
    }

    try {
      const updatedData = {
        name: editName,
        type: editType,
        birth_date: editBirthday,
        photo: editImage,
      };

      const response = await fetch(`${API_URL}/api/pets/${petId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error("Failed to update pet");

      const updatedPet = await response.json();

      setPets((prev) => prev.map((p) => (p._id === petId ? updatedPet : p)));

      Alert.alert("Success", "Pet info updated!");
      router.back();
    } catch (error) {
      console.error("Save error:", error);
      Alert.alert("Error", "Failed to save changes");
    }
  };

  const uploadImage = async (mode: "camera" | "gallery") => {
    try {
      const permissionResult =
        mode === "camera"
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert("Permission required", "We need access to your photos!");
        return;
      }

      const result = await (mode === "camera"
        ? ImagePicker.launchCameraAsync
        : ImagePicker.launchImageLibraryAsync)({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled) {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setEditImage(base64Image);
      }
    } catch (error) {
      console.error("Image upload error:", error);
    } finally {
      setModalVisible(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 50 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Edit Profile</Text>

          <Avatar onButtonPress={() => setModalVisible(true)} uri={editImage} />

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              value={editName}
              onChangeText={setEditName}
              style={styles.input}
              placeholder="Pet Name"
            />

            <Text style={styles.label}>Species</Text>
            <TextInput
              value={editType}
              onChangeText={setEditType}
              style={styles.input}
              placeholder="Dog"
            />

            <Text style={styles.label}>Birthday</Text>
            <TouchableOpacity
              onPress={toggleDatePicker}
              style={styles.dateInput}
            >
              <Text
                style={{
                  fontSize: 18,
                  color: editBirthday ? "#333" : "#7d7c7c",
                }}
              >
                {editBirthday
                  ? new Date(editBirthday).toLocaleDateString()
                  : "Select date"}
              </Text>
            </TouchableOpacity>

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

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: "#fff",
                  borderWidth: 1,
                  borderColor: "#3a92c9",
                },
              ]}
              onPress={() => router.back()}
            >
              <Text style={[styles.buttonText, { color: "#3a92c9" }]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#3a92c9" }]}
              onPress={savePetChanges}
            >
              <Text style={styles.buttonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>

          <UploadModal
            modalVisible={modalVisible}
            onBackPress={() => setModalVisible(false)}
            onCameraPress={() => uploadImage("camera")}
            onGalleryPress={() => uploadImage("gallery")}
            onRemovePress={() => {
              setEditImage("");
              setModalVisible(false);
            }}
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
    paddingTop: 40,
    backgroundColor: "#d0ecf5",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  inputContainer: { marginTop: 20 },
  label: { fontSize: 14, color: "#666", marginBottom: 5, marginLeft: 10 },
  input: {
    height: 55,
    marginBottom: 20,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#fff",
    fontSize: 18,
    color: "#333",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  dateInput: {
    height: 55,
    justifyContent: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 15,
  },
  button: {
    flex: 1,
    height: 55,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 25,
    elevation: 2,
  },
  buttonText: { fontSize: 18, fontWeight: "700", color: "#fff" },
});
