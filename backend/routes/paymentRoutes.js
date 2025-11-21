import express from "express";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";
import Payment from "../models/Payment.js";
import Artwork from "../models/Artwork.js";
import User from "../models/User.js";
import Bid from "../models/Bid.js";

const router = express.Router();

// Get payments for artist
router.get("/artist", verifyToken, requireRole("artist"), async (req, res) => {
  try {
    const payments = await Payment.find({ artist: req.user.id })
      .populate("artwork", "title imageUrl")
      .populate("bidder", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Process payment (artist initiates payment request to bidder)
router.post("/process/:artworkId", verifyToken, requireRole("artist"), async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.artworkId)
      .populate("winningBidder", "name email");

    if (!artwork) {
      return res.status(404).json({ success: false, message: "Artwork not found" });
    }

    if (artwork.artist.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (!artwork.winningBidder) {
      return res.status(400).json({ success: false, message: "No winning bidder" });
    }

    // Create payment record
    const payment = new Payment({
      artwork: artwork._id,
      bidder: artwork.winningBidder._id,
      artist: req.user.id,
      amount: artwork.currentBid,
      status: "pending",
    });

    await payment.save();

    // Here you would send notification to bidder
    // For now, just return success

    res.json({
      success: true,
      message: "Payment request sent to bidder",
      payment
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Complete payment (bidder completes payment)
router.put("/complete/:paymentId", verifyToken, requireRole("bidder"), async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    if (payment.bidder.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    payment.status = "completed";
    payment.transactionId = req.body.transactionId;
    payment.paymentMethod = req.body.paymentMethod;
    await payment.save();

    // Update artwork status to sold
    await Artwork.findByIdAndUpdate(payment.artwork, { status: "sold" });

    res.json({ success: true, message: "Payment completed successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get payment status
router.get("/:paymentId", verifyToken, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId)
      .populate("artwork", "title")
      .populate("bidder", "name email")
      .populate("artist", "name email");

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    // Check if user is authorized to view this payment
    if (
      payment.bidder.toString() !== req.user.id &&
      payment.artist.toString() !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    res.json({ success: true, payment });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Reject payment (bidder rejects payment - reassign to second highest bidder)
router.put("/reject/:paymentId", verifyToken, requireRole("bidder"), async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    if (!payment.bidder) {
      return res.status(400).json({ success: false, message: "Payment has no bidder assigned" });
    }
    if (payment.bidder.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized - bidder mismatch" });
    }

    if (payment.status === 'completed') {
      return res.status(400).json({ success: false, message: "Cannot reject completed payment" });
    }

    if (payment.status === 'rejected') {
      return res.status(400).json({ success: false, message: "Payment already rejected" });
    }

    // Mark current payment as rejected
    payment.status = "rejected";
    await payment.save();

    // Find the artwork and get all bids
    const artwork = await Artwork.findById(payment.artwork).populate('artist');
    if (!artwork) {
      return res.status(404).json({ success: false, message: "Artwork not found" });
    }

    const bids = await Bid.find({ artwork: payment.artwork })
      .sort({ amount: -1 })
      .populate('bidder');

    // console.log('Found bids:', bids.length, 'for artwork:', payment.artwork);

    if (bids.length < 2) {
      // No second highest bidder, auction ends without winner
      artwork.winningBidder = null;
      artwork.status = 'ended';
      await artwork.save();

      return res.json({
        success: true,
        message: "Payment rejected. No other bidders available.",
      });
    }

    // Find second highest bidder (excluding the one who rejected)
    let secondHighestBid = null;
    for (const bid of bids) {
      if (!bid.bidder) continue; // Skip if bidder not populated
      const bidderId = bid.bidder._id ? bid.bidder._id.toString() : bid.bidder.toString();
      if (bidderId !== req.user.id) {
        secondHighestBid = bid;
        break;
      }
    }

    if (!secondHighestBid) {
      // No other bidders
      artwork.winningBidder = null;
      artwork.status = 'ended';
      await artwork.save();

      return res.json({
        success: true,
        message: "Payment rejected. No other bidders available.",
      });
    }

    // Update artwork with new winner
    artwork.winningBidder = secondHighestBid.bidder._id;
    artwork.currentBid = secondHighestBid.amount;
    await artwork.save();

    // Create new payment for second highest bidder
    const newPayment = new Payment({
      artwork: artwork._id,
      bidder: secondHighestBid.bidder._id,
      artist: artwork.artist._id,
      amount: secondHighestBid.amount,
      status: "pending",
    });

    await newPayment.save();

    res.json({
      success: true,
      message: "Payment rejected. Auction reassigned to next highest bidder.",
    });
  } catch (err) {
    console.error("Error rejecting payment:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;