const mongoose = require("mongoose");
const Trophy = require("../models/trophy.model");
const ExerciseType = require("../models/exercise-type.model");
const ExerciseUser = require("../models/exercise-user.model");
const Session = require("../models/session.model");
const User = require("../models/user.model");
const MONGO_URI = process.env.MONGO_URI;

console.log("Connecting to MongoDB...", `${MONGO_URI}`);

mongoose.connect(
  "mongodb+srv://admin-test:yqbvFFLNMy9nG3Mo@hero-app.p7ekmkz.mongodb.net/?retryWrites=true&w=majority&appName=hero-app",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const deleteNonOwnerData = async () => {
  try {
    const user = await User.findOne({ email: "pro.julien.thomas@gmail.com" });
    if (!user) {
      console.error("User not found!");
      return;
    }

    const userId = user._id;
    console.log("User found:", user);

    // Delete non-owner documents from each collection
    await ExerciseType.deleteMany({ owner: { $ne: userId } });
    console.log("Non-owner exercise types deleted.");

    await ExerciseUser.deleteMany({ owner: { $ne: userId } });
    console.log("Non-owner exercise users deleted.");

    await Session.deleteMany({ owner: { $ne: userId } });
    console.log("Non-owner sessions deleted.");

    await Trophy.deleteMany({ owner: { $ne: userId } });
    console.log("Non-owner trophies deleted.");

    console.log("All non-owner data deleted successfully!");
  } catch (error) {
    console.error("Error deleting non-owner data:", error);
  } finally {
    mongoose.connection.close();
  }
};
