import { vi, describe, beforeEach, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Home from "../../../src/pages/Home";
import "@testing-library/jest-dom";

// Mock CategoryPopup to avoid rendering its internals
vi.mock("../../../src/components/CategoryPopup", () => ({
  default: (props) =>
    props.isOpen ? (
      <div data-testid="category-popup" onClick={props.onClose}>
        Category Popup
      </div>
    ) : null,
}));

// Mock useNavigate from react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    MemoryRouter: actual.MemoryRouter,
  };
});

describe("Home Page", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("renders the main headings and description", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    expect(screen.getByText(/WELCOME TO CRICKET/i)).toBeInTheDocument();
    expect(screen.getByText(/TRIVIA QUIZ/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Test your knowledge across different categories!/i)
    ).toBeInTheDocument();
  });

  it("renders the cricket logo image", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    const logo = screen.getByAltText("CricketLogo");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", "/assets/CricketLogo.png");
  });

  it("renders Start Quiz and View Leaderboard buttons", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    expect(
      screen.getByRole("button", { name: /Start Quiz/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /View Leaderboard/i })
    ).toBeInTheDocument();
  });

  it("opens CategoryPopup when Start Quiz is clicked", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    expect(screen.queryByTestId("category-popup")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Start Quiz/i }));
    expect(screen.getByTestId("category-popup")).toBeInTheDocument();
  });

  it("navigates to /leaderboard when View Leaderboard is clicked", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: /View Leaderboard/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/leaderboard");
  });

  it("closes CategoryPopup when onClose is called", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: /Start Quiz/i }));
    expect(screen.getByTestId("category-popup")).toBeInTheDocument();
    // Simulate closing the popup by clicking on the popup (which calls onClose in the mock)
    fireEvent.click(screen.getByTestId("category-popup"));
    // The popup should now be closed (not in the document)
    expect(screen.queryByTestId("category-popup")).not.toBeInTheDocument();
  });
});
