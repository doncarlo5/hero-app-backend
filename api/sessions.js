const express = require("express");
const router = express.Router();

const Session = require("../models/session.model");
const ExerciseUser = require("../models/exercise-user.model");
const Program = require("../models/program.model"); // Import Program model
const isAuthenticated = require("../src/is-authenticated");

// Get all sessions by user
router.get("/", isAuthenticated, async (req, res, next) => {
  try {
    // Pagination, sorting, filtering logic (same as before)
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 5;

    const sort = {};
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(":");
      sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
    }

    const match = {};
    if (req.query.completed) {
      match.completed = req.query.completed === "true";
    }

    const query = { owner: req.user._id };

    if (req.query.lastFourWeeks) {
      const now = new Date();
      const startOfCurrentWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const fourWeeksAgo = new Date(startOfCurrentWeek);
      fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
      query.date_session = { $gte: fourWeeksAgo, $lt: startOfCurrentWeek };
    }

    const sessions = await Session.find(query)
      .populate({
        path: "exercise_user_list",
        match,
        options: {
          limit,
          skip: page * limit,
          sort,
        },
      })
      .sort(sort)
      .skip(page * limit)
      .limit(limit);

    res.json(sessions);
  } catch (error) {
    next(error);
  }
});

// Get one session by ID
router.get("/:id", async (req, res, next) => {
  try {
    const oneSession = await Session.findOne({ _id: req.params.id }).populate({
      path: "exercise_user_list",
      populate: {
        path: "type",
      },
    });

    res.json(oneSession);
  } catch (error) {
    next(error);
  }
});

// Create a session
router.post("/", isAuthenticated, async (req, res, next) => {
  try {
    // Fetch the program for the session type to suggest exercises
    const program = await Program.findOne({
      sessionType: req.body.type_session,
      owner: req.user._id,
    }).populate("exercises.exerciseType exercises.alternatives");

    let exerciseSuggestions = [];
    if (program) {
      // Use the program to suggest exercises
      exerciseSuggestions = program.exercises.map((exercise) => ({
        exerciseType: exercise.exerciseType,
        alternatives: exercise.alternatives,
      }));
    }

    const createSession = await Session.create({
      date_session: req.body.date_session,
      type_session: req.body.type_session,
      body_weight: req.body.body_weight,
      exercise_user_list: req.body.exercise_user_list,
      is_done: req.body.is_done,
      comment: req.body.comment,
      owner: req.user._id,
    });

    res.json({ session: createSession, exerciseSuggestions });
  } catch (error) {
    next(error);
  }
});

// Update a session
router.put("/:id", async (req, res, next) => {
  try {
    let {
      date_session,
      type_session,
      body_weight,
      exercise_user_list,
      is_done,
      comment,
    } = req.body;

    if (comment && comment.length > 200) {
      return res
        .status(400)
        .json({ message: "Comment should be less than 200 characters" });
    }

    const updateSession = await Session.findOneAndUpdate(
      { _id: req.params.id },
      {
        date_session,
        type_session,
        body_weight,
        exercise_user_list,
        is_done,
        comment,
      },
      { new: true }
    );
    res.json(updateSession);
  } catch (error) {
    next(error);
  }
});

// Delete a session
router.delete("/:id", async (req, res, next) => {
  try {
    const session = await Session.findOne({ _id: req.params.id });
    const deleteExerciseUser = await ExerciseUser.deleteMany({
      session: req.params.id,
    });
    const deleteSession = await Session.findOneAndDelete({
      _id: req.params.id,
    });

    res.json({ deleteExerciseUser, deleteSession });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
