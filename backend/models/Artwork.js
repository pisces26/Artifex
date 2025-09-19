import mongoose from "mongoose";

const artworkSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String },
    basePrice: { type: Number, required: true },
    auctionDate: { type: Date, required: true },
    imageUrl: { type: String, required: true }, // file path or cloud URL
    status: { type: String, enum: ["scheduled", "live", "sold"], default: "scheduled" },
    artist: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Artwork", artworkSchema);
