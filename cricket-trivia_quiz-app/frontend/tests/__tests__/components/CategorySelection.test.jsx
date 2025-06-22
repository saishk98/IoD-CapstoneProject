import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CategorySelection from "../../../src/components/CategorySelection";
import { getCategories } from "../../../src/services/api";
import { vi, describe, it, beforeEach, expect } from "vitest";

// Mock the getCategories API
vi.mock("../../../src/services/api", () => ({
    getCategories: vi.fn(),
}));

describe("CategorySelection", () => {
    const mockSetCategory = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders loading spinner initially", () => {
        getCategories.mockReturnValue(new Promise(() => {})); // never resolves
        render(<CategorySelection setCategory={mockSetCategory} />);
        expect(screen.getByRole("progressbar")).toBeInTheDocument();
        expect(screen.getByText(/Select a Quiz Category/i)).toBeInTheDocument();
    });

    it("renders categories after loading", async () => {
        getCategories.mockResolvedValue(["Cricket", "History", "Science"]);
        render(<CategorySelection setCategory={mockSetCategory} />);
        await waitFor(() => {
            expect(screen.getByText("Cricket")).toBeInTheDocument();
            expect(screen.getByText("History")).toBeInTheDocument();
            expect(screen.getByText("Science")).toBeInTheDocument();
        });
        expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    it("calls setCategory when a category button is clicked", async () => {
        getCategories.mockResolvedValue(["Cricket"]);
        render(<CategorySelection setCategory={mockSetCategory} />);
        const button = await screen.findByText("Cricket");
        fireEvent.click(button);
        expect(mockSetCategory).toHaveBeenCalledWith("Cricket");
    });

    it("renders no buttons if categories array is empty", async () => {
        getCategories.mockResolvedValue([]);
        render(<CategorySelection setCategory={mockSetCategory} />);
        await waitFor(() => {
            expect(screen.queryAllByRole("button")).toHaveLength(0);
        });
    });

    it("matches snapshot after loading", async () => {
        getCategories.mockResolvedValue(["Cricket", "History"]);
        const { asFragment } = render(<CategorySelection setCategory={mockSetCategory} />);
        await screen.findByText("Cricket");
        expect(asFragment()).toMatchSnapshot();
    });
});