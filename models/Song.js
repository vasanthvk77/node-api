const mongoose = require("mongoose");

const songSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    artist: { type: String, required: true },
    image: String,
    audio: String,
  },
  { collection: "lootify_test_song" } 
);

const Song = mongoose.model("Song", songSchema);

module.exports = Song;
