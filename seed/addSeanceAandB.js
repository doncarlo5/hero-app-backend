const mongoose = require("mongoose");
const ExerciseType = require("../models/exercise-type.model"); // Assuming you have an ExerciseType model
const User = require("../models/user.model"); // Assuming you have a User model

mongoose.connect(
  "mongodb+srv://admin-test:yqbvFFLNMy9nG3Mo@hero-app.p7ekmkz.mongodb.net/?retryWrites=true&w=majority&appName=hero-app",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// List of default exercise types (Séance A and Séance B only)
const defaultExerciseTypes = [
  {
    name: "Développé incliné - Barre",
    advice: "Top set puis -10% du poids à chaque série",
    timer: 150,
    repRange1: "4-6",
    repRange2: "6-8",
    repRange3: "8-10",
    repRange4: "",
    type_session: ["Séance A", "Upper A"],
    trophyLocked: true,
  },
  {
    name: "ATG Split Squat - Haltères",
    advice: "45 secondes de chaque côté",
    timer: 45,
    repRange1: "10-15",
    repRange2: "10-15",
    repRange3: "10-15",
    repRange4: "",
    type_session: ["Séance A"],
  },
  {
    name: "Upright Row - Haltères - Séance A",
    advice: "",
    timer: 60,
    repRange1: "10-15",
    repRange2: "10-15",
    repRange3: "10-15",
    repRange4: "",
    type_session: ["Séance A"],
  },
  {
    name: "Curl Incliné - Haltères - Séance A",
    advice: "1 mega série - 10s entre chaque - 4 séries",
    timer: 10,
    repRange1: "10-15",
    repRange2: "4-6",
    repRange3: "4-6",
    repRange4: "",
    type_session: ["Séance A"],
  },
  {
    name: "Dips lestés",
    advice: "Top set puis -10% du poids à chaque série",
    timer: 150,
    repRange1: "4-6",
    repRange2: "6-8",
    repRange3: "8-10",
    repRange4: "",
    type_session: ["Séance B"],
  },
  {
    name: "Rowing Bucheron - Haltères",
    advice: "Top set puis -10% du poids à chaque série - 1min de chaque côté",
    timer: 60,
    repRange1: "4-6",
    repRange2: "6-8",
    repRange3: "8-10",
    repRange4: "",
    type_session: ["Séance B"],
  },
  {
    name: "Romanian Deadlift - Barre",
    advice: "Rétraction, menton sur la clavicule et s'arreter en dessous des genoux",
    timer: 90,
    repRange1: "10-15",
    repRange2: "10-15",
    repRange3: "10-15",
    repRange4: "",
    type_session: ["Séance B"],
  },
  {
    name: "Upright Row - Haltères - Séance B",
    advice: "",
    timer: 60,
    repRange1: "10-15",
    repRange2: "10-15",
    repRange3: "10-15",
    repRange4: "",
    type_session: ["Séance B"],
  },
  {
    name: "Extension Triceps Nuque - Haltères",
    advice: "1 mega série - 10s entre chaque - 4 séries",
    timer: 10,
    repRange1: "10-15",
    repRange2: "4-6",
    repRange3: "4-6",
    repRange4: "",
    type_session: ["Séance B"],
  },
];

// Function to create exercises for Séance A and Séance B for a specific user
const createExerciseTypesForUser = async (email) => {
  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.error(`User with email "${email}" not found!`);
      return;
    }

    for (const exercise of defaultExerciseTypes) {
      // Check if the exercise type already exists in the database for this user
      const existingExercise = await ExerciseType.findOne({
        name: exercise.name,
        owner: user._id, // Make sure to check for ownership
      });

      if (!existingExercise) {
        // If the exercise doesn't exist, create a new one with the user's ID as the owner
        const newExercise = new ExerciseType({
          ...exercise,
          owner: user._id, // Assign the user as the owner
        });
        await newExercise.save();
        console.log(`Created exercise: "${exercise.name}" for user "${email}"`);
      } else {
        console.log(`Exercise "${exercise.name}" already exists for user "${email}".`);
      }
    }
  } catch (error) {
    console.error("Error creating exercise types:", error);
  } finally {
    mongoose.connection.close(); // Close the database connection when done
  }
};

// Call the function with the specific user's email
createExerciseTypesForUser("pro.julien.thomas@gmail.com");
