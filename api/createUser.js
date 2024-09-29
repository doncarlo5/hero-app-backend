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
const ProgramConstants = require("../constants/ProgramConstants");
const { default: mongoose } = require("mongoose");
const Program = require("../models/program.model");
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

  // Add exercise type defaults to the new user
  const createdExerciseTypes = await ExerciseType.insertMany(
    defaultExerciseTypesContant.map((exerciseType) => ({
      ...exerciseType,
      owner: newUser._id,
    }))
  );

  // Create a mapping from exercise type names to their _ids
  const exerciseTypeMap = createdExerciseTypes.reduce((map, exerciseType) => {
    map[exerciseType.name] = exerciseType._id;
    return map;
  }, {});

  // Seed programs for the new user based on ProgramConstants
  for (const sessionType in ProgramConstants) {
    const exercises = ProgramConstants[sessionType].map((exercise, index) => ({
      exerciseType: exerciseTypeMap[exercise.name],
      order: index + 1,
      alternatives: exercise.alternatives.map(
        (alt) => exerciseTypeMap[alt] // Map alternative exercise names to their ObjectIds
      ),
    }));

    // Create program for the user
    await Program.create({
      sessionType,
      exercises,
      owner: newUser._id,
    });
  }

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
