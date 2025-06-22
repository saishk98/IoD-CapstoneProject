import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Container,
  Typography,
  CircularProgress,
  Stack,
  Paper,
} from "@mui/material";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { getQuestions } from "../services/api";
import Timer from "../components/Timer";
import "../styles/quiz.css";

const QuizInterface = () => {
  const { category } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const playerName = new URLSearchParams(location.search).get("name");

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeTaken, setTimeTaken] = useState(0);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const data = await getQuestions(category);
        setQuestions(data);
      } catch (err) {
        console.error("Error fetching questions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [category]);

const cleanOption = (option) =>
  option.replace(/^\d+\.\s*|\([^)]*\)|\[[^\]]*\]/g, "").trim();

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleAnswerSubmit = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    const score = Object.values(answers).filter(
      (ans, index) => ans === questions[index]?.correct_answer
    ).length;

    navigate("/score", {
      state: {
        playerName,
        category,
        score,
        totalQuestions: questions.length,
        userAnswers: questions.map((q) => ({
          id: q.id,
          question: q.question_text,
          userAnswer: answers[q.id] || "No Answer",
          correctAnswer: q.correct_answer,
          isCorrect: answers[q.id] === q.correct_answer,
        })),
        timeTaken,
      },
    });
  };

  return (
    <Container maxWidth="md" className="quiz-container">
      <Box className="quiz-header">
        <Typography variant="h4" align="center" gutterBottom>
          🏏 {category} Quiz
        </Typography>
        <Typography variant="subtitle1" align="center">
          Welcome, <strong>{playerName}</strong>
        </Typography>
        <Typography variant="body2" align="center" className="quiz-timer">
          ⏱ {formatTime(timeTaken)}
        </Typography>
        <Timer setTimeTaken={setTimeTaken} />
      </Box>

      {loading ? (
        <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
          <CircularProgress />
          <Typography variant="subtitle1" mt={2}>
            Loading questions...
          </Typography>
        </Box>
      ) : (
        <Box className="quiz-questions-scroll">
          {questions.map((q, index) => (
            <Paper key={q.id} className="question-card zoom-in">
              <Typography variant="h6" className="question-number">
                Q{index + 1}
              </Typography>
              <Typography variant="body1" className="question-text">
                {q.question_text}
              </Typography>
              <Stack spacing={1} mt={2}>
                {q.options.map((option, i) => {
                  const clean = cleanOption(option);
                  const isSelected = answers[q.id] === clean;
                  return (
                    <Button
                      key={i}
                      variant={isSelected ? "contained" : "outlined"}
                      className={isSelected ? "quiz-option selected" : "quiz-option"}
                      onClick={() => handleAnswerSubmit(q.id, clean)}
                    >
                      {clean}
                    </Button>
                  );
                })}
              </Stack>
            </Paper>
          ))}
        </Box>
      )}

      <Box textAlign="center" mt={4} mb={3}>
        <Button
          variant="contained"
          color="success"
          className="submit-button"
          disabled={Object.keys(answers).length !== questions.length}
          onClick={handleSubmit}
        >
          Submit Quiz
        </Button>
      </Box>
    </Container>
  );
};

export default QuizInterface;
