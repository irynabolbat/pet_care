import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import {
  Stack,
  useRootNavigationState,
  useRouter,
  useSegments,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { Platform } from "react-native";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { PetProvider } from "../context/PetContext";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function RootLayoutNav() {
  const { user, isInitializing } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (isInitializing || !navigationState?.key) return;

    const rootSegment = segments[0];
    const isAuthPage =
      rootSegment === "login" || rootSegment === "registration";

    if (!user && !isAuthPage) {
      router.replace("/login");
    } else if (user && isAuthPage) {
      router.replace("/(tabs)");
    }
  }, [user, segments, navigationState?.key, isInitializing]);

  useEffect(() => {
    registerForPushNotificationsAsync();

    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Received notification:", notification);
      }
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("User clicked on the notification:", response);
      });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  if (isInitializing) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen
        name="login"
        options={{
          title: "Login",
          headerShown: true,
        }}
      />

      <Stack.Screen
        name="registration"
        options={{
          title: "Registration",
          headerShown: true,
        }}
      />

      <Stack.Screen
        name="(tabs)"
        options={{
          title: "Your pets",
          headerShown: true,
        }}
      />

      <Stack.Screen
        name="petInfo"
        options={{
          title: "Pet info",
          headerShown: true,
        }}
      />

      <Stack.Screen
        name="editPet"
        options={{
          title: "Edit profile",
          headerShown: true,
        }}
      />

      <Stack.Screen
        name="addPet"
        options={{
          title: "Add pet",
          headerShown: true,
        }}
      />

      <Stack.Screen
        name="categoryInfo"
        options={{
          title: "Info",
          headerShown: true,
        }}
      />

      <Stack.Screen
        name="addMedEvent"
        options={{
          title: "New event",
          headerShown: true,
        }}
      />

      <Stack.Screen
        name="currentMedEvent"
        options={{
          title: "Event",
          headerShown: true,
        }}
      />

      <Stack.Screen
        name="editCurrentMedEvent"
        options={{
          title: "Edit event",
          headerShown: true,
        }}
      />

      <Stack.Screen
        name="+not-found"
        options={{
          title: "Page not found",
          headerShown: true,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <PetProvider>
          <RootLayoutNav />
          <StatusBar style="auto" />
        </PetProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

async function registerForPushNotificationsAsync() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Unable to obtain permission!");
    return;
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }
}
