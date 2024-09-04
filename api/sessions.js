const express = require("express");
const router = express.Router();

const Session = require("../models/session.model");
const ExerciseUser = require("../models/exercise-user.model");
const isAuthenticated = require("../src/is-authenticated");

// Get all sessions by user
router.get("/", isAuthenticated, async (req, res, next) => {
  try {
    // Initialize pagination variables
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 5;

    // Initialize sort object
    const sort = {};
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(":");
      sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
    }

    // Initialize filter object
    const match = {};
    if (req.query.completed) {
      match.completed = req.query.completed === "true";
    }

    // Query to match user
    const query = { owner: req.user._id };

    // Check if the 'lastFourWeeks' parameter is present
    if (req.query.lastFourWeeks) {
      const now = new Date();
      const startOfCurrentWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const fourWeeksAgo = new Date(startOfCurrentWeek);
      fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28); // Go back 4 weeks

      // Fetch sessions from the last 4 weeks excluding the current week
      query.date_session = { $gte: fourWeeksAgo, $lt: startOfCurrentWeek };
    }

    // Fetch sessions with filtering, pagination, and sorting
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
    const createSession = await Session.create({
      date_session: req.body.date_session,
      type_session: req.body.type_session,
      body_weight: req.body.body_weight,
      exercise_user_list: req.body.exercise_user_list,
      is_done: req.body.is_done,
      comment: req.body.comment,
      owner: req.user._id,
    });
    res.json(createSession);
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
// When deleting a session, we also need to delete all exercise-user documents associated with that session with pull method

router.delete("/:id", async (req, res, next) => {
  try {
    // find session
    const session = await Session.findOne({ _id: req.params.id });

    // update and delete all exercise-user documents associated with that session with deleteMany

    const deleteExerciseUser = await ExerciseUser.deleteMany({
      session: req.params.id,
    });
    const deleteSession = await Session.findOneAndDelete({
      _id: req.params.id,
    });

    res.json({ deleteExerciseUser, deleteSession });

    // delete session

    // const deleteExerciseUser = await ExerciseUser.deleteMany({
    //   session: req.params.id,
    // });
    // const deleteSession = await Session.findOneAndDelete({
    //   _id: req.params.id,
    // });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
