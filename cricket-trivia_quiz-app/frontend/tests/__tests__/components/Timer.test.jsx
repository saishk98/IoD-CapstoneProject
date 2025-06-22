import { render } from "@testing-library/react";
import Timer from "../../../src/components/Timer";
import { act } from "react";
import { vi, describe, it, beforeEach, afterEach, expect } from "vitest";

vi.useFakeTimers();

describe("Timer component", () => {
    let setTimeTakenMock;

    beforeEach(() => {
        setTimeTakenMock = vi.fn();
    });

    afterEach(() => {
        vi.clearAllTimers();
        vi.clearAllMocks();
    });

    it("should call setTimeTaken every second", () => {
        render(<Timer setTimeTaken={setTimeTakenMock} />);
        expect(setTimeTakenMock).not.toHaveBeenCalled();

        act(() => {
            vi.advanceTimersByTime(1000);
        });
        expect(setTimeTakenMock).toHaveBeenCalledWith(1);

        act(() => {
            vi.advanceTimersByTime(2000);
        });
        expect(setTimeTakenMock).toHaveBeenCalledWith(2);
        expect(setTimeTakenMock).toHaveBeenCalledWith(3);
    });

    it("should clear interval on unmount", () => {
        const { unmount } = render(<Timer setTimeTaken={setTimeTakenMock} />);
        unmount();
        act(() => {
            vi.advanceTimersByTime(5000);
        });
        // Should not call setTimeTaken after unmount
        expect(setTimeTakenMock).not.toHaveBeenCalledWith(1);
    });

    it("should not render anything", () => {
        const { container } = render(<Timer setTimeTaken={setTimeTakenMock} />);
        expect(container.firstChild).toBeNull();
    });
});