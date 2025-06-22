import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import QuizInterface from "./pages/QuizInterface";
import ScoreScreen from "./pages/ScoreScreen";
import Leaderboard from "./pages/Leaderboard";
import "./styles/App.css";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} /> {/* ✅ Unchanged as requested */}
        <Route path="/quiz/:category" element={<QuizInterface />} />
        <Route path="/score" element={<ScoreScreen />} /> {/* ✅ ScoreScreen now properly receives quiz results */}
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </Router>
  );
};

export default App;
