import express from "express";
import multer from "multer";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";
import Artwork from "../models/Artwork.js";

const router = express.Router();

// Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/artworks"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Upload artwork
router.post("/upload", verifyToken, requireRole("artist"), upload.single("image"), async (req, res) => {
  try {
    const { title, description, category, basePrice, auctionDate } = req.body;
    if (!req.file) return res.status(400).json({ success: false, message: "Image required" });

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

// Get artist artworks
router.get("/my-artworks", verifyToken, requireRole("artist"), async (req, res) => {
  try {
    const artworks = await Artwork.find({ artist: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, artworks });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
