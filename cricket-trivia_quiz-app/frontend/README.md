# 🏏 Cricket Trivia Quiz - Frontend

A responsive React.js interface for the Cricket Trivia Quiz App, offering users a fast-paced and engaging quiz experience across categories like History, Rules, Players, Records, and Miscellaneous.

---

## Features

### Home ('/')
- Welcome screen with animated headings.
- Options to **Start Quiz** or **View Leaderboard**.
- Name input and category selector via modal popup.

### Quiz Interface ('/quiz')
- Dynamically fetches 20 questions from selected category.
- Timed questions with a countdown display using a mockable 'Timer'.
- Option selection highlights user's choice.
- Submit button disabled until all questions are answered.

### Score Summary ('/score')
- Final score display with percentage and time taken.
- Answer review: each question with user vs correct answer.
- Navigation button to go back or view leaderboard.

### Leaderboard ('/leaderboard')
- Displays Top 10 users sorted by average score.
- Includes category count per user.
- Shared-rank logic for tied scores (e.g., Rank 1 🥇 for multiple users).

---

## Tech Stack

| Layer        | Tech                                    |
|--------------|-----------------------------------------|
| Framework    | React.js                                |
| UI Libraries | Material UI, Bootstrap                  |
| Routing      | React Router                            |
| API Calls    | Axios                                   |
| Testing      | Vitest, React Testing Library           |
| Styling      | CSS Modules + Custom Stylesheets        |

---

## Getting Started
cd cricket-trivia_quiz-app
cd frontend
npm install
npm run dev 

The app runs at http://localhost:5173

## Run Tests
npm test

Mocked tests cover:
- Timer behaviour
- Quiz submission logic
- Button interactivity and routing
- Components isolation via Vitest + jsdom