import { usePetContext } from "@/context/PetContext";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Pets() {
	const { pets, loading } = usePetContext();
  const router = useRouter();

	function getNoPhotoImage(type: string) {
		const normalizedType = type.toLowerCase();
	
		if (normalizedType === 'cat') {
			return require('../../assets/images/no-photo-cat.png');
		} else if (normalizedType === 'dog') {
			return require('../../assets/images/no-photo-dog.png');
		} else {
			return require('../../assets/images/no-photo.png');
		}
	}
	
  return (
    <View style={[styles.container, { flex: 1 }]}>
      <FlatList
        data={pets}
        keyExtractor={(pet) => pet.id.toString()}
				renderItem={({ item }) => (
					<TouchableOpacity
						onPress={() =>
							router.push({ pathname: "/petInfo", params: { petId: item.id } })
						}
						style={styles.petItemWrapper}
					>
						<View style={styles.photoWrapper}>
							{item.photo
								? <Image source={item.photo} style={styles.photo} />
								: <Image source={getNoPhotoImage(item.type)} style={styles.photo} />
							}
						</View>
						<Text style={styles.name}>{item.name}</Text>
						<Text style={styles.type}>{item.type}</Text>
					</TouchableOpacity>
				)}
        ListEmptyComponent={
					<View style={styles.listEmptyContainer}>
						{loading 
							? <Text style={styles.listEmptyText}>Wait a little bit🙏</Text> 
							: <Text style={styles.listEmptyText}>There are no pets yet😿</Text>
						}
					</View>
				}
        ListFooterComponent={
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push({ pathname: "/addPet" })}
          >
            <Text style={styles.addButtonText}>Add Pet</Text>
          </TouchableOpacity>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
		paddingTop: 80,
    backgroundColor: "#d0ecf5",
  },
  petItemWrapper: {
    backgroundColor: "#e6f2f8",
    borderRadius: 20,
    marginBottom: 20,
    paddingVertical: 15,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    alignItems: "center",
  },
  photoWrapper: {
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  photo: {
    width: "100%",
    height: 220,
    borderRadius: 20,
    resizeMode: "cover",
  },
  name: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    marginBottom: 4,
  },
  type: {
    fontSize: 20,
    color: "#777",
    fontWeight: "500",
    textAlign: "center",
  },
  addButton: {
    backgroundColor: "#3a92c9",
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 30,
    marginHorizontal: 30,
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
	listEmptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		height: 300,
		paddingHorizontal: 20,
	},
	listEmptyText: {
		fontSize: 28,
		color: "#555",
		fontWeight: "600",
		textAlign: "center",
	},
});