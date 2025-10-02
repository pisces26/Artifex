import mongoose from "mongoose";

const artworkSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String },
    basePrice: { type: Number, required: true },
    currentBid: { type: Number, default: 0 }, // Track current highest bid
    auctionDate: { type: Date, required: true }, // Start time
    auctionEndDate: { type: Date, required: true }, // End time
    imageUrl: { type: String, required: true }, // file path or cloud URL
    status: { type: String, enum: ["scheduled", "live", "ended", "sold"], default: "scheduled" },
    winningBidder: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    artist: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Artwork", artworkSchema);
