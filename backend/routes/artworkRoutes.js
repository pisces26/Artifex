import express from "express";
import multer from "multer";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";
import Artwork from "../models/Artwork.js";

// Helper function to update auction statuses
const updateAuctionStatuses = async () => {
  const now = new Date();

  // Update auctions that have ended
  await Artwork.updateMany(
    {
      auctionEndDate: { $lte: now },
      status: { $nin: ["ended", "sold"] }
    },
    { status: "ended" }
  );

  // Update auctions that are now live
  await Artwork.updateMany(
    {
      auctionDate: { $lte: now },
      auctionEndDate: { $gt: now },
      status: "scheduled"
    },
    { status: "live" }
  );
};

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
    const { title, description, category, basePrice, auctionDate, auctionEndDate } = req.body;
    if (!req.file) return res.status(400).json({ success: false, message: "Image required" });

    const artwork = new Artwork({
      title,
      description,
      category,
      basePrice,
      currentBid: basePrice, // Initialize with base price
      auctionDate,
      auctionEndDate,
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
    const artworks = await Artwork.find({ artist: req.user.id })
      .populate("winningBidder", "name email")
      .sort({ createdAt: -1 });
    res.json({ success: true, artworks });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get live auctions (public - for bidders)
router.get("/live", async (req, res) => {
  try {
    // Update auction statuses before fetching
    await updateAuctionStatuses();

    const now = new Date();
    const liveAuctions = await Artwork.find({
      auctionDate: { $lte: now },
      auctionEndDate: { $gt: now },
      status: { $nin: ["ended", "sold"] } // Exclude ended and sold auctions
    }).populate("artist", "name").sort({ auctionDate: 1 });

    // Transform to include dynamic status
    const auctionsWithStatus = liveAuctions.map(auction => {
      const auctionData = auction.toObject();
      auctionData.status = "live";
      return auctionData;
    });

    res.json({ success: true, auctions: auctionsWithStatus });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get upcoming auctions (public - for bidders)
router.get("/upcoming", async (req, res) => {
  try {
    // Update auction statuses before fetching
    await updateAuctionStatuses();

    const now = new Date();
    const upcomingAuctions = await Artwork.find({
      auctionDate: { $gt: now },
      status: { $nin: ["ended", "sold"] }
    }).populate("artist", "name").sort({ auctionDate: 1 });

    res.json({ success: true, auctions: upcomingAuctions });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get ended auctions (public - for bidders)
router.get("/ended", async (req, res) => {
  try {
    // Update auction statuses before fetching
    await updateAuctionStatuses();

    const now = new Date();
    const endedAuctions = await Artwork.find({
      auctionEndDate: { $lte: now },
      status: { $in: ["ended", "sold"] }
    }).populate("artist", "name").populate("winningBidder", "name").sort({ auctionEndDate: -1 });

    res.json({ success: true, auctions: endedAuctions });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update artwork (artists only - before auction starts)
router.put("/:id", verifyToken, requireRole("artist"), async (req, res) => {
  try {
    const { title, description, category, basePrice, auctionDate, auctionEndDate } = req.body;
    const artworkId = req.params.id;

    const artwork = await Artwork.findById(artworkId);
    if (!artwork) {
      return res.status(404).json({ success: false, message: "Artwork not found" });
    }

    // Check if artwork belongs to the artist
    if (artwork.artist.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Check if auction hasn't started yet
    const now = new Date();
    const auctionStart = new Date(artwork.auctionDate);
    if (now >= auctionStart || artwork.status !== 'scheduled') {
      return res.status(400).json({ success: false, message: "Cannot edit artwork once auction has started" });
    }

    // Update artwork
    const updatedArtwork = await Artwork.findByIdAndUpdate(
      artworkId,
      {
        title,
        description,
        category,
        basePrice: parseFloat(basePrice),
        auctionDate: new Date(auctionDate),
        auctionEndDate: new Date(auctionEndDate)
      },
      { new: true }
    );

    res.json({ success: true, artwork: updatedArtwork });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get single artwork by ID (public - for bidders)
router.get("/:id", async (req, res) => {
  try {
    // Update auction status before fetching
    await updateAuctionStatuses();

    const artwork = await Artwork.findById(req.params.id).populate("artist", "name");
    if (!artwork) {
      return res.status(404).json({ success: false, message: "Artwork not found" });
    }

    res.json({ success: true, artwork });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
