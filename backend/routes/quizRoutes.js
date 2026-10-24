
const express = require("express");
const router = express.Router();

const authenticateUser = require("../middleware/authMiddleware");

const {
    getQuiz,
    submitQuiz,
    getLatestQuizAttempt
} = require("../controllers/quizController");

// Retrieve the learner's latest saved quiz attempt.
router.get("/:quizId/attempts/latest", authenticateUser, getLatestQuizAttempt);

// Load a quiz.
router.get("/:quizId", authenticateUser, getQuiz);

// Submit a quiz.
router.post("/:quizId/submit", authenticateUser, submitQuiz);

module.exports = router;
