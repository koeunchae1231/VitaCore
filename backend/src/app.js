const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const accountRoutes = require("./routes/accountRoutes");
const characterRoutes = require("./routes/characterRoutes");
const connectionCodeRoutes = require("./routes/connectionCodeRoutes");
const measurementRoutes = require("./routes/measurementRoutes");
const securityEventRoutes = require("./routes/securityEventRoutes");
const waveMeasurementRoutes = require("./routes/waveMeasurementRoutes");
const errorMiddleware = require("./middlewares/errorMiddleware");
const authController = require("./controllers/authController");
const authenticateToken = require("./middlewares/authMiddleware");

const app = express();

app.set("trust proxy", 1);
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("VitaCore backend server is running!");
});

app.use("/api/auth", authRoutes);
app.use("/api/account", accountRoutes);
app.get("/api/me", authenticateToken, authController.me);
app.use("/api/characters", characterRoutes);
app.use("/api/connection-codes", connectionCodeRoutes);
app.use("/api", measurementRoutes);
app.use("/api", securityEventRoutes);
app.use("/api", waveMeasurementRoutes);

app.use(errorMiddleware);

module.exports = app;
