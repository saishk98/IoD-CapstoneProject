import { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Container,
  Typography,
  Button,
} from "@mui/material";
import "../styles/leaderboard.css";
import { useNavigate } from "react-router-dom";

const Leaderboard = () => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/quiz/top-users"
        );
        setLeaderboard(response.data.topUsers);
      } catch (err) {
        console.error("🔥 Error fetching leaderboard:", err);
        setLeaderboard([]);
      }
    };

    fetchTopUsers();
  }, []);

  // Shared Rank Logic with Emojis
  const getDisplayRank = (players) => {
    let ranks = [];
    let currentRank = 1;
    let lastScore = null;

    players.forEach((player, index) => {
      if (player.avg_score !== lastScore) {
        currentRank = index + 1;
      }
      lastScore = player.avg_score;
      ranks.push(currentRank);
    });

    return ranks;
  };

  const ranks = getDisplayRank(leaderboard);

  const getEmoji = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };

  return (
    <Container className="leaderboard-container fade-in">
      <Typography variant="h4" align="center" gutterBottom>
        🏆 Top 10 Players - Average Score Leaderboard 🏏
      </Typography>
      <Typography variant="subtitle1" align="center" color="textSecondary">
        Based on overall performance across quiz categories
      </Typography>

      {leaderboard.length > 0 ? (
        <Table className="leaderboard-table">
          <TableHead>
            <TableRow className="leaderboard-header-row">
              <TableCell className="rank-cell">Rank</TableCell>
              <TableCell className="name-cell">Name</TableCell>
              <TableCell className="category-cell">Categories</TableCell>
              <TableCell className="score-cell">Average Score</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaderboard.map((player, index) => (
              <TableRow key={index}>
                <TableCell className="rank-cell">
                  {getEmoji(ranks[index])}
                </TableCell>
                <TableCell className="name-cell">{player.name}</TableCell>
                <TableCell className="category-cell">
                  {player.categories_played}
                </TableCell>
                <TableCell className="score-cell">
                  {player.avg_score}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Typography variant="h6" color="error">
          ⚠ No leaderboard data available.
        </Typography>
      )}

      <Button
        variant="contained"
        className="return-home-button"
        onClick={() => navigate("/")}
      >
        ⬅ Return to Home
      </Button>
    </Container>
  );
};

export default Leaderboard;
