import { vi, describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import QuizInterface from "../../../src/pages/QuizInterface";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import * as api from "../../../src/services/api";

// ✅ Mock Timer component
vi.mock("../../../src/components/Timer", () => ({
  default: () => <div data-testid="timer-mock">⏱ 0:00</div>,
}));

// ✅ Mock getQuestions API
const mockQuestions = [
  {
    id: "q1",
    question_text: "Who won the 2011 Cricket World Cup?",
    options: ["1. India", "2. Australia", "3. Sri Lanka", "4. England"],
    correct_answer: "India",
  },
  {
    id: "q2",
    question_text: "Which player has the highest ODI score?",
    options: [
      "1. Rohit Sharma",
      "2. Sachin Tendulkar",
      "3. Chris Gayle",
      "4. Martin Guptill",
    ],
    correct_answer: "Rohit Sharma",
  },
];

vi.spyOn(api, "getQuestions").mockResolvedValue(mockQuestions);

const renderWithRouter = (route = "/quiz/WorldCup?name=John") =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/quiz/:category" element={<QuizInterface />} />
        <Route path="/score" element={<div data-testid="score-page" />} />
      </Routes>
    </MemoryRouter>
  );

describe("QuizInterface", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", async () => {
    renderWithRouter();
    expect(screen.getByText(/Loading questions/i)).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    await waitFor(() => expect(api.getQuestions).toHaveBeenCalled());
  });

  it("renders questions and options after loading", async () => {
    renderWithRouter();
    expect(
      await screen.findByText(/Who won the 2011 Cricket World Cup/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Which player has the highest ODI score/i)
    ).toBeInTheDocument();
    const options = screen.getAllByRole("button");
    expect(options.length).toBe(9);
  });

  it("displays player name and category", async () => {
    renderWithRouter();
    expect(await screen.findByText("Welcome,")).toBeInTheDocument();
    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText(/WorldCup Quiz/i)).toBeInTheDocument();
  });

  it("selects an answer and highlights it", async () => {
    renderWithRouter();
    const indiaBtn = await screen.findByRole("button", { name: "India" });
    fireEvent.click(indiaBtn);
    expect(indiaBtn).toHaveClass("quiz-option selected");
  });

  it("disables submit button until all questions are answered", async () => {
    renderWithRouter();
    const submitBtn = await screen.findByRole("button", {
      name: /Submit Quiz/i,
    });
    expect(submitBtn).toBeDisabled();
    fireEvent.click(await screen.findByRole("button", { name: "India" }));
    expect(submitBtn).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Rohit Sharma" }));
    expect(submitBtn).not.toBeDisabled();
  });

  it("navigates to score page with correct state on submit", async () => {
    renderWithRouter();
    fireEvent.click(await screen.findByRole("button", { name: "India" }));
    fireEvent.click(screen.getByRole("button", { name: "Rohit Sharma" }));
    const submitBtn = screen.getByRole("button", { name: /Submit Quiz/i });
    fireEvent.click(submitBtn);
    await waitFor(() =>
      expect(screen.getByTestId("score-page")).toBeInTheDocument()
    );
  });

  it("shows timer and formatted time", async () => {
    renderWithRouter();
    expect(screen.getByTestId("timer-mock")).toBeInTheDocument();
  });

  it("cleans option text before displaying", async () => {
    renderWithRouter();
    const indiaBtn = await screen.findByRole("button", { name: "India" });
    expect(indiaBtn).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /1\./ })
    ).not.toBeInTheDocument();
  });
});
