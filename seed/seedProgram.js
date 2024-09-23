const mongoose = require("mongoose");
const Program = require("../models/program.model");
const ExerciseType = require("../models/exercise-type.model");
const User = require("../models/user.model");
const MONGODB_URI = process.env.MONGODB_URI;

console.log("Connecting to MongoDB...", `${MONGODB_URI}`);

mongoose.connect(
  "mongodb+srv://admin-test:yqbvFFLNMy9nG3Mo@hero-app.p7ekmkz.mongodb.net/?retryWrites=true&w=majority&appName=hero-app",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const programsData = {
  "Upper A": [
    {
      name: "Développé incliné - Barre",
      alternatives: ["Développé incliné - Haltères"],
    },
    { name: "Tractions lestées", alternatives: ["Rowing Bucheron - Haltères"] },
    { name: "Élévation frontale - Haltères", alternatives: [] },
    {
      name: "Curl Incliné - Haltères",
      alternatives: ["Curl Incliné - Barre EZ", "Curl Incliné - Poulie"],
    },
    { name: "Élévation latérales - Haltères", alternatives: [] },
  ],
  Lower: [
    { name: "Squat - Barre", alternatives: [] },
    {
      name: "Press",
      alternatives: [
        "Dead Lift - Trap Bar",
        "Fentes - Haltères",
        "Fentes - Barre",
        "Romanian Deadlift - Haltères",
      ],
    },
    { name: "Leg Curl", alternatives: [] },
    { name: "Leg Extension", alternatives: [] },
    {
      name: "Mollets - Barre Guidée",
      alternatives: ["Mollets - Barre", "Mollets - Leg Press"],
    },
    { name: "Upright Row Penché", alternatives: [] },
  ],
  "Upper B": [
    {
      name: "Overhead Press - Barre",
      alternatives: ["Développé assis - Haltères"],
    },
    {
      name: "Développé couché - Barre",
      alternatives: ["Développé couché - Haltères"],
    },
    { name: "Tractions Neutres", alternatives: ["Curl Marteau - Haltères"] },
    {
      name: "Oiseau assis - Haltères",
      alternatives: ["Face Pull - Poulie Haute", "Face Pull - Rotation"],
    },
    { name: "Upright Row - Haltères", alternatives: [] },
  ],
  "Séance A": [
    {
      name: "Développé incliné - Barre",
      alternatives: ["Développé incliné - Haltères"],
    },
    {
      name: "Tractions lestées",
      alternatives: ["Tractions lestées prise neutre"],
    },
    { name: "ATG Split Squat - Haltères", alternatives: [] },
    { name: "Upright Row - Haltères", alternatives: [] },
    {
      name: "Curl Incliné - Haltères",
      alternatives: ["Curl Incliné - Barre EZ", "Curl Incliné - Poulie"],
    },
  ],
  "Séance B": [
    { name: "Dips lestés", alternatives: [] },
    { name: "Rowing Bucheron - Haltères", alternatives: [] },
    { name: "Romanian Deadlift - Barre", alternatives: [] },
    { name: "Upright Row - Haltères", alternatives: [] },
    { name: "Extension Triceps Nuque - Haltères", alternatives: [] },
  ],
};

const updatePrograms = async () => {
  try {
    const user = await User.findOne({ email: "pro.julien.thomas@gmail.com" });
    if (!user) {
      console.error("User not found!");
      return;
    }

    const userId = user._id;

    for (const sessionType of Object.keys(programsData)) {
      const exercisesData = programsData[sessionType];
      const exercises = [];

      console.log(
        `\n--- Processing program for session type: ${sessionType} ---`
      );

      for (const exerciseData of exercisesData) {
        const exercise = await ExerciseType.findOne({
          name: exerciseData.name,
          owner: userId,
        });
        if (!exercise) {
          console.error(`Exercise ${exerciseData.name} not found!`);
          continue;
        }

        const alternatives = await ExerciseType.find({
          name: { $in: exerciseData.alternatives },
          owner: userId,
        });
        const alternativeIds = alternatives.map((alt) => alt._id);

        console.log(`Exercise: ${exercise.name}`);
        console.log(
          `Alternatives: ${
            alternatives.map((alt) => alt.name).join(", ") || "None"
          }`
        );

        exercises.push({
          exerciseType: exercise._id,
          order: exercises.length + 1,
          alternatives: alternativeIds,
        });
      }

      // Save the program to the database
      const existingProgram = await Program.findOne({
        sessionType,
        owner: userId,
      });

      if (existingProgram) {
        // Update the existing program
        existingProgram.exercises = exercises;
        await existingProgram.save();
        console.log(`Updated program for session type: ${sessionType}`);
      } else {
        // Create a new program
        await Program.create({
          sessionType,
          exercises,
          owner: userId,
        });
        console.log(`Created new program for session type: ${sessionType}`);
      }

      console.log(`--- Finished processing ${sessionType} ---\n`);
    }
  } catch (error) {
    console.error("Error updating programs:", error);
  } finally {
    mongoose.connection.close();
  }
};

updatePrograms();
