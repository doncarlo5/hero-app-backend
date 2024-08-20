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

    // Add exercise type default to the new user

    const createdExerciseTypes = await ExerciseType.insertMany(
      defaultExerciseTypesContant.map((exerciseType) => ({
        ...exerciseType,
        owner: newUser._id,
      }))
    );

    // Function to seed trophies for a new user
    const seedTrophiesForUser = async (userId, exerciseTypes) => {
      for (const exerciseType of exerciseTypes) {
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
              owner: userId,
            });
          }
        }
      }
    };

    await seedTrophiesForUser(newUser._id, createdExerciseTypes);

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

//* hasSeenOnboarding to true

router.patch(
  "/updateHasSeenOnboarding",
  isAuthenticated,
  async (req, res, next) => {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { hasSeenOnboarding: true },
        { new: true }
      );
      res
        .status(200)
        .json({ message: "User updated", results: { updatedUser } });
    } catch (error) {
      next(error);
    }
  }
);

//* get user info

// router.get("/user", isAuthenticated, async (req, res, next) => {
//   try {
//     const user = await User.findById(req.user._id);

module.exports = router;
