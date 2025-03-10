require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
   useNewUrlParser: true,
   useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB Connection Error:", err));

// Define Schema
const SongSchema = new mongoose.Schema({
   title: String,
   artist: String,
   image: String,
   audio: String,
});

const Song = mongoose.model("Song", SongSchema);

// Multer Storage for File Uploads
const storage = multer.diskStorage({
   destination: "./uploads",
   filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
   },
});

const upload = multer({ storage });

// Routes
app.get("/", (req, res) => {
   res.send("🎵 Welcome to My Music API! 🚀");
});

app.post("/upload", upload.fields([{ name: "image" }, { name: "audio" }]), async (req, res) => {
   try {
      const { title, artist } = req.body;
      const image = req.files.image ? `/uploads/${req.files.image[0].filename}` : null;
      const audio = req.files.audio ? `/uploads/${req.files.audio[0].filename}` : null;

      const newSong = new Song({ title, artist, image, audio });
      await newSong.save();

      res.status(201).json(newSong);
   } catch (error) {
      console.error("❌ Upload Error:", error);
      res.status(500).json({ error: error.message });
   }
});

// Start Server
const PORT = process.env.PORT;  // No fallback to 5000
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
