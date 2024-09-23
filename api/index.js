const express = require("express");
const router = express.Router();

const auth = require("./auth.js");
const sessions = require("./sessions.js");
const exerciseUser = require("./exercise-user.js");
const exerciseType = require("./exercise-type.js");
const trophy = require("./trophy.js");
const emojis = require("./emojis.js");
const feedback = require("./feedback.js");
const program = require("./program.js");

const isAuthenticated = require("../src/is-authenticated.js");

router.get("/", (req, res, next) => {
  res.json({
    message: "API - 👋🌎🌍🌏",
  });
});

router.use("/emojis", emojis);

router.use("/auth", auth);

router.use("/sessions", isAuthenticated, sessions);

router.use("/exercise-user", isAuthenticated, exerciseUser);

router.use("/exercise-type", isAuthenticated, exerciseType);

router.use("/trophies", isAuthenticated, trophy);

router.use("/feedbacks", feedback);

router.use("/program", isAuthenticated, program);

module.exports = router;
