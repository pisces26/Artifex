// controllers/bidController.js
import Bid from "../models/Bid.js";
import Auction from "../models/Auction.js";

/**
 * @desc   Get all bids of logged-in user
 * @route  GET /api/bids/my
 * @access Private (role: bidder)
 */
export const getMyBids = async (req, res) => {
  try {
    const userId = req.user.id;

    const bids = await Bid.find({ bidder: userId })
      .populate("auction", "title imageUrl status currentPrice endTime winningBidder winningAmount")
      .sort({ createdAt: -1 });

    const formatted = bids.map((bid) => {
      const auction = bid.auction;
      let result = "lost";

      if (auction.status === "live") {
        result =
          auction.winningBidder?.toString() === userId ? "winning" : "outbid";
      } else if (auction.status === "ended") {
        result =
          auction.winningBidder?.toString() === userId ? "won" : "lost";
      }

      return {
        id: bid._id,
        artwork: {
          title: auction.title,
          image: auction.imageUrl,
        },
        myHighestBid: bid.amount,
        currentPrice: auction.currentPrice,
        status: auction.status,
        result,
        bidTime: bid.createdAt,
        auctionEndTime: auction.endTime,
        finalPrice: auction.status === "ended" ? auction.winningAmount : null,
      };
    });

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
    const { auctionId, amount } = req.body;
    const userId = req.user.id;

    const auction = await Auction.findById(auctionId);
    if (!auction) return res.status(404).json({ message: "Auction not found" });

    if (auction.status !== "live") {
      return res.status(400).json({ message: "Auction is not live" });
    }

    if (amount <= auction.currentPrice) {
      return res
        .status(400)
        .json({ message: "Bid must be higher than current price" });
    }

    // Save new bid
    const newBid = new Bid({
      auction: auctionId,
      bidder: userId,
      amount,
    });
    await newBid.save();

    // Update auction
    auction.currentPrice = amount;
    auction.winningBidder = userId;
    auction.winningAmount = amount;
    await auction.save();

    res.status(201).json({ message: "Bid placed successfully", bid: newBid });
  } catch (error) {
    console.error("Error in placeBid:", error);
    res.status(500).json({ message: "Server error placing bid" });
  }
};
