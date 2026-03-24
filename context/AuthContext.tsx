import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";

type AuthContextType = {
  user: any | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
  isInitializing: boolean;
  isAuthLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL =
  Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const savedUser = await AsyncStorage.getItem("@user_data");
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (e) {
        console.error("Failed to load user", e);
      } finally {
        setIsInitializing(false);
      }
    };

    loadUserData();
  }, []);

  const parseError = (data: any, fallback: string) => {
    return data?.error || data?.message || fallback;
  };

  const signUp = async (name: string, email: string, password: string) => {
    setIsAuthLoading(true);
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(parseError(data, "Registration failed"));
      }

      await signIn(email, password);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsAuthLoading(true);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(parseError(data, "Wrong email or password"));
      }

      await AsyncStorage.setItem("@user_data", JSON.stringify(data.user));
      setUser(data.user);
    } catch (error: any) {
      throw new Error(error.message || "Cannot connect to server");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const signOut = async () => {
    await AsyncStorage.removeItem("@user_data");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        signUp,
        signOut,
        isInitializing,
        isAuthLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
