import axios from "axios";

const BASE_URL = "http://localhost:5000/api/quiz";

export async function getCategories() {
  const response = await axios.get(`${BASE_URL}/categories`);
  return response.data;
}

export async function getQuestions(category) {
  console.log("getQuestions", category);
  const response = await axios.get(
    `${BASE_URL}/questions?category=${category}`
  );
  return response.data;
}

export async function submitAnswer(
  userId,
  category,
  selectedAnswer,
  correctAnswer,
  startTime
) {
  const response = await axios.post(`${BASE_URL}/submit`, {
    userId,
    category,
    selectedAnswer,
    correctAnswer,
    startTime,
  });
  return response.data;
}

export async function getLeaderboard() {
  const response = await axios.get(`${BASE_URL}/leaderboard`);
  return response.data;
}

export const saveScore = async (playerData) => {
    const response = await fetch("http://localhost:5000/api/leaderboard", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(playerData),
    });

    return response.json();
};
