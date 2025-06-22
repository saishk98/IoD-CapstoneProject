const express = require("express");
const db = require("../config/db");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Quiz
 *   description: API endpoints for the Cricket Trivia Quiz
 */

/**
 * @swagger
 * /api/quiz/categories:
 *   get:
 *     summary: Get all quiz categories
 *     tags: [Quiz]
 *     responses:
 *       200:
 *         description: Successfully retrieved quiz categories
 *         content:
 *           application/json:
 *             example: ["History", "Players", "Records", "Rules"]
 */
router.get("/categories", async (req, res) => {
  try {
    const [categories] = await db.query(
      "SELECT DISTINCT category FROM questions LIMIT 10"
    );
    if (!categories.length)
      return res.status(404).json({ message: "No categories found" });

    res.json(categories.map((row) => row.category));
  } catch (err) {
    console.error("🔥 Error fetching categories:", err.message);
    res.status(500).json({
      error: "Internal Server Error: Unable to fetch quiz categories",
    });
  }
});

/**
 * @swagger
 * /api/quiz/questions:
 *   get:
 *     summary: Get quiz questions by category and/or difficulty level
 *     tags: [Quiz]
 *     parameters:
 *       - name: category
 *         in: query
 *         description: The quiz category (e.g., "History", "Players")
 *         required: false
 *         schema:
 *           type: string
 *       - name: difficulty
 *         in: query
 *         description: The difficulty level (e.g., "easy", "medium", "hard")
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved quiz questions
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 question_text: "Who has scored the most ODI centuries?"
 *                 category: "Players"
 *                 difficulty_level: "medium"
 *                 correct_answer: "Sachin Tendulkar"
 *                 options: ["Virat Kohli", "Ricky Ponting", "Jacques Kallis", "Sachin Tendulkar"]
 */
router.get("/questions", async (req, res) => {
  const { category } = req.query;
  if (!category)
    return res.status(400).json({ error: "Missing category parameter." });

  try {
    const [questions] = await db.query(
      "SELECT id, question_text, category, correct_answer, option_1, option_2, option_3, option_4 FROM questions WHERE category = ? ORDER BY RAND() LIMIT 20",
      [category]
    );

    if (!questions.length)
      return res
        .status(404)
        .json({ message: "No questions found for this category." });

    res.json(
      questions.map((q) => ({
        id: q.id,
        question_text: q.question_text,
        category: q.category,
        correct_answer: q.correct_answer,
        options: shuffleArray([q.option_1, q.option_2, q.option_3, q.option_4]),
      }))
    );
  } catch (err) {
    console.error("🔥 Error fetching questions:", err.message);
    res
      .status(500)
      .json({ error: "Internal Server Error: Unable to fetch quiz questions" });
  }
});

// ✅ Helper function to shuffle options randomly
const shuffleArray = (array) => {
  return array.sort(() => Math.random() - 0.5);
};

/**
 * @swagger
 * /api/quiz/questions/{id}:
 *   get:
 *     summary: Get a quiz question by its ID
 *     tags: [Quiz]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the quiz question
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved quiz question
 *         content:
 *           application/json:
 *             example:
 *               id: 1
 *               question_text: "Who has scored the most ODI centuries?"
 *               category: "Players"
 *               difficulty_level: "medium"
 *               correct_answer: "Sachin Tendulkar"
 *               options: ["Virat Kohli", "Ricky Ponting", "Jacques Kallis", "Sachin Tendulkar"]
 *       404:
 *         description: Question not found
 */
router.get("/questions/:id", async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "Question ID is required" });
  }
  try {
    const [rows] = await db.query(
      "SELECT id, question_text, category, difficulty_level, correct_answer, option_1, option_2, option_3, option_4 FROM questions WHERE id = ?",
      [id]
    );
    if (!rows.length) {
      return res.status(404).json({ message: "Question not found" });
    }
    const q = rows[0];
    res.json({
      id: q.id,
      question_text: q.question_text,
      category: q.category,
      difficulty_level: q.difficulty_level,
      correct_answer: q.correct_answer,
      options: [q.option_1, q.option_2, q.option_3, q.option_4],
    });
  } catch (err) {
    console.error("🔥 Error fetching question by id:", err.message);
    res
      .status(500)
      .json({ error: "Internal Server Error: Unable to fetch quiz question" });
  }
});

/**
 * @swagger
 * /api/quiz/submit:
 *   post:
 *     summary: Submit a quiz answer
 *     tags: [Quiz]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: The user ID of the quiz participant
 *               category:
 *                 type: string
 *                 description: The quiz category
 *               selectedAnswer:
 *                 type: string
 *                 description: The answer selected by the user
 *               correctAnswer:
 *                 type: string
 *                 description: The correct answer for the question
 *               startTime:
 *                 type: integer
 *                 description: The timestamp when the quiz started
 *     responses:
 *       200:
 *         description: Successfully recorded quiz response
 *         content:
 *           application/json:
 *             example:
 *               message: "Score updated successfully."
 *               score: 10
 *       400:
 *         description: Time expired or missing parameters
 */
