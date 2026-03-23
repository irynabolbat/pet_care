import { getValidDate } from "@/assets/utils/getValidDate";
import Avatar from "@/components/Avatar";
import DatePicker from "@/components/DatePicker";
import UploadModal from "@/components/UploadModal";
import { useAuth } from "@/context/AuthContext";
import { usePetContext } from "@/context/PetContext";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import {
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

const API_URL =
  Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";

export default function AddPet() {
  const { setPets } = usePetContext();
  const { user } = useAuth();

  const [image, setImage] = useState<string>("");
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [birthday, setBirthday] = useState("");

  const [modalVisible, setModalVisible] = useState(false);

  const [tempDate, setTempDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const addPet = async (
    name: string,
    type: string,
    birthday: string,
    photo: string
  ) => {
    if (!name || !type) {
      alert("Name and type are required");
      return;
    }

    const newPet = {
      name,
      type,
      birth_date: birthday,
      photo,
      ownerId: user?.id,
    };

    try {
      const response = await fetch(`${API_URL}/api/pets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPet),
      });

      if (!response.ok) throw new Error("Failed to add pet");

      const data = await response.json();
      setPets((prev) => [...prev, data]);
      router.push("/");
    } catch (error) {
      console.error(error);
      alert("Error adding pet");
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

      const launchMethod =
        mode === "camera"
          ? ImagePicker.launchCameraAsync
          : ImagePicker.launchImageLibraryAsync;

      const result = await launchMethod({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled) {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setImage(base64Image);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setModalVisible(false);
    }
  };

  const handleConfirmDate = () => {
    const iso = tempDate.toISOString().split("T")[0];
    setBirthday(iso);
    setShowDatePicker(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Add Pet</Text>
          <Avatar onButtonPress={() => setModalVisible(true)} uri={image} />

          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Pet Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholderTextColor="#7d7c7c"
            />
            <TextInput
              placeholder="Pet Type (e.g. Dog)"
              value={type}
              onChangeText={setType}
              style={styles.input}
              placeholderTextColor="#7d7c7c"
            />

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                setTempDate(getValidDate(birthday));
                setShowDatePicker(true);
              }}
              style={[styles.input, { justifyContent: "center" }]}
            >
              <Text
                style={{ fontSize: 18, color: birthday ? "#333" : "#7d7c7c" }}
              >
                {birthday ? new Date(birthday).toDateString() : "Pet Birthday"}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => addPet(name, type, birthday, image)}
          >
            <Text style={styles.addButtonText}>Save</Text>
          </TouchableOpacity>

          <DatePicker
            visible={showDatePicker}
            date={tempDate}
            onChange={(newDate) => setTempDate(newDate)}
            onCancel={() => setShowDatePicker(false)}
            onConfirm={handleConfirmDate}
          />

          <UploadModal
            modalVisible={modalVisible}
            onBackPress={() => setModalVisible(false)}
            onCameraPress={() => uploadImage("camera")}
            onGalleryPress={() => uploadImage("gallery")}
            onRemovePress={() => {
              setImage("");
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
    paddingTop: 80,
    backgroundColor: "#d0ecf5",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 30,
    color: "#333",
  },
  inputContainer: {
    marginTop: 30,
  },
  input: {
    height: 55,
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
    elevation: 10,
    shadowColor: "#3a92c9",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
