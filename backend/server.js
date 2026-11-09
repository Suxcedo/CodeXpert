
const express = require("express");
const cors = require("cors");

require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const pathRoutes = require("./routes/pathRoutes");
const quizRoutes = require("./routes/quizRoutes");
const communityRoutes = require("./routes/communityRoutes");
const helpRoutes = require("./routes/helpRoutes");
const reelsRoutes = require("./routes/reelsRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());

// Authentication routes
app.use("/api/auth", authRoutes);

// Learning paths routes
app.use("/api/paths", pathRoutes);

// Quiz routes
app.use("/api/quizzes", quizRoutes);

// Community routes
app.use("/api/community", communityRoutes);

// Help Board routes
app.use("/api/help", helpRoutes);

// Reels routes
app.use("/api/reels", reelsRoutes);

// Settings routes
app.use("/api/settings", settingsRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "CodeXperts backend is running!"
    });
});

app.listen(PORT, () => {
    console.log(`CodeXperts backend running on http://localhost:${PORT}`);
});