const quizTimeout = 10000; // 10 seconds per question

router.post("/submit", async (req, res) => {
  const { name, category, answers } = req.body;

  if (!name || !category || !Array.isArray(answers)) {
    return res
      .status(400)
      .json({ error: "Missing required data in request body" });
  }

  try {
    // ✅ Fetch correct answers from database
    const [correctAnswers] = await db.query(
      "SELECT id, correct_answer FROM questions WHERE category = ?",
      [category]
    );

    if (!correctAnswers.length) {
      return res
        .status(404)
        .json({ error: "No questions found for this category." });
    }

    // ✅ Normalize function to clean both user and correct answers
    const normalize = (text) =>
      text
        ?.trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/gi, "");

    // ✅ Score calculation using cleaned comparisons
    let correctCount = 0;

    correctAnswers.forEach((question) => {
      const userAnswerObj = answers.find((a) => a.question_id === question.id);
      const userAnswer = userAnswerObj?.selected_answer;

      if (
        typeof userAnswer === "string" &&
        normalize(question.correct_answer).includes(normalize(userAnswer))
      ) {
        correctCount++;
      } else {
        console.log("❌ Mismatch →", {
          id: question.id,
          user: userAnswer,
          expected: question.correct_answer,
        });
      }
    });

    const totalQuestions = correctAnswers.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);

    // ✅ Ensure user exists
    let [userRows] = await db.query(
      "SELECT user_id FROM users WHERE name = ?",
      [name]
    );
    let user_id = userRows.length ? userRows[0].user_id : null;

    if (!user_id) {
      const [insertResult] = await db.query(
        "INSERT INTO users (name) VALUES (?)",
        [name]
      );
      user_id = insertResult.insertId;
    }

    // ✅ Insert new score
    const [insertScore] = await db.query(
      "INSERT INTO user_scores (user_id, category, score, timestamp) VALUES (?, ?, ?, NOW())",
      [user_id, category, percentage]
    );

    console.log(
      `✅ Score Submitted: ${name} — ${correctCount}/${totalQuestions} (${percentage}%) in ${category}`
    );
    res
      .status(200)
      .json({ message: "✅ Score stored successfully.", score: percentage });
  } catch (err) {
    console.error("🔥 Error storing quiz score:", err.message);
    res
      .status(500)
      .json({ error: "Internal Server Error: Could not store quiz score." });
  }
});

/**
 * @swagger
 * /api/quiz/leaderboard:
 *   get:
 *     summary: Retrieve the top 10 players on the leaderboard
 *     tags: [Quiz]
 *     responses:
 *       200:
 *         description: Successfully retrieved leaderboard
 *         content:
 *           application/json:
 *             example:
 *               - user_id: 101
 *                 category: "History"
 *                 score: 95
 *               - user_id: 102
 *                 category: "Players"
 *                 score: 90
 */
router.get("/leaderboard", async (req, res) => {
  try {
    const sql =
      "SELECT u.name, s.category, s.score AS best_score, s.timestamp AS latest_attempt " +
      "FROM users u " +
      "INNER JOIN user_scores s ON u.user_id = s.user_id " +
      "ORDER BY s.score DESC, s.timestamp DESC " +
      "LIMIT 10;"; // ✅ Ensures correct score retrieval

    const [leaderboard] = await db.query(sql);
    console.log("✅ Leaderboard Data Retrieved:", leaderboard);

    if (!Array.isArray(leaderboard) || !leaderboard.length) {
      console.warn("⚠ No leaderboard entries found.");
      return res.status(404).json({ message: "No leaderboard entries found." });
    }

    res.json(leaderboard);
  } catch (err) {
    console.error("🔥 Backend Error:", err.message);
    res.status(500).json({
      error: "Internal Server Error: Unable to fetch leaderboard data.",
    });
  }
});

/**
 * @swagger
 * /api/quiz/top-users:
 *   get:
 *     summary: Retrieve the top 10 users with average scores and category count
 *     tags:
 *       - Leaderboard
 *     parameters:
 *       - name: sort
 *         in: query
 *         description: Sorting option (e.g., "score", "categories_played")
 *         required: false
 *         schema:
 *           type: string
 *       - name: min_categories
 *         in: query
 *         description: Minimum number of categories played for filtering
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved top 10 users with ranking data
 *         content:
 *           application/json:
 *             example:
 *               - name: "SK"
 *                 categories_played: 5
 *                 avg_score: 88.5
 *       404:
 *         description: No user ranking data found
 *       500:
 *         description: Internal Server Error
 */
