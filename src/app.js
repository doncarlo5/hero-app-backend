const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");

require("dotenv").config();

require("./database");

const middlewares = require("./middlewares");
const api = require("../api");

const app = express();

app.use(morgan("dev"));
app.use(helmet());

const FRONTEND_URL = process.env.FRONTEND_ORIGIN_URL || "http://localhost:3000";

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    message: "All good here! 🚀",
  });
});

app.use("/api", api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
