import { c2mChart } from "../src/c2mChart";
import { MockAudioEngine } from "./_mockAudioEngine";
import { hertzes } from "./_constants";
import { ScreenReaderBridge } from "../src/ScreenReaderBridge";

jest.useFakeTimers();
window.AudioContext = jest.fn().mockImplementation(() => {
    return {};
});

const setup = (options = {}) => {
    const audioEngine = new MockAudioEngine();
    const mockElement = document.createElement("div");
    const mockElementCC = document.createElement("div");
    const { err } = c2mChart({
        type: "line",
        data: {
            a: [
                { x: 1, y: 1 },
                { x: 2, y: 2 },
                { x: 3, y: 3 },
                { x: 4, y: 4 }
            ],
            b: [
                { x: 1, y: 11 },
                { x: 2, y: 12 },
                { x: 3, y: 13 },
                { x: 4, y: 14 }
            ]
        },
        element: mockElement,
        cc: mockElementCC,
        audioEngine,
        options: { hertzes, ...options }
    });
    expect(err).toBe(null);
    mockElement.dispatchEvent(new Event("focus"));

    const press = (key: string) =>
        mockElement.dispatchEvent(new KeyboardEvent("keydown", { key }));
    const spoken = () =>
        Array.from(mockElementCC.children).map((el) =>
            (el.textContent ?? "").trim()
        );
    const lastSpoken = () =>
        mockElementCC.lastElementChild?.textContent?.trim();
    // Every announcement made, in order (the live region itself only keeps the latest)
    const renderSpy = jest.spyOn(ScreenReaderBridge.prototype, "render");
    renderSpy.mockClear();
    const announced = () => renderSpy.mock.calls.map(([text]) => text.trim());

    return { audioEngine, press, spoken, lastSpoken, announced };
};

afterEach(() => {
    jest.restoreAllMocks();
});

describe("speech after navigation", () => {
    test("Moving quickly plays every tone but speaks only the point you stop on", () => {
        const { audioEngine, press, lastSpoken, announced } = setup();
        const playsBefore = audioEngine.playCount;

        press("ArrowRight");
        jest.advanceTimersByTime(100);
        press("ArrowRight");
        jest.advanceTimersByTime(100);
        press("ArrowRight");

        // Every move played its tone immediately
        expect(audioEngine.playCount).toBe(playsBefore + 3);
        jest.advanceTimersByTime(250);
        expect(lastSpoken()).toBe("4, 4");
        // The final point is announced once, not once per key press (each press used to schedule its own
        // announcement, and the point is read when the timer fires, so the old behavior was "4, 4" three times)
        const points = announced().filter((text) => text !== "");
        expect(points).toEqual(["4, 4"]);
    });

    test("A single move speaks after the tone", () => {
        const { press, lastSpoken } = setup();

        press("ArrowRight");
        jest.advanceTimersByTime(249);
        expect(lastSpoken()).not.toBe("2, 2");

        jest.advanceTimersByTime(1);
        expect(lastSpoken()).toBe("2, 2");
    });

    test("Category changes are delayed and cancelled the same way", () => {
        const { press, lastSpoken, spoken } = setup({
            playOnCategoryChange: true
        });

        press("PageDown");
        // Not spoken yet
        expect(spoken().join(" ")).not.toContain('"b"');

        // Moving before the delay elapses cancels the category announcement
        jest.advanceTimersByTime(100);
        press("ArrowRight");
        jest.advanceTimersByTime(250);
        expect(spoken().join(" ")).not.toContain('"b"');
        expect(lastSpoken()).toBe("2, 12");

        // A category change you pause on is spoken, describing the point after the change
        press("PageUp");
        jest.advanceTimersByTime(250);
        expect(lastSpoken()).toContain('"a"');
        expect(lastSpoken()).toContain("2, 2");
    });

    test("Nothing is spoken when speech is disabled", () => {
        const { press, spoken } = setup({ enableSpeech: false });
        const before = spoken().length;

        press("ArrowRight");
        jest.advanceTimersByTime(250);

        expect(spoken().length).toBe(before);
    });
});

