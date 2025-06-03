import placeholder from "@/assets/images/placeholder.png";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

type AvatarProps = {
	uri: string | null,
	imgStyle?: object,
	onPress?: () => void,
	onButtonPress?: () => void,
	aviOnly?: boolean
}

export default function Avatar({
	uri,
	imgStyle,
	onPress,
	onButtonPress,
	aviOnly = false,
}: AvatarProps) {

  return (
		<View style={styles.container}>
      <TouchableOpacity onPress={onPress}>
        <Image
          source={uri ? { uri } : placeholder}
          style={[
            styles.image,
            aviOnly && styles.aviOnlyImage,
            imgStyle
          ]}
        />

        {!aviOnly && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={onButtonPress}
          >
            <MaterialCommunityIcons
              name="camera-outline"
              size={30}
              color="black"
            />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
	container: {
		position: "relative",
		alignItems: "center",
		justifyContent: "center",
	},
	image: {
		width: 300,
		height: 200,
		borderRadius: 20,
		borderWidth: 3,
		borderColor: "#555",
		resizeMode: "cover",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.1,
		shadowRadius: 10,
		elevation: 5,
	},
	aviOnlyImage: {
		width: 50,
		height: 50,
		borderRadius: 25,
		borderWidth: 2,
		borderColor: "#3a92c9",
	},
	editButton: {
		position: "absolute",
		right: 8,
		bottom: 8,
		backgroundColor: "#e6f2f8",
		borderRadius: 20,
		padding: 6,
		shadowColor: "#3a92c9",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.4,
		shadowRadius: 6,
		elevation: 5,
	},
});