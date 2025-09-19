import express from "express";
import multer from "multer";
import Artwork from "../models/Artwork.js";
import { verifyToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/artworks"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Upload artwork (only artists)
router.post("/upload", verifyToken, requireRole("artist"), upload.single("image"), async (req, res) => {
  try {
    const { title, description, category, basePrice, auctionDate } = req.body;

    const artwork = new Artwork({
      title,
      description,
      category,
      basePrice,
      auctionDate,
      imageUrl: `/uploads/artworks/${req.file.filename}`,
      artist: req.user.id,
    });

    await artwork.save();
    res.status(201).json({ success: true, artwork });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get all artworks by logged-in artist
router.get("/my-artworks", verifyToken, requireRole("artist"), async (req, res) => {
  try {
    const artworks = await Artwork.find({ artist: req.user.id });
    res.json(artworks);
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
