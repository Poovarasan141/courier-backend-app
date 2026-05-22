const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const routes = require("./src/routes");
const authMiddleware = require("./src/middlewares/auth");

const app = express();

app.use(cors());

app.use(express.json());

app.use(morgan("dev"));

app.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

app.use(authMiddleware);

app.use("/api/v1", routes());

module.exports = app;
