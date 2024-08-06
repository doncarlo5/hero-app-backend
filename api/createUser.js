const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const ExerciseType = require("../models/exercise-type.model");
const isAuthenticated = require("../src/is-authenticated");
const Trophy = require("../models/trophy.model");
const TrophiesConstant = require("../constants/TrophiesConstant");
const defaultExerciseTypesContant = require("../constants/DefaultExerciseTypesConstant");
const { default: mongoose } = require("mongoose");
const salt = 10;
const SECRET_TOKEN = process.env.SECRET_TOKEN;

const createUser = async (sessionData) => {
  const supabaseId = sessionData.user.id;
  let firstName = "";
  let lastName = "";
  if (sessionData.user.user_metadata.full_name) {
    [firstName, lastName] = sessionData.user.user_metadata.full_name.split(" ");
  } else {
    firstName = sessionData.user.user_metadata.firstName;
    lastName = sessionData.user.user_metadata.lastName;
  }
  const email = sessionData.user.email;

  // Create the user
  const newUser = await User.create({
    supabaseId,
    firstName: firstName,
    lastName: lastName,
    email,
  });

  // Add exercise type default to the new user

  const createdExerciseTypes = await ExerciseType.insertMany(
    defaultExerciseTypesContant.map((exerciseType) => ({
      ...exerciseType,
      owner: newUser._id,
    }))
  );

  // Function to seed trophies for a new user
  for (const exerciseType of createdExerciseTypes) {
    const trophies = TrophiesConstant[exerciseType.name];
    if (trophies) {
      for (const trophy of trophies) {
        await Trophy.create({
          name: trophy.name,
          exerciseType: exerciseType._id,
          exerciseUser: null,
          trophyType: trophy.trophyType,
          repsGoal: trophy.repsGoal,
          weightMultiplier: trophy.weightMultiplier,
          description: trophy.description,
          level: trophy.level,
          awardedAt: null,
          achieved: false,
          rewardText: trophy.rewardText,
          owner: newUser._id,
        });
      }
    }
  }
};

module.exports = createUser;
