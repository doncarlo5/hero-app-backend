// routes/feedback.js

const express = require("express");
const Feedback = require("../models/feedback.model");
const User = require("../models/user.model");
const router = express.Router();

// POST /api/feedback - Submit feedback
router.post("/", async (req, res) => {
  const { userId, message } = req.body;

  try {
    // Ensure user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { subject, message } = req.body;

    // Create and save the feedback
    const feedback = new Feedback({
      owner: userId,
      subject,
      message,
    });

    await feedback.save();
    res.json(feedback);
  } catch (error) {
    next(error);
  }
});

// GET /api/feedbacks - Retrieve all feedbacks
router.get("/", async (req, res) => {
  try {
    const feedbacks = await Feedback.find().populate("owner");
    res.status(200).json(feedbacks);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
