const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const ExerciseType = require("../models/exercise-type.model");
const isAuthenticated = require("../src/is-authenticated");
const salt = 10;
const SECRET_TOKEN = process.env.SECRET_TOKEN;

//* Sign Up

router.post("/signup", async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check empty fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    // Check Email already exists
    const userEmailAlreadyExists = await User.findOne({ email: email });

    if (userEmailAlreadyExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Create the user
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    // add exercise type default to the new user

    const defaultExerciseType = [
      {
        name: "Rowing bucheron",
        advice: "1 min gauche puis 1 min droite",
        timer: 60,
        repRange1: "8-12",
        repRange2: "8-12",
        repRange3: "8-12",
        type_session: "Upper A",
      },
      {
        name: "Développé incliné - Barre",
        advice: "Top set puis -10% du poids à chaque série",
        timer: 150,
        repRange1: "4-6",
        repRange2: "6-8",
        repRange3: "8-10",
        type_session: "Upper A",
      },
      {
        name: "Leg Extension",
        advice: '30" de chaque avec Leg Curl',
        timer: 30,
        repRange1: "8-12",
        repRange2: "8-12",
        repRange3: "8-12",
        type_session: "Lower",
      },
      {
        name: "Développé couché - Haltères",
        advice: "Top set puis -10% du poids à chaque série",
        timer: 120,
        repRange1: "4-6",
        repRange2: "6-8",
        repRange3: "8-10",
        type_session: "Upper B",
      },
      {
        name: "Fentes Bulgare - Haltères",
        advice: "",
        timer: 90,
        repRange1: "10-15",
        repRange2: "10-15",
        repRange3: "10-15",
        type_session: "Lower",
      },
      {
        name: "Tractions lestées",
        advice: "Top set puis 10% du poids à chaque série",
        timer: 120,
        repRange1: "4-6",
        repRange2: "6-8",
        repRange3: "8-10",
        type_session: "Upper A",
      },
      {
        name: "Élévation frontale - Poulie vis-à-vis",
        advice: 'Pic de contraction 2" en haut',
        timer: 90,
        repRange1: "10-15",
        repRange2: "10-15",
        repRange3: "10-15",
        type_session: "Upper A",
      },
      {
        name: "Romanian Deadlift - Haltères",
        advice: "",
        timer: 90,
        repRange1: "10-15",
        repRange2: "10-15",
        repRange3: "10-15",
        type_session: "Lower",
      },
      {
        name: "Fentes - Barre",
        advice: "",
        timer: 90,
        repRange1: "10-15",
        repRange2: "10-15",
        repRange3: "10-15",
        type_session: "Lower",
      },
      {
        name: "Fentes - Haltères",
        advice: "",
        timer: 90,
        repRange1: "10-15",
        repRange2: "10-15",
        repRange3: "10-15",
        type_session: "Lower",
      },
      {
        name: "Développé couché - Barre",
        advice: "Top set puis -10% du poids à chaque série",
        timer: 120,
        repRange1: "4-6",
        repRange2: "6-8",
        repRange3: "8-10",
        type_session: "Upper B",
      },
      {
        name: "Tractions Neutres",
        advice: "Tirer avec les bras, pas avec le dos",
        timer: 90,
        repRange1: "8-12",
        repRange2: "8-12",
        repRange3: "8-12",
        type_session: "Upper B",
      },
      {
        name: "Face Pull - Poulie Haute",
        advice: "",
        timer: 60,
        repRange1: "15-20",
        repRange2: "15-20",
        repRange3: "15-20",
        type_session: "Upper B",
      },
      {
        name: "Face Pull - Rotation",
        advice: "",
        timer: 60,
        repRange1: "10-15",
        repRange2: "10-15",
        repRange3: "10-15",
        type_session: "Upper B",
      },
      {
        name: "Développé incliné - Haltères",
        advice: "Top set puis 10% du poids à chaque série",
        timer: 150,
        repRange1: "4-6",
        repRange2: "6-8",
        repRange3: "8-10",
        type_session: "Upper A",
      },
      {
        name: "Curl Incliné - Barre EZ",
        advice: "",
        timer: 90,
        repRange1: "8-12",
        repRange2: "8-12",
        repRange3: "8-12",
        type_session: "Upper A",
      },
      {
        name: "Élévation latérales - Haltères",
        advice:
          "Raptor Set: Dernière série en dégressive mécanique -> Upright Row",
        timer: 60,
        repRange1: "15-20",
        repRange2: "10-15",
        repRange3: "8-10",
        type_session: "Upper A",
      },
      {
        name: "Dead Lift - Trap Bar",
        advice: "",
        timer: 120,
        repRange1: "6-10",
        repRange2: "6-10",
        repRange3: "6-10",
        type_session: "Lower",
      },
      {
        name: "Mollets - Barre Guidée",
        advice: "Tempo 1-2-2-1",
        timer: 60,
        repRange1: "12-15",
        repRange2: "8-12",
        repRange3: "6-10",
        type_session: "Lower",
      },
      {
        name: "Overhead Press - Barre",
        advice: "Top set puis -10% du poids à chaque série",
        timer: 150,
        repRange1: "4-6",
        repRange2: "6-8",
        repRange3: "8-10",
        type_session: "Upper B",
      },
      {
        name: "Curl Marteau - Haltères",
        advice: "",
        timer: 90,
        repRange1: "8-12",
        repRange2: "8-12",
        repRange3: "8-12",
        type_session: "Upper B",
      },
      {
        name: "Hip Thrust - Barre",
        advice: 'Pic contraction 2" en haut',
        timer: 90,
        repRange1: "8-12",
        repRange2: "8-12",
        repRange3: "8-12",
        type_session: "Lower",
      },
      {
        name: "Élévation frontale - Haltères",
        advice: 'Pic de contraction 2" en haut',
        timer: 90,
        repRange1: "10-15",
        repRange2: "10-15",
        repRange3: "10-15",
        type_session: "Upper A",
      },
      {
        name: "Curl Incliné - Haltères",
        advice: "Viser épaule avec petit doigt",
        timer: 90,
        repRange1: "8-12",
        repRange2: "8-12",
        repRange3: "8-12",
        type_session: "Upper A",
      },
      {
        name: "Curl Incliné - Poulie",
        advice: "",
        timer: 60,
        repRange1: "8-12",
        repRange2: "8-12",
        repRange3: "8-12",
        type_session: "Upper A",
      },
      {
        name: "Squat - Barre",
        advice: "",
        timer: 120,
        repRange1: "6-10",
        repRange2: "6-10",
        repRange3: "6-10",
        type_session: "Lower",
      },
      {
        name: "Press",
        advice: "75kg à vide",
        timer: 120,
        repRange1: "6-10",
        repRange2: "6-10",
        repRange3: "6-10",
        type_session: "Lower",
      },
      {
        name: "Leg Curl",
        advice: '30" de chaque avec Leg Extension',
        timer: 30,
        repRange1: "8-12",
        repRange2: "8-12",
        repRange3: "8-12",
        type_session: "Lower",
      },
      {
        name: "Upright Row Penché",
        advice:
          "Augmenter le poids à chaque série. Dernière série dégressive AMRAP",
        timer: 60,
        repRange1: "15-20",
        repRange2: "10-15",
        repRange3: "6-10",
        type_session: "Lower",
      },
      {
        name: "Développé assis - Haltères",
        advice: "Top set puis -10% du poids à chaque série",
        timer: 150,
        repRange1: "4-6",
        repRange2: "6-8",
        repRange3: "8-10",
        type_session: "Upper B",
      },
      {
        name: "Oiseau assis - Haltères",
        advice: "Coudes perpendiculaires au corps",
        timer: 60,
        repRange1: "10-15",
        repRange2: "10-15",
        repRange3: "10-15",
        type_session: "Upper B",
      },
      {
        name: "Upright Row - Haltères",
        advice:
          "Augmenter le poids à chaque série. Dernière série dégressive AMRAP",
        timer: 60,
        repRange1: "12-15",
        repRange2: "8-12",
        repRange3: "6-10",
        type_session: "Upper B",
      },
    ];

    const userExerciseType = await ExerciseType.find({ owner: newUser._id });

    try {
      for (const exerciseType of defaultExerciseType) {
        await ExerciseType.create({
          name: exerciseType.name,
          advice: exerciseType.advice,
          timer: exerciseType.timer,
          repRange1: exerciseType.repRange1,
          repRange2: exerciseType.repRange2,
          repRange3: exerciseType.repRange3,
          type_session: exerciseType.type_session,
          owner: newUser._id,
        });
      }
    } catch (error) {
      console.log(error);
    }

    // Create the token to log in

    const token = jwt.sign({ _id: newUser._id }, SECRET_TOKEN, {
      algorithm: "HS256",
      expiresIn: "365d",
    });

    return res.status(201).json({ newUser, message: "User created", token });
  } catch (error) {
    next(error);
  }
});

//* Log In

router.post("/login", async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    // Check empty fields
    if (!email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    // Check if email exists
    const existingUser = await User.findOne({ email }).select("password email");

    if (!existingUser) {
      return res.status(400).json({ message: "Email not found" });
    }

    // Check if password is correct
    const matchingPassword = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!matchingPassword) {
      return res.status(400).json({ message: "Password is incorrect" });
    }

    // Create the token
    const token = jwt.sign({ _id: existingUser._id }, SECRET_TOKEN, {
      algorithm: "HS256",
      expiresIn: "365d",
    });

    return res.status(200).json({ token });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//* Verify Token

router.get("/verify", isAuthenticated, (req, res, next) => {
  const user = req.user;
  try {
    return res.status(200).json({ user, message: "Token is valid" });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//* Update user

router.patch("/settings", isAuthenticated, async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const updateUser = {
      firstName,
      lastName,
      email,
    };

    const existingUser = await User.findOne({ email });
    if (
      existingUser &&
      existingUser._id.toString() !== req.user._id.toString()
    ) {
      // If the email already exists for another user, return an error
      return res.status(400).json({ message: "Email already in use" });
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateUser, {
      new: true,
    });

    res.status(200).json({ message: "User updated", results: { updatedUser } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
