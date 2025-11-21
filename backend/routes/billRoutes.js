import express from "express";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";
import Payment from "../models/Payment.js";
import Artwork from "../models/Artwork.js";
import User from "../models/User.js";
import PDFDocument from "pdfkit";

const router = express.Router();

// Generate bill for bidder (after payment completion)
router.get("/bidder/:paymentId", async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId)
      .populate("artwork", "title description category basePrice auctionDate auctionEndDate isDigital")
      .populate("artist", "name email portfolioLink")
      .populate("bidder", "name email mobile deliveryAddress");

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    // Temporarily remove auth check for testing
    // if (payment.bidder.toString() !== req.user.id) {
    //   return res.status(403).json({ success: false, message: "Unauthorized" });
    // }

    // Temporarily allow any payment status for testing
    // if (payment.status !== "completed") {
    //   return res.status(400).json({ success: false, message: "Payment not completed" });
    // }

    // Generate PDF bill
    const doc = new PDFDocument();
    const filename = `bill_${payment._id}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    // Header
    doc.fontSize(20).text('Artifex - Purchase Bill', { align: 'center' });
    doc.moveDown();

    // Bill details
    doc.fontSize(12);
    doc.text(`Bill Number: ${payment._id}`);
    doc.text(`Date: ${new Date(payment.createdAt).toLocaleDateString()}`);
    doc.text(`Auction End Date: ${new Date(payment.artwork.auctionEndDate).toLocaleDateString()}`);
    doc.moveDown();

    // Buyer details
    doc.text('Buyer Details:');
    doc.text(`Name: ${payment.bidder.name}`);
    doc.text(`Email: ${payment.bidder.email}`);
    doc.text(`Mobile: ${payment.bidder.mobile || 'N/A'}`);
    if (!payment.artwork.isDigital && payment.bidder.deliveryAddress) {
      doc.text('Delivery Address:');
      doc.text(`${payment.bidder.deliveryAddress.street}`);
      doc.text(`${payment.bidder.deliveryAddress.city}, ${payment.bidder.deliveryAddress.state} ${payment.bidder.deliveryAddress.pincode}`);
      doc.text(`${payment.bidder.deliveryAddress.country}`);
    }
    doc.moveDown();

    // Seller details
    doc.text('Seller Details:');
    doc.text(`Artist: ${payment.artist.name}`);
    doc.text(`Email: ${payment.artist.email}`);
    doc.text(`Portfolio: ${payment.artist.portfolioLink || 'N/A'}`);
    doc.moveDown();

    // Artwork details
    doc.text('Artwork Details:');
    doc.text(`Title: ${payment.artwork.title}`);
    doc.text(`Description: ${payment.artwork.description}`);
    doc.text(`Category: ${payment.artwork.category || 'N/A'}`);
    doc.text(`Base Price: ₹${payment.artwork.basePrice.toLocaleString()}`);
    doc.text(`Final Bid Amount: ₹${payment.amount.toLocaleString()}`);
    doc.text(`Type: ${payment.artwork.isDigital ? 'Digital Art' : 'Physical Art'}`);
    doc.text(`Auction Start: ${new Date(payment.artwork.auctionDate).toLocaleDateString()}`);
    doc.text(`Auction End: ${new Date(payment.artwork.auctionEndDate).toLocaleDateString()}`);
    doc.moveDown();

    // License terms (for digital art)
    if (payment.artwork.isDigital) {
      doc.text('License Terms:');
      doc.text('• Personal use license granted');
      doc.text('• Non-commercial use only');
      doc.text('• No redistribution or resale rights');
      doc.text('• High-resolution digital file included');
      doc.text('• Copyright remains with the artist');
      doc.text('• No transfer of intellectual property rights');
      doc.text('• License is non-transferable');
      doc.moveDown();
    }

    // Payment details
    doc.text('Payment Details:');
    doc.text(`Total Amount: ₹${payment.amount.toLocaleString()}`);
    doc.text(`Payment Method: ${payment.paymentMethod || 'Online Payment'}`);
    doc.text(`Transaction ID: ${payment.transactionId || 'N/A'}`);
    doc.text(`Payment Status: ${payment.status}`);
    doc.text(`Payment Date: ${new Date(payment.updatedAt).toLocaleDateString()}`);
    doc.moveDown();

    // Terms and conditions
    doc.text('Terms & Conditions:');
    doc.text('• All sales are final');
    doc.text('• Digital artworks are delivered electronically');
    doc.text('• Physical artworks will be shipped within 7-10 business days');
    doc.text('• Shipping costs are included in the final bid amount');
    doc.text('• For any disputes, please contact Artifex support');
    doc.moveDown();

    // Footer
    doc.text('Thank you for your purchase!', { align: 'center' });
    doc.text('Artifex - Where Art Meets Auction', { align: 'center' });
    doc.text('www.artifex.com | support@artifex.com', { align: 'center' });

    doc.end();
  } catch (error) {
    console.error("Error generating bill:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
});

// Generate bill for artist (after payment completion)
router.get("/artist/:paymentId", async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId)
      .populate("artwork", "title description category basePrice auctionDate auctionEndDate isDigital")
      .populate("artist", "name email portfolioLink")
      .populate("bidder", "name email mobile deliveryAddress");

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    // Temporarily remove auth check for testing
    // if (payment.artist.toString() !== req.user.id) {
    //   return res.status(403).json({ success: false, message: "Unauthorized" });
    // }

    // Temporarily allow any payment status for testing
    // if (payment.status !== "completed") {
    //   return res.status(400).json({ success: false, message: "Payment not completed" });
    // }

    // Generate PDF bill
    const doc = new PDFDocument();
    const filename = `sales_bill_${payment._id}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    // Header
    doc.fontSize(20).text('Artifex - Sales Bill', { align: 'center' });
    doc.moveDown();

    // Bill details
    doc.fontSize(12);
    doc.text(`Bill Number: ${payment._id}`);
    doc.text(`Date: ${new Date(payment.createdAt).toLocaleDateString()}`);
    doc.text(`Auction End Date: ${new Date(payment.artwork.auctionEndDate).toLocaleDateString()}`);
    doc.moveDown();

    // Seller details
    doc.text('Seller Details:');
    doc.text(`Artist: ${payment.artist.name}`);
    doc.text(`Email: ${payment.artist.email}`);
    doc.text(`Portfolio: ${payment.artist.portfolioLink || 'N/A'}`);
    doc.moveDown();

    // Buyer details
    doc.text('Buyer Details:');
    doc.text(`Name: ${payment.bidder.name}`);
    doc.text(`Email: ${payment.bidder.email}`);
    doc.text(`Mobile: ${payment.bidder.mobile || 'N/A'}`);
    if (!payment.artwork.isDigital && payment.bidder.deliveryAddress) {
      doc.text('Delivery Address:');
      doc.text(`${payment.bidder.deliveryAddress.street}`);
      doc.text(`${payment.bidder.deliveryAddress.city}, ${payment.bidder.deliveryAddress.state} ${payment.bidder.deliveryAddress.pincode}`);
      doc.text(`${payment.bidder.deliveryAddress.country}`);
    }
    doc.moveDown();

    // Artwork details
    doc.text('Artwork Details:');
    doc.text(`Title: ${payment.artwork.title}`);
    doc.text(`Description: ${payment.artwork.description}`);
    doc.text(`Category: ${payment.artwork.category || 'N/A'}`);
    doc.text(`Base Price: ₹${payment.artwork.basePrice.toLocaleString()}`);
    doc.text(`Final Sale Amount: ₹${payment.amount.toLocaleString()}`);
    doc.text(`Type: ${payment.artwork.isDigital ? 'Digital Art' : 'Physical Art'}`);
    doc.text(`Auction Start: ${new Date(payment.artwork.auctionDate).toLocaleDateString()}`);
    doc.text(`Auction End: ${new Date(payment.artwork.auctionEndDate).toLocaleDateString()}`);
    doc.moveDown();

    // License terms (for digital art)
    if (payment.artwork.isDigital) {
      doc.text('License Terms:');
      doc.text('• Personal use license granted');
      doc.text('• Non-commercial use only');
      doc.text('• No redistribution or resale rights');
      doc.text('• High-resolution digital file included');
      doc.text('• Copyright remains with the artist');
      doc.text('• No transfer of intellectual property rights');
      doc.text('• License is non-transferable');
      doc.moveDown();
    }

    // Payment details
    doc.text('Payment Details:');
    doc.text(`Total Amount: ₹${payment.amount.toLocaleString()}`);
    doc.text(`Payment Method: ${payment.paymentMethod || 'Online Payment'}`);
    doc.text(`Transaction ID: ${payment.transactionId || 'N/A'}`);
    doc.text(`Payment Status: ${payment.status}`);
    doc.text(`Payment Date: ${new Date(payment.updatedAt).toLocaleDateString()}`);
    doc.moveDown();

    // Commission details (for artist reference)
    doc.text('Commission Details:');
    doc.text(`Platform Fee: ₹${(payment.amount * 0.1).toLocaleString()} (10%)`);
    doc.text(`Net Amount to Artist: ₹${(payment.amount * 0.9).toLocaleString()} (90%)`);
    doc.moveDown();

    // Terms and conditions
    doc.text('Terms & Conditions:');
    doc.text('• All sales are final');
    doc.text('• Digital artworks are delivered electronically');
    doc.text('• Physical artworks will be shipped within 7-10 business days');
    doc.text('• Artist is responsible for delivery of physical artworks');
    doc.text('• For any disputes, please contact Artifex support');
    doc.moveDown();

    // Footer
    doc.text('Thank you for using Artifex!', { align: 'center' });
    doc.text('Artifex - Where Art Meets Auction', { align: 'center' });
    doc.text('www.artifex.com | support@artifex.com', { align: 'center' });

    doc.end();
  } catch (error) {
    console.error("Error generating bill:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
});

export default router;