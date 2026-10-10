const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const pathRoutes = require("./routes/pathRoutes");

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());

// Authentication routes
app.use("/api/auth", authRoutes);

// Learning paths routes
app.use("/api/paths", pathRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "CodeXperts backend is running!"
    });
});

app.listen(PORT, () => {
    console.log(`CodeXperts backend running on http://localhost:${PORT}`);
});