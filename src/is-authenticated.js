const jwt = require("jsonwebtoken");
const SECRET_TOKEN = process.env.SECRET_TOKEN;
const User = require("../models/user.model");
const { supabase } = require("./supabaseClient");
const createUser = require("../api/createUser");

const isAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const refreshToken = req.headers["refreshtoken"];
    const accessToken = authHeader && authHeader.split(" ")[1];

    if (!refreshToken || !accessToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      console.log(error);
      next(error);
    }

    const user = await User.findOne({ supabaseId: data.user.id });
    req.user = user;

    if (!user) {
      console.log("User not found, creating user...🐸", data);
      await createUser(data);
    }

    next();
  } catch (error) {
    console.log(error);

    next(error);
  }
};

module.exports = isAuthenticated;
