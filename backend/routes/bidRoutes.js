import express from "express";
import { getMyBids, placeBid } from "../controllers/bidController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Logged-in bidder’s bids
router.get("/my", authMiddleware(["bidder"]), getMyBids);

// Place a bid
router.post("/", authMiddleware(["bidder"]), placeBid);

export default router;   
