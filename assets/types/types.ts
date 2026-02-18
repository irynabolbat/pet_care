export type eventType = {
  id: string;
  medical_event_id: string;
  event_name: string;
  date: string;
  next_date: string;
  notes: string;
};

export type medicalEventType = {
  id: string;
  animal_id: string;
  category_name: string;
  event_details: eventType[];
};

export type petType = {
  id: string;
  name: string;
  type: string;
  photo: string;
  birth_date: string;
  medical_events: medicalEventType[];
};

// export type userType = {
//   id: string;
//   name: string;
//   sirname: string;
//   email: string;
//   password: string;
//   photo: string;
//   pets: petType[];
// };
// type petsType = petType[];

export type RootStackParamList = {
  Home: undefined;
  PetInfo: { pet: petType };
  AddPet: undefined;
};
