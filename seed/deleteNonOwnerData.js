const mongoose = require("mongoose");
const Trophy = require("../models/trophy.model");
const User = require("../models/user.model");

mongoose.connect("mongodb+srv://admin-test:yqbvFFLNMy9nG3Mo@hero-app.p7ekmkz.mongodb.net/?retryWrites=true&w=majority&appName=hero-app", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const changeTrophyOwner = async () => {
  try {
    // Find the user by email
    const user = await User.findOne({ email: "pro.julien.thomas@gmail.com" });
    if (!user) {
      console.error("User not found!");
      return;
    }

    // Get the user's ID
    const userId = user._id;
    console.log("User found:", user);

    // Update all trophies to have the new owner
    const result = await Trophy.updateMany({}, { owner: userId });
    console.log(`Updated ${result.nModified} trophies to new owner`);
  } catch (error) {
    console.error("Error updating trophies:", error);
  } finally {
    mongoose.connection.close();
  }
};
