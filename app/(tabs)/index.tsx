import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity } from "react-native";
import Pets from "./pets";

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    signOut();
    router.replace("/login");
  };
  return (
    <>
      <ThemedView style={styles.container}>
        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <ThemedText style={styles.buttonText}>Logout</ThemedText>
        </TouchableOpacity>
      </ThemedView>
      <Pets />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 40,
    paddingEnd: 20,
    backgroundColor: "#d0ecf5",
    height: 150,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: "#3a92c9",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
