import {
  Box,
  Button,
  Card,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/quiz.css";

const ScoreScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    totalQuestions,
    userAnswers: rawAnswers,
    timeTaken,
    playerName,
    category,
  } = location.state || {};

  const normalize = (text) =>
    text?.trim().toLowerCase().replace(/[^a-z0-9]/gi, "");

  const userAnswers = rawAnswers.map((q) => ({
    ...q,
    isCorrect:
      typeof q.userAnswer === "string" &&
      normalize(q.correctAnswer).includes(normalize(q.userAnswer)),
  }));

  const correctAnswers = userAnswers.filter((q) => q.isCorrect).length || 0;
  const calculatedScore = Math.round(
    (correctAnswers / totalQuestions) * 100
  );

  const submitScore = async () => {
    const formattedAnswers = userAnswers.map((q) => ({
      question_id: q.id,
      selected_answer: q.userAnswer,
    }));

    try {
      await axios.post("http://localhost:5000/api/quiz/submit", {
        name: playerName,
        category,
        answers: formattedAnswers,
      });
    } catch (error) {
      console.error("🔥 Error submitting quiz score:", error);
    }
  };

  return (
    <Card className="quiz-results-card fade-in">
      <Typography variant="h4" align="center" className="quiz-title">
        🏏 Quiz Results – {category || "Unknown Category"}
      </Typography>

      <Box className="quiz-summary-box">
        <Typography variant="h5" className="quiz-score-summary">
          ✅ Score: {correctAnswers}/{totalQuestions} ({calculatedScore}%)
        </Typography>
        <Typography variant="h6" className="quiz-timer">
          ⏱ Time Taken: {Math.floor(timeTaken / 60)}:
          {(timeTaken % 60).toString().padStart(2, "0")}
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography
        variant="subtitle1"
        className="review-heading"
        align="center"
      >
        📋 Answer Review
      </Typography>

      <Table className="result-review-table">
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Question</TableCell>
            <TableCell>Your Answer</TableCell>
            <TableCell>Correct Answer</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {userAnswers.map((q, index) => (
            <TableRow key={index}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{q.question}</TableCell>
              <TableCell
                style={{ color: q.isCorrect ? "green" : "red" }}
              >
                {q.userAnswer || "No Answer"}
              </TableCell>
              <TableCell>{q.correctAnswer}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Box className="quiz-results-buttons">
        <Button
          variant="contained"
          className="leaderboard-button"
          onClick={() => {
            submitScore();
            navigate("/leaderboard", {
              state: { playerName, category, score: calculatedScore },
            });
          }}
        >
          View Leaderboard
        </Button>
        <Button
          variant="contained"
          className="home-button"
          onClick={() => navigate("/")}
        >
          ⬅ Return to Home
        </Button>
      </Box>
    </Card>
  );
};

export default ScoreScreen;
