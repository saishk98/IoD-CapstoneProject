import React, { useState } from "react";
import { Button, Container, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CategoryPopup from "../components/CategoryPopup";
import "../styles/home.css";

const Home = () => {
    const navigate = useNavigate();
    const [popupOpen, setPopupOpen] = useState(false);

    return (
        <Container className="home-container">
            <Typography variant="h3" className="home-title">
                WELCOME TO CRICKET
            </Typography>
            <img src="/assets/CricketLogo.png" alt="CricketLogo" className="CricketLogo" />
            <Typography variant="h3" className="home-title">
                TRIVIA QUIZ
            </Typography>
            <Typography variant="body1" className="home-description">
                Test your knowledge across different categories!
            </Typography>
            <div className="button-container">
                <Button variant="contained" className="start-button" onClick={() => setPopupOpen(true)}>
                    Start Quiz
                </Button>
                <Button variant="outlined" className="leaderboard-button" onClick={() => navigate("/leaderboard")}>
                    View Leaderboard
                </Button>
            </div>
            <CategoryPopup isOpen={popupOpen} onClose={() => setPopupOpen(false)} />
        </Container>
    );
};

export default Home;
