import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["artist", "bidder"], required: true },
  portfolioLink: { type: String },
  profilePicture: { type: String }, // URL to profile picture
  mobile: { type: String },
  location: { type: String },
  deliveryAddress: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    country: { type: String, default: "India" }
  }
}, { timestamps: true, collation: { locale: 'en', strength: 2 } });

export default mongoose.model("User", userSchema);
