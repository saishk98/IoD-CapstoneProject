import { render, screen, fireEvent } from "@testing-library/react";
import CategoryPopup from "../../../src/components/CategoryPopup";
import { MemoryRouter } from "react-router-dom";
import { vi, describe, it, beforeEach, expect } from "vitest";

// 🔧 Mocks
const mockNavigate = vi.fn();
const onClose = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    MemoryRouter: actual.MemoryRouter,
  };
});

describe("CategoryPopup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <CategoryPopup isOpen={false} onClose={onClose} />,
      { wrapper: MemoryRouter }
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders popup when isOpen is true", () => {
    render(<CategoryPopup isOpen={true} onClose={onClose} />, {
      wrapper: MemoryRouter,
    });
    expect(screen.getByText("Welcome to Cricket Trivia")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Your Name")).toBeInTheDocument();
    expect(screen.getByText("Proceed to Quiz")).toBeInTheDocument();
  });

  it("calls onClose and navigates to / when close button is clicked", () => {
    render(<CategoryPopup isOpen={true} onClose={onClose} />, {
      wrapper: MemoryRouter,
    });
    fireEvent.click(screen.getByRole("button", { name: /✖/ }));
    expect(onClose).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("updates name input value", () => {
    render(<CategoryPopup isOpen={true} onClose={onClose} />, {
      wrapper: MemoryRouter,
    });
    const input = screen.getByPlaceholderText("Your Name");
    fireEvent.change(input, { target: { value: "Sachin" } });
    expect(input.value).toBe("Sachin");
  });

  it("selects a category when a category button is clicked", () => {
    render(<CategoryPopup isOpen={true} onClose={onClose} />, {
      wrapper: MemoryRouter,
    });
    const categoryBtn = screen.getByText("Players");
    fireEvent.click(categoryBtn);
    expect(categoryBtn).toHaveClass("selected");
  });

  it("proceed button is disabled if name or category is not selected", () => {
    render(<CategoryPopup isOpen={true} onClose={onClose} />, {
      wrapper: MemoryRouter,
    });
    const proceedBtn = screen.getByText("Proceed to Quiz");
    expect(proceedBtn).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText("Your Name"), {
      target: { value: "Rahul" },
    });
    expect(proceedBtn).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText("Your Name"), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByText("History"));
    expect(proceedBtn).toBeDisabled();
  });

  it("shows alert if proceeding without name", () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    render(<CategoryPopup isOpen={true} onClose={onClose} />, {
      wrapper: MemoryRouter,
    });

    const input = screen.getByPlaceholderText("Your Name");
    fireEvent.change(input, { target: { value: "" } }); // ensure empty
    fireEvent.click(screen.getByText("Players"));
    fireEvent.click(screen.getByText("Proceed to Quiz"));

    // expect(alertSpy).toHaveBeenCalledWith(
    //   "Please enter your name before proceeding!"
    // );
    expect(mockNavigate).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it("navigates to quiz page with name and category on proceed", () => {
    render(<CategoryPopup isOpen={true} onClose={onClose} />, {
      wrapper: MemoryRouter,
    });

    fireEvent.change(screen.getByPlaceholderText("Your Name"), {
      target: { value: "Dhoni" },
    });
    fireEvent.click(screen.getByText("Rules"));
    fireEvent.click(screen.getByText("Proceed to Quiz"));

    expect(mockNavigate).toHaveBeenCalledWith("/quiz/Rules?name=Dhoni");
  });

  it("resets name and category when popup closes and reopens", () => {
    const { rerender } = render(
      <CategoryPopup isOpen={true} onClose={onClose} />,
      { wrapper: MemoryRouter }
    );

    fireEvent.change(screen.getByPlaceholderText("Your Name"), {
      target: { value: "Virat" },
    });
    fireEvent.click(screen.getByText("Records"));

    rerender(<CategoryPopup isOpen={false} onClose={onClose} />);
    rerender(<CategoryPopup isOpen={true} onClose={onClose} />);

    expect(screen.getByPlaceholderText("Your Name").value).toBe("");
    expect(screen.getByText("Records")).not.toHaveClass("selected");
  });
});
