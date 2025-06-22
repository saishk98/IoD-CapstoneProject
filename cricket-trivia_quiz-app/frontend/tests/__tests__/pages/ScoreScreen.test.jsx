import { render, screen, fireEvent } from "@testing-library/react";
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from "vitest";
import ScoreScreen from "../../../src/pages/ScoreScreen";
import { MemoryRouter } from "react-router-dom";

// Mock useNavigate and useLocation
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: vi.fn(),
        useLocation: vi.fn(),
    };
});

// Mock axios
vi.mock("axios", () => ({
    default: {
        post: vi.fn().mockResolvedValue({}),
    },
}));

const mockNavigate = vi.fn();
const mockState = {
    totalQuestions: 3,
    userAnswers: [
        {
            id: 1,
            question: "Who won the 2011 Cricket World Cup?",
            userAnswer: "India",
            correctAnswer: "India",
        },
        {
            id: 2,
            question: "Who is known as the 'God of Cricket'?",
            userAnswer: "Sachin",
            correctAnswer: "Sachin Tendulkar",
        },
        {
            id: 3,
            question: "Which country hosted the 2019 Cricket World Cup?",
            userAnswer: "",
            correctAnswer: "England",
        },
    ],
    timeTaken: 95,
    playerName: "Test Player",
    category: "World Cup",
};

describe("ScoreScreen", () => {
    beforeEach(async () => {
        mockNavigate.mockClear();
        // Use vi to mock useNavigate and useLocation
        const reactRouterDom = await import("react-router-dom");
        reactRouterDom.useNavigate.mockReturnValue(mockNavigate);
        reactRouterDom.useLocation.mockReturnValue({ state: mockState });
    });
    it("renders quiz results with correct score and time", () => {
        render(
            <MemoryRouter>
                <ScoreScreen />
            </MemoryRouter>
        );
        expect(screen.getByText(/🏏 Quiz Results – World Cup/)).toBeInTheDocument();
        expect(screen.getByText(/✅ Score: 3\/3 \(100%\)/)).toBeInTheDocument();
        expect(screen.getByText(/⏱ Time Taken: 1:35/)).toBeInTheDocument();
    });

    it("renders answer review table with correct answers", () => {
        render(
            <MemoryRouter>
                <ScoreScreen />
            </MemoryRouter>
        );
        expect(screen.getByText("Who won the 2011 Cricket World Cup?")).toBeInTheDocument();
        // expect(screen.getByText("India")).toBeInTheDocument();
        expect(screen.getByText("Sachin")).toBeInTheDocument();
        expect(screen.getByText("Sachin Tendulkar")).toBeInTheDocument();
        expect(screen.getByText("No Answer")).toBeInTheDocument();
        expect(screen.getByText("England")).toBeInTheDocument();
    });
    it("calls navigate to leaderboard and submits score on leaderboard button click", async () => {
        const axios = (await import("axios")).default;
        render(
            <MemoryRouter>
                <ScoreScreen />
            </MemoryRouter>
        );
        const leaderboardBtn = screen.getByRole("button", { name: /View Leaderboard/i });
        fireEvent.click(leaderboardBtn);
        expect(axios.post).toHaveBeenCalledWith(
            "http://localhost:5000/api/quiz/submit",
            expect.objectContaining({
                name: "Test Player",
                category: "World Cup",
                answers: expect.any(Array),
            })
        );
        expect(mockNavigate).toHaveBeenCalledWith("/leaderboard", {
            state: { playerName: "Test Player", category: "World Cup", score: 100 },
        });
    });

    it("calls navigate to home on home button click", () => {
        render(
            <MemoryRouter>
                <ScoreScreen />
            </MemoryRouter>
        );
        const homeBtn = screen.getByRole("button", { name: /Return to Home/i });
        fireEvent.click(homeBtn);
        expect(mockNavigate).toHaveBeenCalledWith("/");
    });
    it("shows 'Unknown Category' if category is missing", async () => {
        const reactRouterDom = await import("react-router-dom");
        reactRouterDom.useLocation.mockReturnValue({
            state: { ...mockState, category: undefined },
        });
        render(
            <MemoryRouter>
                <ScoreScreen />
            </MemoryRouter>
        );
        expect(screen.getByText(/🏏 Quiz Results – Unknown Category/)).toBeInTheDocument();
    });
    it("shows 0 score if no correct answers", async () => {
        const reactRouterDom = await import("react-router-dom");
        reactRouterDom.useLocation.mockReturnValue({
            state: {
                ...mockState,
                userAnswers: mockState.userAnswers.map((q) => ({
                    ...q,
                    userAnswer: "wrong answer",
                })),
            },
        });
        render(
            <MemoryRouter>
                <ScoreScreen />
            </MemoryRouter>
        );
        expect(screen.getByText(/✅ Score: 0\/3 \(0%\)/)).toBeInTheDocument();
    });
});
