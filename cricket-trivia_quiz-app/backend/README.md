# 🎯 Cricket Trivia Quiz – Backend API

Express.js backend powering the Cricket Quiz frontend. It manages quiz questions, score submissions, user data, and leaderboard rankings—all backed by a MySQL database.

## API Endpoints

### Quiz

| Method | Route                            | Description                               |
|--------|----------------------------------|-------------------------------------------|
| GET    | /api/quiz/categories             | Get all quiz categories (e.g., History, Miscellaneous) |
| GET    | /api/quiz/questions              | Fetch randomized questions by category and difficulty |
| GET    | /api/quiz/questions/:id          | Get a single question by ID               |

### Score & Submission

| Method | Route                            | Description                               |
|--------|----------------------------------|-------------------------------------------|
| POST   | /api/quiz/submit                 | Submit a user's answers and score         |
| GET    | /api/quiz/score                  | Retrieve score entries for a user         |

### Leaderboard & Analytics

| Method | Route                            | Description                               |
|--------|----------------------------------|-------------------------------------------|
| GET    | /api/quiz/leaderboard            | Get top 10 users ranked by average score  |
| GET    | /api/quiz/top-users              | Get users with the most categories played |
| GET    | /api/quiz/user-performance       | Get user's best score per category        |

---

## Database Schema (MySQL)

### 'users'

| Field       | Type        | Description                 |
|-------------|-------------|-----------------------------|
| user_id     | INT / UUID  | Primary key                 |
| name        | VARCHAR     | Player’s display name       |
| created_at  | DATETIME    | Registration timestamp      |

### 'questions'

| Field          | Type      | Description                       |
|----------------|-----------|-----------------------------------|
| id             | INT       | Primary key                       |
| category       | VARCHAR   | E.g., History, Players, Misc      |
| question_text  | TEXT      | Quiz question                     |
| difficulty     | ENUM      | Easy / Medium / Hard              |
| correct_answer | TEXT      | Correct option                    |
| option_1–4     | TEXT      | Multiple choice options           |

### 'user_scores'

| Field       | Type        | Description                        |
|-------------|-------------|------------------------------------|
| id          | INT         | Primary key                        |
| user_id     | INT (FK)    | Linked to 'users.user_id'          |
| category    | VARCHAR     | Category quiz belongs to           |
| score       | INT         | Score out of 100                   |
| timestamp   | DATETIME    | Submission time                    |

---

## Swagger Documentation
Interactive API docs: http://localhost:5000/api-docs
Test endpoints and view schemas directly in the browser.

## Setup
cd cricket-trivia_quiz-app
cd backend
npm install
npm start
