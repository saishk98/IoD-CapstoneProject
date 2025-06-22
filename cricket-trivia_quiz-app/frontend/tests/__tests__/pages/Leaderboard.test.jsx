import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import Leaderboard from "../../../src/pages/Leaderboard";
import { describe, it, expect, vi, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";

// Mock axios
vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
  },
}));
import axios from "axios";

// Mock useNavigate from react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithRouter = (ui) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
};

describe("Leaderboard Page", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders leaderboard table with data", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        topUsers: [
          {
            name: "Alice",
            categories_played: "General, History",
            avg_score: 95,
          },
          {
            name: "Bob",
            categories_played: "Science",
            avg_score: 90,
          },
          {
            name: "Charlie",
            categories_played: "Sports",
            avg_score: 90,
          },
        ],
      },
    });

    renderWithRouter(<Leaderboard />);

    expect(screen.getByText(/Top 10 Players/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("Bob")).toBeInTheDocument();
      expect(screen.getByText("Charlie")).toBeInTheDocument();
      expect(screen.getByText("🥇")).toBeInTheDocument();
      expect(screen.getAllByText("🥈").length).toBeGreaterThanOrEqual(1);
    });

    expect(screen.getByText("General, History")).toBeInTheDocument();
    expect(screen.getByText("95%")).toBeInTheDocument();
  });

  it("shows error message when leaderboard is empty", async () => {
    axios.get.mockResolvedValueOnce({ data: { topUsers: [] } });

    renderWithRouter(<Leaderboard />);

    await waitFor(() => {
      expect(
        screen.getByText(/No leaderboard data available/i)
      ).toBeInTheDocument();
    });
  });

  it("handles API error gracefully", async () => {
    axios.get.mockRejectedValueOnce(new Error("Network Error"));

    renderWithRouter(<Leaderboard />);

    await waitFor(() => {
      expect(
        screen.getByText(/No leaderboard data available/i)
      ).toBeInTheDocument();
    });
  });

  it("navigates to home when Return to Home button is clicked", async () => {
    axios.get.mockResolvedValueOnce({ data: { topUsers: [] } });

    renderWithRouter(<Leaderboard />);

    const button = await screen.findByRole("button", {
      name: /Return to Home/i,
    });
    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("renders correct emoji for top 3 ranks", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        topUsers: [
          { name: "A", categories_played: "Cat1", avg_score: 100 },
          { name: "B", categories_played: "Cat2", avg_score: 90 },
          { name: "C", categories_played: "Cat3", avg_score: 80 },
          { name: "D", categories_played: "Cat4", avg_score: 70 },
        ],
      },
    });

    renderWithRouter(<Leaderboard />);

    await waitFor(() => {
      expect(screen.getByText("🥇")).toBeInTheDocument();
      expect(screen.getByText("🥈")).toBeInTheDocument();
      expect(screen.getByText("🥉")).toBeInTheDocument();
      expect(screen.getByText("4")).toBeInTheDocument();
    });
  });
});