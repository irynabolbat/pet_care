const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const path = require("path");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/pet_care_db";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Mongo connected"))
  .catch(console.error);

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const PetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  birth_date: { type: String },
  photo: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } 
});

const MedicalEventSchema = new mongoose.Schema({
  petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  category_name: { type: String, required: true },
  event_name: { type: String, required: true },
  date: { type: String, required: true },
  next_date: { type: String },
  notes: { type: String },
});

const User = mongoose.model("User", UserSchema);
const Pet = mongoose.model("Pet", PetSchema);
const MedicalEvent = mongoose.model("MedicalEvent", MedicalEventSchema);

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({
      message: "User created successfully",
      user: { name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    email = String(email).trim().toLowerCase();
    password = String(password);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (!user.password || typeof user.password !== "string") {
      console.error("User has invalid password field:", user);
      return res.status(500).json({ error: "User data corrupted (no password hash)" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    return res.status(200).json({
      message: "Login successful",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: error?.message || "Internal server error" });
  }
});

app.post("/api/pets", async (req, res) => {
  try {
    const { name, type, birth_date, photo, ownerId } = req.body;

    const newPet = new Pet({
      name,
      type,
      birth_date,
      photo,
      owner: ownerId
    });

    await newPet.save();
    res.status(201).json(newPet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add pet" });
  }
});

app.get("/api/pets/mine/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const pets = await Pet.find({ owner: userId });
    
    const formattedPets = pets.map(pet => ({
      _id: pet._id,
      name: pet.name,
      type: pet.type,
      birth_date: pet.birth_date,
      photo: pet.photo
    }));

    res.json(formattedPets);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/pets/:petId", async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.petId);
    if (!pet) return res.status(404).json({ error: "Pet not found" });
    res.json(pet);
  } catch (err) {
    res.status(500).json({ error: "Invalid ID format" });
  }
});

app.delete("/api/pets/:petId", async (req, res) => {
  try {
    await Pet.findByIdAndDelete(req.params.petId);
    res.json({ message: "Pet deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete" });
  }
});

app.put("/api/pets/:petId", async (req, res) => {
  try {
    const { name, type, birth_date, photo } = req.body;
    
    const updatedPet = await Pet.findByIdAndUpdate(
      req.params.petId,
      { name, type, birth_date, photo },
      { new: true }
    );

    if (!updatedPet) return res.status(404).json({ error: "Pet not found" });
    
    res.json(updatedPet);
  } catch (error) {
    console.error("Update pet error:", error);
    res.status(500).json({ error: "Failed to update pet" });
  }
});

app.get("/api/medical/:petId/:categoryName", async (req, res) => {
  try {
    const { petId, categoryName } = req.params;
    const events = await MedicalEvent.find({ petId, category_name: categoryName });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

app.post("/api/medical", async (req, res) => {
  try {
    const { petId, category_name, event_name, date, next_date, notes } = req.body;

    if (!petId) {
      return res.status(400).json({ error: "petId is required" });
    }

    const newEvent = new MedicalEvent({
      petId,
      category_name,
      event_name,
      date,
      next_date,
      notes,
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    console.error("Mongoose Save Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/medical-event/:eventId", async (req, res) => {
  try {
    const event = await MedicalEvent.findById(req.params.eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/api/medical-event/:eventId", async (req, res) => {
  try {
    await MedicalEvent.findByIdAndDelete(req.params.eventId);
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete event" });
  }
});

app.put("/api/medical-event/:eventId", async (req, res) => {
  try {
    const { event_name, date, next_date, notes } = req.body;
    const updatedEvent = await MedicalEvent.findByIdAndUpdate(
      req.params.eventId,
      { event_name, date, next_date, notes },
      { new: true }
    );
    if (!updatedEvent) return res.status(404).json({ error: "Event not found" });
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ error: "Failed to update medical event" });
  }
});

app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
