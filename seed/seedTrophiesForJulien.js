const mongoose = require("mongoose");
const Trophy = require("../models/trophy.model");
const User = require("../models/user.model");
const ExerciseType = require("../models/exercise-type.model");
const ExerciseUser = require("../models/exercise-user.model");
const Session = require("../models/session.model");
const TrophiesConstants = require("../constants/TrophiesConstant");

// MongoDB connection
mongoose.connect("mongodb+srv://admin-test:yqbvFFLNMy9nG3Mo@hero-app.p7ekmkz.mongodb.net/?retryWrites=true&w=majority&appName=hero-app", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Main function to award trophies to a specific user by email
const awardTrophiesToSpecificUser = async () => {
  try {
    // Find the user by email
    const user = await User.findOne({ email: "pro.julien.thomas@gmail.com" });
    if (!user) {
      console.error("User not found!");
      return;
    }

    console.log(`Processing user: ${user.email}`);

    // Fetch all exercise types for the user to ensure trophies exist for each
    const exerciseTypes = await ExerciseType.find({ owner: user._id });

    for (const exerciseType of exerciseTypes) {
      const trophyCriteria = TrophiesConstants[exerciseType.name];

      // Ensure all trophies are created for this exercise type
      if (trophyCriteria) {
        for (const trophy of trophyCriteria) {
          const existingTrophy = await Trophy.findOne({ owner: user._id, exerciseType: exerciseType._id, level: trophy.level });
          if (!existingTrophy) {
            // Create a trophy if it doesn't exist
            await Trophy.create({
              name: trophy.name,
              exerciseType: exerciseType._id,
              exerciseUser: null, // Will be updated later
              trophyType: trophy.trophyType,
              repsGoal: trophy.repsGoal,
              weightMultiplier: trophy.weightMultiplier,
              description: trophy.description,
              level: trophy.level,
              achieved: false,
              awardedAt: null,
              owner: user._id,
              rewardText: trophy.rewardText,
            });
            console.log(`Created new trophy: ${trophy.name} for user: ${user.email}`);
          }
        }
      }
    }

    // Fetch all exercise sessions for the user
    const sessions = await Session.find({ owner: user._id }).populate("exercise_user_list");

    // Iterate through each session
    for (const session of sessions) {
      const bodyWeight = session.body_weight;

      // Iterate over each exercise user in the session
      for (const exerciseUser of session.exercise_user_list) {
        // Fetch the exercise type details
        const exerciseType = await ExerciseType.findById(exerciseUser.type);

        if (!exerciseType) {
          console.log(`Exercise type not found for exerciseUser: ${exerciseUser._id}`);
          continue;
        }

        // Get the trophy criteria for the exercise type
        const trophyCriteria = TrophiesConstants[exerciseType.name];
        if (!trophyCriteria) {
          console.log(`No trophy criteria found for exercise type: ${exerciseType.name}`);
          continue;
        }

        // Iterate through each trophy level in the criteria
        for (const trophy of trophyCriteria) {
          const { name, weightMultiplier, repsGoal, level } = trophy;

          let trophyAchieved = false;
          let repsUser = 0;
          let weightUser = 0;

          // Check each rep and weight pair from the exerciseUser
          for (let i = 0; i < exerciseUser.weight.length; i++) {
            if (exerciseUser.rep[i] >= repsGoal && exerciseUser.weight[i] >= bodyWeight * weightMultiplier) {
              trophyAchieved = true;
              repsUser = exerciseUser.rep[i];
              weightUser = exerciseUser.weight[i];
              break;
            }
          }

          // Fetch the existing trophy for the user at this level
          const existingTrophy = await Trophy.findOne({ owner: user._id, exerciseType: exerciseUser.type, level });

          if (existingTrophy) {
            if (trophyAchieved && !existingTrophy.achieved) {
              // Update the trophy to achieved if the conditions are met
              existingTrophy.achieved = true;
              existingTrophy.awardedAt = new Date();
              existingTrophy.repsUser = repsUser;
              existingTrophy.weightUser = weightUser;
              existingTrophy.bodyWeight = bodyWeight;
              existingTrophy.exerciseUser = exerciseUser._id;
              await existingTrophy.save();
              console.log(`Updated trophy: ${name} for user: ${user.email}`);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error awarding trophies:", error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the trophy awarding process for the specific user
awardTrophiesToSpecificUser();
