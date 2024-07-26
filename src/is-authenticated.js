const jwt = require("jsonwebtoken");
const SECRET_TOKEN = process.env.SECRET_TOKEN;
const User = require("../models/user.model");

const isAuthenticated = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      return res.status(401).json({ message: "No authorization found" });
    }

    const token = authorizationHeader.replace("Bearer ", "");
    if (!token) {
      // If token is undefined, return a 401 Unauthorized status
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      // Verify the token
      const payload = jwt.verify(token, SECRET_TOKEN, {
        algorithms: ["HS256"],
      });

      const user = await User.findById(payload._id);

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      req.user = user;

      next();
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = isAuthenticated;