describe("holding a key down", () => {
    // Each test starts with a tap (keydown + keyup), which is how the chart learns that keyups arrive
    const holdSetup = () => {
        const mockElement = document.createElement("div");
        const mockElementCC = document.createElement("div");
        c2mChart({
            type: "line",
            data: [1, 2, 3, 4, 5, 6, 7, 8],
            element: mockElement,
            cc: mockElementCC,
            options: { enableSound: false }
        });
        mockElement.dispatchEvent(new Event("focus"));
        const down = (key = "ArrowRight", repeat = false) =>
            mockElement.dispatchEvent(
                new KeyboardEvent("keydown", { key, code: key, repeat })
            );
        const up = (key = "ArrowRight") =>
            mockElement.dispatchEvent(
                new KeyboardEvent("keyup", { key, code: key })
            );
        const lastSpoken = () =>
            mockElementCC.lastElementChild?.textContent?.trim();

        // Tap once; "1, 2" then stays in the live region until something new is spoken
        down();
        up();
        jest.advanceTimersByTime(250);
        expect(lastSpoken()).toBe("1, 2");

        return { mockElement, down, up, lastSpoken };
    };

    test("Speech waits while the key is held, then speaks once after release", () => {
        const { down, up, lastSpoken } = holdSetup();

        // Press and hold: the OS waits longer than the tone before it starts repeating
        down();
        jest.advanceTimersByTime(375);
        expect(lastSpoken()).toBe("1, 2"); // nothing new spoken yet
        down("ArrowRight", true);
        jest.advanceTimersByTime(90);
        down("ArrowRight", true);
        jest.advanceTimersByTime(300);
        expect(lastSpoken()).toBe("1, 2"); // nothing new spoken yet

        up();
        jest.advanceTimersByTime(249);
        expect(lastSpoken()).toBe("1, 2"); // nothing new spoken yet
        jest.advanceTimersByTime(1);
        expect(lastSpoken()).toBe("4, 5");
    });

    test("Speaks anyway if a held key's release never arrives", () => {
        const { down, lastSpoken } = holdSetup();

        down();
        jest.advanceTimersByTime(250 + 999);
        expect(lastSpoken()).toBe("1, 2"); // nothing new spoken yet
        jest.advanceTimersByTime(1);
        expect(lastSpoken()).toBe("2, 3");
    });

    test("Releasing Command clears keys whose release macOS swallowed", () => {
        const { down, up, lastSpoken } = holdSetup();

        // Command held: macOS sends no keyup for the arrow
        down("Meta");
        down();
        up("Meta");
        jest.advanceTimersByTime(250);
        expect(lastSpoken()).toBe("2, 3");
    });

    test("Holding past the end still announces the last point on release", () => {
        const { down, up, lastSpoken } = holdSetup();

        // From index 1, hold → well past the last point (index 7)
        down();
        jest.advanceTimersByTime(375);
        for (let i = 0; i < 12; i++) {
            down("ArrowRight", true);
            jest.advanceTimersByTime(90);
        }
        expect(lastSpoken()).toBe("1, 2"); // nothing new spoken yet

        up();
        jest.advanceTimersByTime(250);
        expect(lastSpoken()).toBe("7, 8");
    });

    test("Holding past the start still announces the first point on release", () => {
        const { down, up, lastSpoken } = holdSetup();

        down("ArrowLeft");
        jest.advanceTimersByTime(375);
        for (let i = 0; i < 5; i++) {
            down("ArrowLeft", true);
            jest.advanceTimersByTime(90);
        }
        up("ArrowLeft");
        jest.advanceTimersByTime(250);
        expect(lastSpoken()).toBe("0, 1");
    });

    test("A tap at the end, with nothing pending, still says nothing new", () => {
        const { down, up, lastSpoken } = holdSetup();

        down("End");
        up("End");
        jest.advanceTimersByTime(250);
        expect(lastSpoken()).toBe("7, 8");

        down();
        up();
        jest.advanceTimersByTime(250);
        // No new announcement for a move that can't happen
        expect(lastSpoken()).toBe("7, 8");
    });

    test("Leaving the chart clears held keys", () => {
        const { mockElement, down, up, lastSpoken } = holdSetup();

        // Shift goes down, then focus leaves before its keyup reaches the chart
        down("Shift");
        mockElement.dispatchEvent(new Event("blur"));
        mockElement.dispatchEvent(new Event("focus"));

        // A tap isn't held up by the stale Shift
        down();
        up();
        jest.advanceTimersByTime(250);
        expect(lastSpoken()).toBe("2, 3");
    });
});
