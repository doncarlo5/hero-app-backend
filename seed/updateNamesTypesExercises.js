const mongoose = require("mongoose");
const Exercise = require("../models/exercise-type.model")
const defaultExerciseTypes = require("../constants/DefaultExerciseTypesConstant");

mongoose.connect(
  "mongodb+srv://admin-test:yqbvFFLNMy9nG3Mo@hero-app.p7ekmkz.mongodb.net/?retryWrites=true&w=majority&appName=hero-app",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);


// List of exercises that should not be updated
const doNotUpdate = [
  "Fentes Bulgare - Haltères",
  "Développé couché - Haltères",
  "Dead Lift - Trap Bar",
  "Overhead Press - Barre"
];

const updateExerciseNames = async () => {
  try {
    for (const defaultExercise of defaultExerciseTypes) {
      const { name } = defaultExercise;

      // Check if the exercise is in the "doNotUpdate" list
      if (doNotUpdate.includes(name)) {
        console.log(`Skipping update for: "${name}"`);
        continue; // Skip the rest of the loop for this exercise
      }

      // Find the exercise by matching on advice, timer, repRange1, etc.
      const existingExercise = await Exercise.findOne({
        advice: defaultExercise.advice,
        timer: defaultExercise.timer,
        repRange1: defaultExercise.repRange1,
        repRange2: defaultExercise.repRange2,
        repRange3: defaultExercise.repRange3,
        type_session: defaultExercise.type_session,
      });

      if (existingExercise && existingExercise.name !== name) {
        // If the exercise is found and the name is different, update the name
        existingExercise.name = name;
        await existingExercise.save();
        console.log(`Updated exercise name to: "${name}"`);
      } else if (existingExercise) {
        console.log(`Exercise name is already correct: "${name}"`);
      } else {
        console.log(`Exercise not found for: "${name}"`);
      }
    }
  } catch (error) {
    console.error("Error updating exercise names:", error);
  } finally {
    mongoose.connection.close();
  }
};

updateExerciseNames();
