import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import mongoose from "mongoose";
import User from "../models/User.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Multer for profile picture upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/profiles"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Signup
router.post("/signup", async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(500).json({ message: "Database not connected." });
  }
  try {
    const { name, email, password, role, portfolioLink } = req.body;
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedName || !trimmedEmail || !password || !role) {
      return res.status(400).json({ message: "All required fields must be filled." });
    }

    if (trimmedName.length < 2) {
      return res.status(400).json({ message: "Name must be at least 2 characters long." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    if (!['artist', 'bidder'].includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }

    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) return res.status(400).json({ message: "Email already in use." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name: trimmedName,
      email: trimmedEmail,
      password: hashedPassword,
      role,
      portfolioLink: role === "artist" ? portfolioLink : undefined,
    });

    await newUser.save();
    res.status(201).json({ message: "Signup successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const trimmedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: trimmedEmail, role });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get user profile
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Update user profile
router.put("/profile", verifyToken, async (req, res) => {
  try {
    const { name, mobile, location, portfolioLink } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, mobile, location, portfolioLink },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Update delivery address
router.put("/delivery-address", verifyToken, async (req, res) => {
  try {
    const { street, city, state, pincode, country } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { deliveryAddress: { street, city, state, pincode, country } },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get delivery address for a user (for artists to view delivery details)
router.get("/:userId/delivery-address", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("deliveryAddress");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ success: true, deliveryAddress: user.deliveryAddress });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Upload profile picture
router.post("/profile/picture", verifyToken, upload.single("profilePicture"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const profilePictureUrl = `/uploads/profiles/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture: profilePictureUrl },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Change password
router.put("/change-password", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Delete account
router.delete("/account", verifyToken, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ success: true, message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
