import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
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
import { AuthProvider, useAuth } from "../context/AuthContext";
import { PetProvider } from "../context/PetContext";

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (isLoading || !navigationState?.key) return;

    const rootSegment = segments[0];
    const isAuthPage =
      rootSegment === "login" || rootSegment === "registration";

    if (!user && !isAuthPage) {
      router.replace("/login");
    } else if (user && isAuthPage) {
      router.replace("/(tabs)");
    }
  }, [user, segments, navigationState?.key, isLoading]);

  if (isLoading) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="registration" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
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
