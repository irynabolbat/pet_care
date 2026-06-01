import { petType } from "@/assets/types/types";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { API_URL } from "@/constants/Api";

type PetContextType = {
  pets: petType[];
  setPets: React.Dispatch<React.SetStateAction<petType[]>>;
  fetchPets: () => Promise<void>;
  loading: boolean;
};

const PetContext = createContext<PetContextType | undefined>(undefined);

export const PetProvider = ({ children }: { children: React.ReactNode }) => {
  const [pets, setPets] = useState<petType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { user } = useAuth();


  const fetchPets = async () => {
    if (!user?.id) {
      setPets([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/pets/mine/${user.id}`);
      if (!response.ok) throw new Error("Failed to fetch pets");

      const data = await response.json();
      setPets(data);
    } catch (error) {
      console.error("Error fetching pets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, [user?.id]);

  return (
    <PetContext.Provider value={{ pets, setPets, fetchPets, loading }}>
      {children}
    </PetContext.Provider>
  );
};

export const usePetContext = () => {
  const context = useContext(PetContext);
  if (!context) {
    throw new Error("usePetContext must be used within a PetProvider");
  }
  return context;
};
