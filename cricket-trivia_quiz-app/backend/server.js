const express = require("express");
const cors = require("cors");
const { swaggerSpec, swaggerUiOptions } = require("./middleware/swagger");
const quizRoutes = require("./routes/quiz"); // ✅ Uses quiz.js for quiz-related endpoints

const app = express();
app.use(express.json());

// ✅ Improved CORS Configuration (Allows only frontend origin)
app.use(
    cors({
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
    })
);

// ✅ Serve Swagger API Docs
const swaggerUi = require("swagger-ui-express");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

// ✅ Register API Routes
app.use("/api/quiz", quizRoutes);

// ✅ Fix "Cannot GET /api/quiz" Issue - Define Base Route
app.get("/api/quiz", (req, res) => {
    res.json({ message: "✅ Quiz API is working!" });
});

// ✅ Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("🔥 Server Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
});

// ✅ Use Dynamic Port for Deployment Flexibility
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
