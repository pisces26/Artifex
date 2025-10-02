import express from "express";
import { getMyBids, placeBid } from "../controllers/bidController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Logged-in bidder’s bids
router.get("/my", authMiddleware(["bidder"]), getMyBids);

// Place a bid
router.post("/", authMiddleware(["bidder"]), placeBid);

// Get all bids for a specific artwork (for artists to view)
router.get("/artwork/:artworkId", authMiddleware(["artist"]), async (req, res) => {
  try {
    const { artworkId } = req.params;

    // Verify the artwork belongs to the artist
    const artwork = await Artwork.findById(artworkId);
    if (!artwork) {
      return res.status(404).json({ success: false, message: "Artwork not found" });
    }

    if (artwork.artist.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Get all bids for this artwork
    const bids = await Bid.find({ artwork: artworkId })
      .populate("bidder", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, bids });
  } catch (error) {
    console.error("Error fetching artwork bids:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
