import mongoose from "mongoose";

const auctionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    imageUrl: { type: String },
    status: {
      type: String,
      enum: ["upcoming", "live", "ended"],
      default: "upcoming",
    },
    currentPrice: { type: Number, default: 0 },
    endTime: { type: Date },
    winningBidder: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    winningAmount: { type: Number },
  },
  { timestamps: true }
);

const Auction = mongoose.model("Auction", auctionSchema);

export default Auction;
