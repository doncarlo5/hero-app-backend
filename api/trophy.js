const express = require("express");
const router = express.Router();

const Trophy = require("../models/trophy.model");
const ExerciseType = require("../models/exercise-type.model");
const Session = require("../models/session.model");
const TrophiesConstants = require("../constants/TrophiesConstant");
const isAuthenticated = require("../src/is-authenticated");

// checkAndAwardTrophies used in api/exercise-user.js when create and update
const checkAndAwardTrophies = async (exerciseUser) => {
  const { type, weight, rep, session, owner } = exerciseUser;
  const sessionDetails = await Session.findById(session);
  const bodyWeight = sessionDetails.body_weight;

  // Fetch the exercise type details
  const exerciseType = await ExerciseType.findById(type);

  if (!exerciseType) {
    console.log("Exercise type not found");
    return;
  }

  // Get trophy criteria based on exercise type name
  const trophyCriteria = TrophiesConstants[exerciseType.name];

  if (!trophyCriteria) {
    console.log("Trophy criteria not found");
    return;
  }

  // Fetch all trophies for the user for this exercise type
  const existingTrophies = await Trophy.find({ owner, exerciseType: type });
  const newTrophies = [];

  for (const trophy of trophyCriteria) {
    const { name, weightMultiplier, repsGoal, description, level, trophyType } =
      trophy;

    let trophyAchieved = false;
    let repsUser = 0;
    let weightUser = 0;

    // Check each rep and weight pair
    for (let i = 0; i < weight.length; i++) {
      if (rep[i] >= repsGoal && weight[i] >= bodyWeight * weightMultiplier) {
        trophyAchieved = true;
        repsUser = rep[i];
        weightUser = weight[i];
        break;
      }
    }

    // Check if the user already has this trophy
    const existingTrophy = existingTrophies.find((t) => t.level === level);


      if (existingTrophy && !existingTrophy.achieved && trophyAchieved) { 
        // Update the existing trophy to achieved if it's not already achieved
        existingTrophy.achieved = true;
        existingTrophy.awardedAt = new Date();
        existingTrophy.repsUser = repsUser;
        existingTrophy.weightUser = weightUser;
        existingTrophy.exerciseUser = exerciseUser._id;
        existingTrophy.bodyWeight = bodyWeight;
        const UpdatedTrophies = await existingTrophy.save();
        newTrophies.push(UpdatedTrophies.toJSON());
      }
    
      if (existingTrophy && existingTrophy.achieved && !trophyAchieved) {
        // If the exercise no longer meets the criteria, set the trophy to not achieved
        existingTrophy.achieved = false;
        existingTrophy.awardedAt = null;
        existingTrophy.repsUser = 0;
        existingTrophy.weightUser = 0;
        existingTrophy.exerciseUser = null;
        await existingTrophy.save();
      }
    }
  
  return newTrophies;
};

// Add a route to fetch all trophies for a user
router.get("/", isAuthenticated, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const trophies = await Trophy.find({ owner: userId })
      .populate("exerciseType")
      .populate("exerciseUser");
    res.json(trophies);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
module.exports.checkAndAwardTrophies = checkAndAwardTrophies;
