import { petType } from "@/assets/types/types";
import React, { createContext, useContext, useEffect, useState } from "react";

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

  const fetchPets = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://api.petcare.cyou/v1/animal");
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
  }, []);

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
