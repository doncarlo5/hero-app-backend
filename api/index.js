const express = require("express");
const router = express.Router();

const auth = require("./auth.js");
const sessions = require("./sessions.js");
const exerciseUser = require("./exercise-user.js");
const exerciseType = require("./exercise-type.js");
const emojis = require("./emojis.js");

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

module.exports = router;
