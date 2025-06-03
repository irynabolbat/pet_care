import Avatar from "@/components/Avatar";
import DatePicker from "@/components/DatePicker";
import UploadModal from "@/components/UploadModal";
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
  View
} from "react-native";

export default function AddPet() {
  const { setPets } = usePetContext();

  const [image, setImage] = useState<string>("");
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [birthday, setBirthday] = useState("");

  const [modalVisible, setModalVisible] = useState(false);

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const addPet = async (
    name: string,
    type: string,
    birthday: string,
    photo: string
  ) => {
    if (!name || !type || !birthday) {
      alert("All fields are required");
      return;
    }

    const newPet = {
      name,
      type,
      birth_date: birthday,
      photo,
    };

    try {
      const response = await fetch("https://api.petcare.cyou/v1/animal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPet),
      });

      if (!response.ok) {
        throw new Error("Failed to add pet");
      }

      const data = await response.json();
      alert("Pet added successfully");
      setPets((prevPets) => [...prevPets, data]);
      setName("");
      setType("");
      setBirthday("");
      setDate(new Date());
      setImage("");
			router.push("/");
    } catch (error) {
      console.error("Error adding pet:", error);
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
        setImage(uri);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setModalVisible(false);
    }
  };

  const removeImage = () => {
    setImage("");
    setModalVisible(false);
  };

  const toggleDatePicker = () => setShowDatePicker(!showDatePicker);

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
              placeholder="Pet Type"
              value={type}
              onChangeText={setType}
              style={styles.input}
              placeholderTextColor="#7d7c7c"
            />

            <TextInput
              placeholder="Pet Birthday"
              value={birthday ? new Date(birthday).toDateString() : ""}
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
                setBirthday(date.toISOString().split("T")[0]);
                toggleDatePicker();
              }}
              
            />
            )}
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => addPet(name, type, birthday, image)}
          >
            <Text style={styles.addButtonText}>Save</Text>
          </TouchableOpacity>

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
});
