const express = require("express");
const router = express.Router();

const ExerciseType = require("../models/exercise-type.model");

// Get all exercise types

router.get("/", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 5;
    const sort = req.query.sort || "-createdAt";
    const typeSession = req.query.type_session;

    // get sort by if negative then desc else asc

    const sortField = sort[0] === "-" ? sort.substring(1) : sort;
    const sortOrder = sort[0] === "-" ? "desc" : "asc";

    let query = { owner: req.user._id };
    if (typeSession) {
      query.type_session = typeSession;
    }

    const exerciseUsers = await ExerciseType.find(query)
      .skip(page * limit)
      .limit(limit)
      .sort({ [sortField]: sortOrder });
    res.json(exerciseUsers);
  } catch (error) {
    next(error);
  }
});

// Create an exercise type

router.post("/", async (req, res, next) => {
  try {
    const {
      name,
      advice,
      timer,
      repRange1,
      repRange2,
      repRange3,
      type_session,
    } = req.body;

    if (timer && typeof timer !== "number") {
      return res.status(400).json({ message: "Should be a number" });
    }

    const createExerciseType = await ExerciseType.create({
      name: name,
      advice: advice,
      timer: timer,
      repRange1: repRange1,
      repRange2: repRange2,
      repRange3: repRange3,
      type_session: type_session,
      owner: req.user._id,
    });

    res.status(201).json({ id: createExerciseType._id });
  } catch (error) {
    next(error);
  }
});

// Get one exercise type

router.get("/:id", async (req, res, next) => {
  try {
    const oneExerciseType = await ExerciseType.findOne({
      owner: req.user._id,
      _id: req.params.id,
    });

    res.json(oneExerciseType);
  } catch (error) {
    next(error);
  }
});

// Update an exercise type

router.put("/:id", async (req, res, next) => {
  try {
    const {
      name,
      advice,
      timer,
      repRange1,
      repRange2,
      repRange3,
      type_session,
    } = req.body;

    if (
      type_session &&
      !["Upper A", "Lower", "Upper B"].includes(type_session)
    ) {
      return res.status(400).json({ message: "Invalid type session" });
    }

    if (timer && typeof timer !== "number") {
      return res.status(400).json({ message: "Should be a number" });
    }

    const updateExerciseType = await ExerciseType.findByIdAndUpdate(
      { _id: req.params.id },
      {
        name: name,
        advice: advice,
        timer: timer,
        repRange1: repRange1,
        repRange2: repRange2,
        repRange3: repRange3,
        type_session: type_session,
      },
      { new: true }
    );

    res.status(202).json(updateExerciseType);
  } catch (error) {
    next(error);
  }
});

// Delete an exercise type

router.delete("/:id", async (req, res, next) => {
  try {
    const deleteExerciseType = await ExerciseType.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!deleteExerciseType) {
      return res.status(401).json({
        message: "Trying to delete Exercise Type - Unauthorized or not found",
      });
    }
    res.status(204).json(deleteExerciseType);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
