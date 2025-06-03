import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type UploadModalProps = {
	modalVisible: boolean,
	onBackPress?: () => void,
	onCameraPress?: () => void,
	onGalleryPress?: () => void,
	onRemovePress?: () => void,
	isLoading?: boolean,
}

export default function UploadModal({
  modalVisible,
  onBackPress,
  onCameraPress,
  onGalleryPress,
  onRemovePress,
  isLoading = false,
}: UploadModalProps) {
  return (
    <Modal animationType="slide" transparent visible={modalVisible}>
      <Pressable style={styles.container} onPress={onBackPress}>
        <View style={styles.modalView}>
          <Text style={{ fontSize: 18, marginBottom: 12 }}>Upload photo</Text>
          <View style={styles.decisionRow}>
            <TouchableOpacity style={styles.optionBtn} onPress={onCameraPress}>
              <MaterialCommunityIcons name="camera-outline" size={30} />
              <Text>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionBtn} onPress={onGalleryPress}>
              <MaterialCommunityIcons name="image-outline" size={30} />
              <Text>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionBtn} onPress={onRemovePress}>
              <MaterialCommunityIcons name="trash-can-outline" size={30} />
              <Text>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}


const styles = StyleSheet.create({
	container: {
		flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
	},
	modalView: {
		backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    width: 300,
    alignItems: "center",
	},
	decisionRow: {
		flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
	},
	optionBtn : {
		alignItems: "center",
    flex: 1,
	}
});
