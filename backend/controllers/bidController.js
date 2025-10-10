// controllers/bidController.js
import Bid from "../models/Bid.js";
import Artwork from "../models/Artwork.js";
import Payment from "../models/Payment.js";

/**
 * @desc   Get all bids of logged-in user
 * @route  GET /api/bids/my
 * @access Private (role: bidder)
 */
export const getMyBids = async (req, res) => {
  try {
    const userId = req.user.id;

    const bids = await Bid.find({ bidder: userId })
      .populate({
        path: "artwork",
        select: "title imageUrl status currentBid auctionEndDate winningBidder",
        populate: { path: "artist", select: "name" }
      })
      .sort({ createdAt: -1 });

    // Group bids by artwork to handle multiple bids per artwork
    const bidsByArtwork = new Map();

    bids.forEach((bid) => {
      const artworkId = bid.artwork._id.toString();
      if (!bidsByArtwork.has(artworkId)) {
        bidsByArtwork.set(artworkId, []);
      }
      bidsByArtwork.get(artworkId).push(bid);
    });

    // Get all payments for won bids
    const wonArtworkIds = [];
    for (const [artworkId, artworkBids] of bidsByArtwork) {
      const artwork = artworkBids[0].artwork;
      if ((artwork.status === "ended" || artwork.status === "sold") &&
          artwork.winningBidder?.toString() === userId) {
        wonArtworkIds.push(artworkId);
      }
    }

    const payments = await Payment.find({
      artwork: { $in: wonArtworkIds },
      bidder: userId,
      status: { $in: ["pending", "completed"] }
    });

    const paymentMap = new Map();
    payments.forEach(payment => {
      paymentMap.set(payment.artwork.toString(), payment._id);
    });

    const formatted = [];

    for (const [artworkId, artworkBids] of bidsByArtwork) {
      const artwork = artworkBids[0].artwork; // All bids have the same artwork data

      // Sort bids by amount (highest first) for this artwork
      artworkBids.sort((a, b) => b.amount - a.amount);

      artworkBids.forEach((bid, index) => {
        let result = "lost";

        if (artwork.status === "live") {
          result = artwork.winningBidder?.toString() === userId ? "winning" : "outbid";
        } else if (artwork.status === "ended" || artwork.status === "sold") {
          // For ended auctions, only the highest bid from the winner should be "won"
          if (artwork.winningBidder?.toString() === userId) {
            result = index === 0 ? "won" : "lost"; // Only highest bid is "won"
          } else {
            result = "lost";
          }
        }

        formatted.push({
          id: bid._id,
          artwork: {
            title: artwork.title,
            image: artwork.imageUrl,
          },
          myHighestBid: bid.amount,
          currentPrice: artwork.currentBid,
          status: artwork.status,
          result,
          bidTime: bid.createdAt,
          auctionEndTime: artwork.auctionEndDate,
          finalPrice: (artwork.status === "ended" || artwork.status === "sold") ? artwork.currentBid : null,
          paymentId: paymentMap.get(artworkId) || null,
        });
      });
    }

    // Sort by bid time (most recent first)
    formatted.sort((a, b) => new Date(b.bidTime) - new Date(a.bidTime));

    res.json(formatted);
  } catch (error) {
    console.error("Error in getMyBids:", error);
    res.status(500).json({ message: "Server error fetching bids" });
  }
};

/**
 * @desc   Place a new bid
 * @route  POST /api/bids
 * @access Private (role: bidder)
 */
export const placeBid = async (req, res) => {
  try {
    const { artworkId, amount } = req.body;
    const userId = req.user.id;

    const artwork = await Artwork.findById(artworkId);
    if (!artwork) return res.status(404).json({ message: "Artwork not found" });

    const now = new Date();
    if (now < artwork.auctionDate || now > artwork.auctionEndDate) {
      return res.status(400).json({ message: "Auction is not live" });
    }

    if (amount <= artwork.currentBid) {
      return res.status(400).json({ message: "Bid must be higher than current price" });
    }

    // Save new bid
    const newBid = new Bid({
      artwork: artworkId,
      bidder: userId,
      amount,
    });
    await newBid.save();

    // Update artwork
    artwork.currentBid = amount;
    artwork.winningBidder = userId;
    await artwork.save();

    res.status(201).json({ message: "Bid placed successfully", bid: newBid });
  } catch (error) {
    console.error("Error in placeBid:", error);
    res.status(500).json({ message: "Server error placing bid" });
  }
};

/**
 * @desc   Get public bid history for a specific artwork
 * @route  GET /api/bids/public/:artworkId
 * @access Public
 */
export const getPublicBidHistory = async (req, res) => {
  try {
    const { artworkId } = req.params;

    // Verify the artwork exists
    const artwork = await Artwork.findById(artworkId);
    if (!artwork) {
      return res.status(404).json({ success: false, message: "Artwork not found" });
    }

    // Get all bids for this artwork
    const bids = await Bid.find({ artwork: artworkId })
      .populate("bidder", "name")
      .sort({ createdAt: -1 });

    // Show actual bidder names
    const bidHistory = bids.map((bid) => ({
      id: bid._id,
      bidder: bid.bidder ? bid.bidder.name : 'Anonymous',
      amount: bid.amount,
      timestamp: bid.createdAt,
    }));

    res.json({ success: true, bids: bidHistory });
  } catch (error) {
    console.error("Error fetching public bid history:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
