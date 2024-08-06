const express = require("express");
const router = express.Router();

const ExerciseUser = require("../models/exercise-user.model");
const { checkAndAwardTrophies } = require("./trophy");

// Get all exercise-user by his ID

router.get("/", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 5;
    const type = req.query.type;
    const sort = req.query.sort || "-createdAt";

    const query = { owner: req.user._id };
    if (type) {
      query.type = type;
    }

    // get sort by if negative then desc else asc

    const sortField = sort[0] === "-" ? sort.substring(1) : sort;
    const sortOrder = sort[0] === "-" ? "desc" : "asc";

    const exercises = await ExerciseUser.find(query)

      // populate type and session

      .populate("type")
      .populate("session")

      .skip(page * limit)
      .limit(limit)
      .sort({ [sortField]: sortOrder });
    res.json(exercises);
  } catch (error) {
    next(error);
  }
});

// Get one exercise-user by his ID

router.get("/:id", async (req, res, next) => {
  try {
    const oneExerciseUser = await ExerciseUser.findOne({
      owner: req.user._id,
      _id: req.params.id,
    }).populate("type");

    if (!oneExerciseUser) {
      return res
        .status(400)
        .json({ message: "User Exercise - Unauthorized or not found" });
    }
    res.json(oneExerciseUser);
  } catch (error) {
    next(error);
  }
});

// Create an exercise-user

router.post("/", async (req, res, next) => {
  try {
    const { type, weight, rep, comment, session } = req.body;

    if (comment && comment.length > 200) {
      return res
        .status(400)
        .json({ message: "Comment should be less than 200 characters" });
    }

    const createExerciseUser = await ExerciseUser.create({
      type,
      weight: weight,
      rep: rep,
      comment: comment,
      owner: req.user._id,
      session: session,
    });

    const newTrophies = await checkAndAwardTrophies(createExerciseUser);

    res.status(201).json({ ...createExerciseUser.toJSON(), newTrophies});

  } catch (error) {
    next(error);
  }
});

// Update an exercise-user

router.put("/:id", async (req, res, next) => {
  try {
    const { type, weight, rep, comment } = req.body;

    if (!type || !weight || !rep) {
      return res
        .status(400)
        .json({ message: "Trying to update - Missing fields" });
    }

    if (weight.length !== rep.length) {
      return res
        .status(400)
        .json({ message: "Trying to update - Weight and Rep not matching" });
    }

    if (comment && comment.length > 200) {
      return res
        .status(400)
        .json({ message: "Comment should be less than 200 characters" });
    }

    const updateExerciseUser = await ExerciseUser.findOneAndUpdate(
      { _id: req.params.id },
      {
        type,
        weight,
        rep,
        comment,
      },
      { new: true }
    );

    const newTrophies = await checkAndAwardTrophies(updateExerciseUser);

    res.status(202).json({ ...updateExerciseUser, newTrophies});
  } catch (error) {
    next(error);
  }
});

// Delete an exercise-user

router.delete("/:id", async (req, res, next) => {
  try {
    const deleteExerciseUser = await ExerciseUser.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!deleteExerciseUser) {
      return res.status(401).json({
        message: "Trying to delete Exercise User - Unauthorized or not found",
      });
    }
    res.status(204).json(deleteExerciseUser);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
