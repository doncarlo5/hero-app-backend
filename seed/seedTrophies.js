const mongoose = require("mongoose");
const Trophy = require("../models/trophy.model");
const ExerciseType = require("../models/exercise-type.model");
const User = require("../models/user.model");
const TrophyConstants = require("../constants/TrophiesConstant");
const MONGODB_URI = process.env.MONGODB_URI;

console.log("Connecting to MongoDB...", `${MONGODB_URI}`);

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const initializeTrophies = async () => {
  try {
    const user = await User.findOne({ email: "testseed2@mail.com" });
    if (!user) {
      console.error("User not found!");
      return;
    }

    const userId = user._id;
    console.log("User found:", user);
    const exerciseTypes = await ExerciseType.find({ owner: userId });
    console.log("Exercise types found:", exerciseTypes);

    for (const exerciseType of exerciseTypes) {
      console.log(`Initializing trophies for ${exerciseType.name}...`);
      const trophies = TrophyConstants[exerciseType.name];
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
            owner: userId,
          });
          console.log(`Trophy ${trophy.name} initialized successfully!`);
        }
      }
    }
    console.log("Trophies initialized successfully!");
  } catch (error) {
    console.error("Error initializing trophies:", error);
  } finally {
    mongoose.connection.close();
  }
};
