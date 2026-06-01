import { Platform } from "react-native";

const PRODUCTION_API_URL = "https://petcare-production-227c.up.railway.app";

export const API_URL =
  PRODUCTION_API_URL ||
  (Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000");
