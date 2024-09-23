const express = require("express");
const router = express.Router();

const Program = require("../models/program.model");
const isAuthenticated = require("../src/is-authenticated");

// Get all programs for a user
router.get("/", isAuthenticated, async (req, res, next) => {
  try {
    const programs = await Program.find({ owner: req.user._id }).populate(
      "exercises.exerciseType exercises.alternatives"
    );
    res.json(programs);
  } catch (error) {
    next(error);
  }
});

// Get program by session type
router.get("/:sessionType", isAuthenticated, async (req, res, next) => {
  try {
    const program = await Program.findOne({
      sessionType: req.params.sessionType,
      owner: req.user._id,
    }).populate("exercises.exerciseType exercises.alternatives");
    res.json(program);
  } catch (error) {
    next(error);
  }
});

// Create or update a program
router.post("/", isAuthenticated, async (req, res, next) => {
  try {
    const { sessionType, exercises } = req.body;

    // Check if a program already exists for the session type
    let program = await Program.findOne({ sessionType, owner: req.user._id });

    if (!program) {
      // Create a new program if it doesn't exist
      program = new Program({
        sessionType,
        exercises,
        owner: req.user._id,
      });
    } else {
      // Update the existing program
      program.exercises = exercises;
    }

    await program.save();
    res.json(program);
  } catch (error) {
    next(error);
  }
});

// Delete a program
router.delete("/:sessionType", isAuthenticated, async (req, res, next) => {
  try {
    const deleteProgram = await Program.findOneAndDelete({
      sessionType: req.params.sessionType,
      owner: req.user._id,
    });

    res.json({ message: "Program deleted", deleteProgram });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
