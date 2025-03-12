require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

// ✅ Ensure 'uploads' directory exists
const UPLOADS_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

// ✅ Middleware for Different Data Formats
app.use(cors()); // Allow all origins (Modify for security)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(UPLOADS_DIR));

// ✅ MongoDB Connection (Using Railway's Env Variables)
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ✅ Define Mongoose Schema & Model
const SongSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  files: [{ type: String }], // Store multiple file paths
});

const Song = mongoose.model("Song", SongSchema);

// ✅ Multer Storage for Multiple File Uploads
const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// ✅ Route: Upload Songs (Multiple Formats Supported)
app.post("/upload", upload.array("files", 5), async (req, res) => {
  try {
    const { title, artist } = req.body;
    if (!title || !artist) {
      return res.status(400).json({ error: "Title and artist are required." });
    }

    const filePaths = req.files.map((file) => `/uploads/${file.filename}`);

    const newSong = new Song({ title, artist, files: filePaths });
    await newSong.save();

    res.status(201).json(newSong);
  } catch (error) {
    console.error("❌ Upload Error:", error);
    res.status(500).json({ error: "Server Error: Unable to upload." });
  }
});

// ✅ Route: Get All Songs
app.get("/songs", async (req, res) => {
  try {
    const songs = await Song.find();
    res.json(songs);
  } catch (error) {
    console.error("❌ Fetch Songs Error:", error);
    res.status(500).json({ error: "Server Error: Unable to fetch songs." });
  }
});

// ✅ Route: Home (Check if API is working)
app.get("/", (req, res) => {
  res.json({ message: "🎵 Welcome to My Music API! 🚀" });
});

// ✅ Fallback Route (404)
app.use((req, res) => {
  res.status(404).json({ error: "Route Not Found" });
});

// ✅ Start Server on Railway Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running on port ${PORT}`));