router.get("/top-users", async (req, res) => {
  const { sort = "score" } = req.query;

  const sortColumn =
    {
      score: "avg_score",
      name: "u.name",
      categories: "categories_played",
    }[sort] || "avg_score";

  try {
    const [rows] = await db.query(
      `SELECT u.name, 
              COUNT(DISTINCT s.category) AS categories_played,
              ROUND(AVG(s.score), 2) AS avg_score
       FROM users u
       JOIN user_scores s ON u.user_id = s.user_id
       GROUP BY u.user_id
       ORDER BY ${sortColumn} DESC
       LIMIT 10`
    );

    if (!rows.length) {
      return res.status(404).json({ message: "No top users found." });
    }

    return res.json({ topUsers: rows });
  } catch (err) {
    console.error("🔥 Error fetching top users:", err.message);
    return res.status(500).json({
      error: "Internal Server Error: Unable to fetch top user rankings",
    });
  }
});

/**
 * @swagger
 * /api/quiz/user-performance:
 *   get:
 *     summary: Retrieve each user's highest score per category with filtering options
 *     tags:
 *       - Leaderboard
 *     parameters:
 *       - name: name
 *         in: query
 *         description: Filter by specific user name
 *         required: false
 *         schema:
 *           type: string
 *       - name: category
 *         in: query
 *         description: Filter by quiz category
 *         required: false
 *         schema:
 *           type: string
 *       - name: date_range
 *         in: query
 *         description: Filter by date range (e.g., "last_week", "last_month")
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved user performance data
 *         content:
 *           application/json:
 *             example:
 *               - name: "SK"
 *                 category: "Miscellaneous"
 *                 highest_score: 90
 *                 latest_attempt: "2025-06-14T10:39:00Z"
 *       404:
 *         description: No user performance data found
 *       500:
 *         description: Internal Server Error
 */
router.get("/user-performance", async (req, res) => {
  const { name, category } = req.query;

  // Handle user-specific performance
  if (name) {
    try {
      const [rows] = await db.query(
        `SELECT s.category, MAX(s.score) AS best_score
         FROM users u
         JOIN user_scores s ON u.user_id = s.user_id
         WHERE u.name = ?
         GROUP BY s.category
         ORDER BY best_score DESC`,
        [name]
      );

      if (!rows.length) {
        return res
          .status(404)
          .json({ message: `No performance data for user '${name}'` });
      }

      return res.json({ user: name, performance: rows });
    } catch (err) {
      console.error("🔥 Error fetching user performance:", err.message);
      return res.status(500).json({
        error:
          "Internal Server Error: Unable to fetch user performance rankings",
      });
    }
  }

  if (category) {
    try {
      const [rows] = await db.query(
        `SELECT u.name, MAX(s.score) AS top_score
         FROM users u
         JOIN user_scores s ON u.user_id = s.user_id
         WHERE s.category = ?
         GROUP BY u.name
         ORDER BY top_score DESC
         LIMIT 10`,
        [category]
      );

      if (!rows.length) {
        return res
          .status(404)
          .json({ message: `No scores found for category '${category}'` });
      }

      return res.json({ category, topUsers: rows });
    } catch (err) {
      console.error("🔥 Error fetching category leaderboard:", err.message);
      return res.status(500).json({
        error:
          "Internal Server Error: Unable to fetch user performance rankings",
      });
    }
  }

  // If neither name nor category is provided
  return res.status(400).json({
    error: "Provide either 'name' or 'category' as a query parameter.",
  });
});

/**
 * @swagger
 * /api/quiz/score:
 *   get:
 *     summary: Retrieve quiz score for a specific user
 *     description: Fetches the total correct answers and score percentage for the given user.
 *     tags:
 *       - Score
 *     parameters:
 *       - name: name
 *         in: query
 *         description: The name of the user whose score is being requested
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the user's score
 *         content:
 *           application/json:
 *             example:
 *               correctAnswers: 8
 *               totalQuestions: 20
 *               percentage: 40.0
 *       400:
 *         description: Missing required name parameter
 *       404:
 *         description: No score data found for the specified user
 *       500:
 *         description: Internal Server Error
 */

router.get("/score", async (req, res) => {
  const { name } = req.query;
  if (!name) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    const [scoreData] = await db.query(
      "SELECT COUNT(*) AS correct_answers, (COUNT(*) / 20) * 100 AS percentage " +
        "FROM user_scores WHERE name = ? AND score > 0",
      [name]
    );

    if (!scoreData.length) {
      console.warn("⚠ No score data found for user:", name);
      return res
        .status(404)
        .json({ message: "No score data found for this user." });
    }

    console.log(
      `✅ Score Data Retrieved: ${scoreData[0].correct_answers}/20 (${scoreData[0].percentage}%)`
    );
    res.json(scoreData[0]);
  } catch (err) {
    console.error("🔥 Error fetching score:", err.message);
    res
      .status(500)
      .json({ error: "Internal Server Error: Unable to fetch score data." });
  }
});

module.exports = router;
