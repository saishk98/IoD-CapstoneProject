const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Cricket Trivia API",
            version: "1.0.0",
            description: "API documentation for Cricket Quiz app"
        },
        servers: [{ url: "http://localhost:5000" }],
    },
    apis: ["./routes/*.js"], // ✅ Ensure this includes quiz.js
};

const swaggerSpec = swaggerJsdoc(options);
const swaggerUiOptions = { customCss: ".swagger-ui .topbar " };

module.exports = { swaggerSpec, swaggerUiOptions };