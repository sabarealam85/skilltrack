require("dotenv").config();
const express = require("express");
const cors = require("cors");

const traineeRoutes = require("./routes/traineeRoutes");
const trainingRoutes = require("./routes/trainingRoutes");
const employmentRoutes = require("./routes/employmentRoutes");
const employersRoutes = require("./routes/employersRoutes");
const skillGapRoutes = require("./routes/skillGapRoutes");
const interventionRoutes = require("./routes/interventionRoutes");
const followupRoutes = require("./routes/followupRoutes");
const authRoutes = require("./routes/authRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const app = express();
const authenticateToken = require("./middleware/authMiddleware");
const requireAdmin = require("./middleware/requireAdmin");

app.use(cors());
app.use(express.json());


app.use("/api/trainees", authenticateToken, traineeRoutes);
app.use("/api/training", authenticateToken, trainingRoutes);
app.use("/api/employment", authenticateToken, employmentRoutes);
app.use("/api/employers", authenticateToken, employersRoutes);
app.use("/api/skill-gaps", authenticateToken, skillGapRoutes);
app.use("/api/interventions", authenticateToken, interventionRoutes);
app.use("/api/followups", authenticateToken, followupRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/notifications", authenticateToken, notificationRoutes);


app.get("/", (req, res) => {
    res.json({
        message: "SkillTrack Backend is running!"
    });
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`SkillTrack Backend running on http://localhost:${PORT}`);
});