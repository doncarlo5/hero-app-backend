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

        // Fetch any existing trophies the user may already have for this exercise type
        const existingTrophies = await Trophy.find({ owner: user._id, exerciseType: exerciseUser.type });

        // Iterate through each trophy level in the criteria
        for (const trophy of trophyCriteria) {
          const { name, weightMultiplier, repsGoal, description, level, trophyType } = trophy;

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

          // Check if user already has this trophy
          const existingTrophy = existingTrophies.find(t => t.level === level);

          if (existingTrophy && !existingTrophy.achieved && trophyAchieved) {
            // Update existing trophy if not yet achieved
            existingTrophy.achieved = true;
            existingTrophy.awardedAt = new Date();
            existingTrophy.repsUser = repsUser;
            existingTrophy.weightUser = weightUser;
            existingTrophy.bodyWeight = bodyWeight;
            await existingTrophy.save();
            console.log(`Updated trophy: ${name} for user: ${user.email}`);
          } else if (!existingTrophy && trophyAchieved) {
            // Award a new trophy if conditions are met
            const newTrophy = new Trophy({
              name,
              exerciseType: exerciseUser.type,
              exerciseUser: exerciseUser._id,
              trophyType,
              repsGoal,
              weightMultiplier,
              achieved: true,
              description,
              level,
              repsUser,
              weightUser,
              awardedAt: new Date(),
              owner: user._id,
              bodyWeight,
              rewardText: trophy.rewardText,
            });

            await newTrophy.save();
            console.log(`Awarded new trophy: ${name} for user: ${user.email}`);
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
