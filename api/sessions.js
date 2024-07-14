const express = require("express");
const router = express.Router();

const Session = require("../models/session.model");
const ExerciseUser = require("../models/exercise-user.model");
const isAuthenticated = require("../src/is-authenticated");

// Get all sessions by user

router.get("/", isAuthenticated, async (req, res, next) => {
  try {
    // add page, limit, sort

    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 5;
    const sort = req.query.sort || "-createdAt";

    const query = { owner: req.user._id };

    // get sort by if negative then desc else asc

    const sortField = sort[0] === "-" ? sort.substring(1) : sort;
    const sortOrder = sort[0] === "-" ? "desc" : "asc";

    const sessions = await Session.find(query)
      .populate("exercise_user_list")
      .skip(page * limit)
      .limit(limit)
      .sort({ [sortField]: sortOrder });

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
