import { IAudioContext, IAudioBuffer, IAudioBufferSourceNode } from "standardized-audio-context";
import { SpeakerPrefetchSyncPlayer } from "./SpeakerPrefetchSyncPlayer"; // Adjust path as needed
import { NEARLY_ZERO } from "../../utils";
import { BufferEffectsProcessor } from "../buffer_effects_processor";

describe("SpeakerPrefetchSyncPlayer", () => {
    let mockAudioContext: IAudioContext;
    let mockAudioBuffer: IAudioBuffer;
    let player: SpeakerPrefetchSyncPlayer;

    beforeEach(() => {
        // Mock IAudioContext
        mockAudioContext = {
            createGain: jest.fn().mockReturnValue({
                gain: {
                    value: NEARLY_ZERO,
                    cancelScheduledValues: jest.fn(),
                    cancelAndHoldAtTime: jest.fn(),
                    exponentialRampToValueAtTime: jest.fn(),
                },
                connect: jest.fn().mockReturnThis(), // Changed to be chainable
                disconnect: jest.fn(),
            }),
            createStereoPanner: jest.fn().mockReturnValue({
                pan: { value: 0 },
                connect: jest.fn().mockReturnThis(), // Changed to be chainable
                disconnect: jest.fn(),
            }),
            createBufferSource: jest.fn().mockReturnValue({
                start: jest.fn(),
                stop: jest.fn(),
                connect: jest.fn().mockReturnThis(), // Changed to be chainable!
                disconnect: jest.fn(),
                buffer: null,
                loop: false,
                loopEnd: 0,
            }),
            decodeAudioData: jest.fn((data, callback) => callback(mockAudioBuffer)),
            state: "running",
            currentTime: 0,
            resume: jest.fn(),
            destination: {} // This is needed for the final connect
        } as unknown as IAudioContext;


        // Mock IAudioBuffer
        mockAudioBuffer = {
            duration: 10,
            length: 1000,
            numberOfChannels: 2,
        } as unknown as IAudioBuffer;

        // Instantiate Player
        player = new SpeakerPrefetchSyncPlayer({
            audioContext: mockAudioContext,
            id: 1,
            uri: "mock-uri",
            config: { loop: false, mode: "stream" }, // Include the required 'mode'
        });
    });


    test("should return early from timerStart when started is true", async () => {
        // Ensure currentBuffer is defined, but started is true.
        player.started = true;
        player.currentBuffer = mockAudioBuffer;

        // Spy on methods that should not be called when returning early.
        const initSpy = jest.spyOn(player, "initializeSource");
        const fadeSpy = jest.spyOn(player, "fade");

        await player.timerStart();

        // Since started is true, initializeSource and fade should not run.
        expect(initSpy).not.toHaveBeenCalled();
        expect(fadeSpy).not.toHaveBeenCalled();
    });

    test("should return early from timerStart when currentBuffer is not set", async () => {
        // Ensure started is false, but currentBuffer is undefined.
        player.started = false;
        player.currentBuffer = undefined;

        const initSpy = jest.spyOn(player, "initializeSource");
        const fadeSpy = jest.spyOn(player, "fade");

        await player.timerStart();

        // Since currentBuffer is falsy, no initialization should occur.
        expect(initSpy).not.toHaveBeenCalled();
        expect(fadeSpy).not.toHaveBeenCalled();
    });

    test("should call context.resume if state is not running", async () => {
        // Ensure we have a valid currentBuffer and that player hasn't started.
        player.currentBuffer = mockAudioBuffer;
        player.started = false;

        // Create a dummy source with the minimal properties (plus methods) required
        // so that it satisfies IAudioBufferSourceNode<IAudioContext>.
        const dummySource = {
            start: jest.fn(),
            buffer: mockAudioBuffer,
            loop: false,
            loopEnd: 0,
            loopStart: 0,
            connect: jest.fn().mockReturnThis(),
            disconnect: jest.fn(),
        } as unknown as IAudioBufferSourceNode<IAudioContext>;

        // Override initializeSource so that player.source is set.
        player.initializeSource = jest.fn(() => {
            player.source = dummySource;
        });

        // Force the context state to something other than "running".
        Object.defineProperty(mockAudioContext, "state", { get: () => "suspended" });
        mockAudioContext.resume = jest.fn(() => Promise.resolve());

        // Call timerStart(), which should execute the resume() line.
        await player.timerStart();

        // Verify that context.resume was called.
        expect(mockAudioContext.resume).toHaveBeenCalled();
    });


    // Declare a variable to hold the instance of the fake XHR.
    let lastXHR: FakeXMLHttpRequest;

    class FakeXMLHttpRequest {
        onprogress: ((ev: any) => void) | null = null;
        open = jest.fn();
        send = jest.fn();
        // You could also stub additional methods if needed.
        constructor() {
            lastXHR = this;
        }
    }

    // Override the global XMLHttpRequest with our fake.
    (global as any).XMLHttpRequest = FakeXMLHttpRequest;

    test("should update loadedPercentage and call loadingCallback on progress", () => {
        // Set a mock loading callback.
        const loadingCallbackMock = jest.fn();
        player.onLoadingProgress(loadingCallbackMock);

        // Simulate a progress event.
        const progressEvent = { loaded: 50, total: 100 };

        // Call the onprogress callback from the fake XHR instance.
        // (We know that the player's constructor set lastXHR.onprogress)
        if (lastXHR.onprogress) {
            lastXHR.onprogress(progressEvent);
        }

        // The calculation: (50/100)*100 = 50, toFixed(2) becomes "50.00"
        // and Number("50.00") returns 50.
        expect(player.loadedPercentage).toBe(50);
        expect(loadingCallbackMock).toHaveBeenCalledWith(50);
    });

    test("should process onload event and successfully decode audio data", () => {

        // Stub decodeAudioData to immediately call the success callback with fakeBuffer.
        // Create a fake audio buffer.
        const fakeBuffer: IAudioBuffer = { length: 100, numberOfChannels: 2, duration: 5 } as IAudioBuffer;

        // Stub decodeAudioData so that it immediately calls the success callback (if provided)
        // or returns a promise that resolves to fakeBuffer.
        (mockAudioContext.decodeAudioData as any) = jest.fn(
            (data: ArrayBuffer, successCallback?: (buffer: IAudioBuffer) => void, errorCallback?: (error: any) => void) => {
                if (typeof successCallback === "function") {
                    successCallback(fakeBuffer);
                    return Promise.resolve(fakeBuffer);
                }
                return Promise.resolve(fakeBuffer);
            }
        );

        // Prepare the global variable used in production.
        (global as any)._roundwareTotalAudioBufferSize = 0;

        // Spy on the player's log method.
        const logSpy = jest.spyOn(SpeakerPrefetchSyncPlayer.prototype, "log").mockImplementation(() => { });

        // Spy/mimic BufferEffectsProcessor so that microFadeInAndOut returns an object whose getBuffer() returns fakeBuffer.
        jest.spyOn(BufferEffectsProcessor.prototype, "microFadeInAndOut").mockReturnValue({
            getBuffer: () => fakeBuffer,
        } as any);

        // Create a FakeXMLHttpRequest class to capture the instance.
        let lastXHR: any;
        class FakeXMLHttpRequest {
            response: any;
            onload: (() => void) | null = null;
            onprogress: ((ev: any) => void) | null = null;
            onerror: (() => void) | null = null; // Add onerror handler
            open = jest.fn();
            send = jest.fn();
            constructor() {
                lastXHR = this;
            }
        }
        (global as any).XMLHttpRequest = FakeXMLHttpRequest;

        // Instantiate a new player (which uses the fake XHR in its constructor).
        const newPlayer = new SpeakerPrefetchSyncPlayer({
            audioContext: mockAudioContext,
            id: 1,
            uri: "mock-uri",
            config: { loop: false, mode: "stream" },
        });

        // Simulate the onload event:
        // Set a fake response and then trigger the onload handler.
        lastXHR.response = "fake-audio-data";
        if (lastXHR.onload) {
            lastXHR.onload();
        }

        // Assertions:
        // The success branch should set originalBuffer and currentBuffer to fakeBuffer.
        expect(newPlayer.originalBuffer).toEqual(fakeBuffer);
        expect(newPlayer.currentBuffer).toEqual(fakeBuffer);
        // It should increase global._roundwareTotalAudioBufferSize by fakeBuffer.length * fakeBuffer.numberOfChannels * 4.
        expect((global as any)._roundwareTotalAudioBufferSize).toEqual(100 * 2 * 4);
        // The loaded flag should be set to true.
        expect(newPlayer.loaded).toBe(true);
        // And it should log "loaded successfully".
        expect(logSpy).toHaveBeenCalledWith("loaded successfully");

        // Clean up: restore the log spy.
        logSpy.mockRestore();
    });

    test("should handle onerror event when decoding audio data fails", () => {
        // Arrange
        const logSpy = jest.spyOn(SpeakerPrefetchSyncPlayer.prototype, "log").mockImplementation(() => { });
        const errorMessage = "Fake decode error";

        // Mock the decodeAudioData method to simulate an error
        (mockAudioContext.decodeAudioData as jest.Mock).mockImplementationOnce((buffer, successCallback, errorCallback) => {
            errorCallback(new Error(errorMessage));
        });

        // Create a FakeXMLHttpRequest class that calls onerror
        let lastXHR: any;
        class FakeXMLHttpRequest {
            response: any;
            onload: (() => void) | null = null;
            onerror: (() => void) | null = null; // Include onerror callback
            open = jest.fn();
            send = jest.fn();
            constructor() {
                lastXHR = this;
            }
        }
        (global as any).XMLHttpRequest = FakeXMLHttpRequest;

        // Create a new player with the fake XHR
        const newPlayer = new SpeakerPrefetchSyncPlayer({
            audioContext: mockAudioContext,
            id: 1,
            uri: "mock-uri",
            config: { loop: false, mode: "stream" },
        });

        // Act
        // Simulate the onload event to set the state for the onerror event
        lastXHR.response = "fake-audio-data";
        if (lastXHR.onload) {
            lastXHR.onload();
        }

        // Simulate the onerror event
        if (lastXHR.onerror) {
            lastXHR.onerror();
        }

        // Assert
        expect(logSpy).toHaveBeenCalledWith("Error with decoding audio data " + errorMessage);

        // Restore original implementations
        logSpy.mockRestore();
    });

test("should clear endTimeout if it exists in timerStop", () => {
        // Set up a dummy source so that this.source?.stop() works
        player.source = {
            stop: jest.fn()
        } as unknown as any; // or cast as IAudioBufferSourceNode<IAudioContext> if available

        // Ensure loopInterval exists (even if it is empty)
        player.loopInterval = [];

        // Set startedAt and currentTime so that pausedAt is computed without error.
        player.startedAt = 0;
        Object.defineProperty(mockAudioContext, "currentTime", { value: 30, configurable: true });

        // Assign a dummy timeout to endTimeout
        const timeoutId = setTimeout(() => { }, 1000);
        player.endTimeout = timeoutId;

        // Create a spy on clearTimeout
        const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");

        // Call timerStop() which should execute:
        player.timerStop();

        // Verify that clearTimeout was called with our dummy timeout id.
        expect(clearTimeoutSpy).toHaveBeenCalledWith(timeoutId);
        expect(clearTimeoutSpy).toHaveBeenCalledTimes(1); // Ensure it is called exactly once
    });

    test("should call fade and return true if already playing", async () => {
        // Ensure that player is loaded and started, and that it's already playing.
        player.loaded = true;
        player.started = true;
        player.playing = true;

        // Spy on the fade method so we can verify it was called.
        const fadeSpy = jest.spyOn(player, "fade").mockImplementation(() => { });

        // Call play() which should take the already-playing branch.
        const result = await player.play();

        // Verify that fade() was called.
        expect(fadeSpy).toHaveBeenCalled();
        // Confirm that play() returns true.
        expect(result).toBe(true);
    });

    test("should clear loop intervals in timerStart", async () => {
        // Ensure that timerStart won't return early
        player.currentBuffer = mockAudioBuffer;
        player.started = false;

        // Set up dummy loop intervals
        const intervalDummy1 = setInterval(() => { }, 1000);
        const intervalDummy2 = setInterval(() => { }, 2000);
        player.loopInterval = [intervalDummy1, intervalDummy2];

        // Spy on clearInterval to verify it's called on each interval ID.
        const clearIntervalSpy = jest.spyOn(global, "clearInterval");

        // Create a dummy source that satisfies IAudioBufferSourceNode<IAudioContext>
        const dummySource = {
            buffer: mockAudioBuffer,
            context: mockAudioContext,
            start: jest.fn(),
            connect: jest.fn().mockReturnThis(),
            disconnect: jest.fn(),
            loop: false,
            loopEnd: 0,
            loopStart: 0,
            stop: jest.fn(),
        } as unknown as IAudioBufferSourceNode<IAudioContext>;

        // Override initializeSource so that player.source is set.
        player.initializeSource = jest.fn(() => {
            player.source = dummySource;
        });
        // Stub fade so that it doesn't interfere.
        player.fade = jest.fn();

        // Call timerStart, which will trigger clearing the loop intervals.
        await player.timerStart();

        // Verify that clearInterval was called with each dummy interval ID.
        expect(clearIntervalSpy).toHaveBeenCalledWith(intervalDummy1);
        expect(clearIntervalSpy).toHaveBeenCalledWith(intervalDummy2);
        // And verify that the loopInterval array has been reset to empty.
        expect(player.loopInterval.length).toBe(0);

        // Cleanup spy.
        clearIntervalSpy.mockRestore();
    });

    test("should call endCallback and log 'speaker end' after timer expires", async () => {
        // Use fake timers so we can control and advance the timeout.
        jest.useFakeTimers();

        // Set up the conditions so that timerStart() does not return early.
        // Ensure a valid currentBuffer so that remainingDuration is computed.
        player.currentBuffer = mockAudioBuffer;
        player.started = false;
        // Optionally, set pausedAt = 0; then remainingDuration becomes (config.length || currentBuffer.duration) - 0.
        player.pausedAt = 0;

        // Override initializeSource() so that player.source is set.
        // Create a dummy source that meets the minimum requirements.
        const dummySource = {
            start: jest.fn(),
            connect: jest.fn().mockReturnThis(),
            disconnect: jest.fn(),
            buffer: mockAudioBuffer,
            loop: false,
            loopEnd: 0,
            loopStart: 0,
            stop: jest.fn()
        } as unknown as IAudioBufferSourceNode<IAudioContext>;

        player.initializeSource = jest.fn(() => {
            player.source = dummySource;
        });

        // Spy on endCallback and log.
        player.endCallback = jest.fn();
        const logSpy = jest.spyOn(player, "log").mockImplementation(() => { });

        // Call timerStart() so that the setTimeout is scheduled.
        await player.timerStart();

        // At this point, timerStart schedules:
        // setTimeout(() => {
        //   this.endCallback();
        //   this.log(`speaker end`);
        // }, this.remainingDuration * 1000);
        // Given our conditions:
        //   remainingDuration = (this.config.length || this.currentBuffer.duration) - this.pausedAt.
        // Using our mock, if config.length is undefined, remainingDuration equals mockAudioBuffer.duration (which is 10)
        // so the timeout will be set for 10 * 1000 = 10000 ms.

        // Fast-forward the timers to trigger the timeout handler.
        jest.advanceTimersByTime(10000);

        // Verify that endCallback is called.
        expect(player.endCallback).toHaveBeenCalled();
        // Verify that log was called with a string containing "speaker end"
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("speaker end"));

        // Restore real timers.
        jest.useRealTimers();
    });


    test("should schedule looping interval when config.loop is true and pausedAt is 0", async () => {
        jest.useFakeTimers();
        // Setup conditions: valid currentBuffer, looping enabled, finalDuration set via config.length (5 seconds),
        // pausedAt is 0 so the interval branch is used.
        player.currentBuffer = mockAudioBuffer;
        player.config.loop = true;
        player.config.length = 5;  // finalDuration = 5 seconds
        player.pausedAt = 0;
        player.started = false;

        // Create a dummy source with the required properties.
        const dummySource = {
            start: jest.fn(),
            buffer: mockAudioBuffer,
            loop: false,
            loopEnd: 0,
            loopStart: 0,
            connect: jest.fn().mockReturnThis(),
            disconnect: jest.fn(),
            stop: jest.fn(),
            context: mockAudioContext,
        } as unknown as IAudioBufferSourceNode<IAudioContext>;

        // Override initializeSource to set player.source.
        player.initializeSource = jest.fn(() => {
            player.source = dummySource;
        });

        // Spy on log and dispatchEvent.
        const logSpy = jest.spyOn(player, "log").mockImplementation(() => { });
        const dispatchSpy = jest.spyOn(player, "dispatchEvent");

        // Ensure context state is "running" so that resume() is not called.
        Object.defineProperty(mockAudioContext, "state", { value: "running", configurable: true });

        await player.timerStart();

        // It should log "looping every 5 seconds"
        expect(logSpy).toHaveBeenCalledWith("looping every 5 seconds");
        // There should be at least one interval scheduled in loopInterval.
        expect(player.loopInterval.length).toBeGreaterThan(0);

        // Advance the timers by 5 seconds to trigger the interval callback.
        jest.advanceTimersByTime(5000);

        // The interval callback logs "looping" and dispatches a "loop" event.
        expect(logSpy).toHaveBeenCalledWith("looping");
        expect(dispatchSpy).toHaveBeenCalledWith(expect.any(Event));

        jest.useRealTimers();
    });

    test("should schedule looping timeout when config.loop is true and pausedAt > 0", async () => {
        jest.useFakeTimers();
        // Setup conditions: valid currentBuffer, looping enabled, config.length is 5 seconds, pausedAt is 2 seconds.
        // So finalDuration - pausedAt = 3 seconds.
        player.currentBuffer = mockAudioBuffer;
        player.config.loop = true;
        player.config.length = 5;  // finalDuration = 5 seconds
        player.pausedAt = 2;
        player.started = false;

        // Create a dummy source.
        const dummySource = {
            start: jest.fn(),
            buffer: mockAudioBuffer,
            loop: false,
            loopEnd: 0,
            loopStart: 0,
            connect: jest.fn().mockReturnThis(),
            disconnect: jest.fn(),
            stop: jest.fn(),
            context: mockAudioContext,
        } as unknown as IAudioBufferSourceNode<IAudioContext>;

        // Override initializeSource to set player.source.
        player.initializeSource = jest.fn(() => {
            player.source = dummySource;
        });

        // Spy on log and dispatchEvent.
        const logSpy = jest.spyOn(player, "log").mockImplementation(() => { });
        const dispatchSpy = jest.spyOn(player, "dispatchEvent");

        // Ensure context state is "running".
        Object.defineProperty(mockAudioContext, "state", { value: "running", configurable: true });

        await player.timerStart();

        // It should log "looping after 3 seconds" because finalDuration (5) - pausedAt (2) = 3.
        expect(logSpy).toHaveBeenCalledWith("looping after 3 seconds");
        // There should be at least one timeout scheduled in loopInterval.
        expect(player.loopInterval.length).toBeGreaterThan(0);

        // Advance timers by 3 seconds to trigger the timeout callback.
        jest.advanceTimersByTime(3000);

        // When the timeout callback executes, it should log "looping" and push a new interval into loopInterval.
        expect(logSpy).toHaveBeenCalledWith("looping");
        // The dispatchEvent should be called with a "loop" event.
        expect(dispatchSpy).toHaveBeenCalledWith(expect.any(Event));

        // Optionally, after the timeout, loopInterval should have more than one entry.
        expect(player.loopInterval.length).toBeGreaterThan(1);

        jest.useRealTimers();
    });

   test("should handle onerror event when decoding audio data fails", () => {
        // Arrange
        const logSpy = jest.spyOn(SpeakerPrefetchSyncPlayer.prototype, "log");
        const errorMessage = "Fake decode error";

        // Mock the decodeAudioData method to simulate an error
        (mockAudioContext.decodeAudioData as jest.Mock).mockImplementationOnce((buffer, successCallback, errorCallback) => {
            errorCallback(new Error(errorMessage));
        });

        // Create a FakeXMLHttpRequest class that calls onerror
        let lastXHR: any;
        class FakeXMLHttpRequest {
            response: any;
            onload: (() => void) | null = null;
            onerror: (() => void) | null = null; // Include onerror callback
            open = jest.fn();
            send = jest.fn();
            constructor() {
                lastXHR = this;
            }
        }
        (global as any).XMLHttpRequest = FakeXMLHttpRequest;

        // Create a new player with the fake XHR
        const newPlayer = new SpeakerPrefetchSyncPlayer({
            audioContext: mockAudioContext,
            id: 1,
            uri: "mock-uri",
            config: { loop: false, mode: "stream" },
        });

        // Simulate the onload event to set the state for the onerror event
        lastXHR.response = "fake-audio-data";
        if (lastXHR.onload) {
            lastXHR.onload();
        }

        // Simulate the onerror event
        if (lastXHR.onerror) {
            lastXHR.onerror();
        }

        // Assert
        expect(logSpy).toHaveBeenCalledWith("Error with decoding audio data " + errorMessage);

        // Restore original implementations
        logSpy.mockRestore();
    });

  test("should initialize correctly", () => {
    expect(player.id).toBe(1);
    expect(player.gainNode).toBeDefined();
    expect(player.panNode).toBeDefined();
    expect(player.loaded).toBe(false);
    expect(player.playing).toBe(false);
    expect(player.gainNode.gain.value).toBe(NEARLY_ZERO);
  });

  test("should play successfully when loaded and started", async () => {
    player.loaded = true;
    player.started = true;
    player.connectToDest = jest.fn();

    const result = await player.play();

    expect(result).toBe(true);
    expect(player.connectToDest).toHaveBeenCalled();
    expect(player.playing).toBe(true);
  });

  test("should log when play is called without being loaded", async () => {
    const logSpy = jest.spyOn(player, "log").mockImplementation(() => { });

    const result = await player.play();

    expect(result).toBe(false);
    expect(logSpy).toHaveBeenCalledWith("not loaded or started yet");
  });

  test("should reset and replay", () => {
    player.initializeSource = jest.fn();
    player.timerStart = jest.fn();

    player.replay();

    expect(player.playing).toBe(false);
    expect(player.pausedAt).toBe(0);
    expect(player.initializeSource).toHaveBeenCalled();
    expect(player.timerStart).toHaveBeenCalled();
  });

  test("should calculate remainingDuration correctly", () => {
    player.currentBuffer = mockAudioBuffer;
    player.pausedAt = 2;

    expect(player.remainingDuration).toBe(8);
  });

  test("should start timer and set intervals", async () => {
    // Ensure buffer is loaded
    player.currentBuffer = mockAudioBuffer;
    player.initializeSource = jest.fn();
    player.fade = jest.fn();

    // Simulate a valid source
    player.source = mockAudioContext.createBufferSource();

    // Call timerStart
    await player.timerStart();

    // Assertions
    expect(player.initializeSource).toHaveBeenCalled();
    expect(player.fade).toHaveBeenCalled();
    expect(player.started).toBe(true);
    expect(player.startedAt).toBe(mockAudioContext.currentTime);
  });

  test("should stop timer and reset source", () => {
    player.source = mockAudioContext.createBufferSource();
    player.timerStop();

    expect(player.source).toBeUndefined();
    expect(player.started).toBe(false);
    expect(player.pausedAt).toBe(0);
  });

  test("should correctly fade audio", () => {
    player.playing = true;

    player.fade(0.5, 2);

    expect(player.gainNode.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(
      0.5,
      mockAudioContext.currentTime + 2
    );
  });

  // New test to cover the uncovered line: this._fading = false; in fade()
  test("should reset _fading to false after fade completes", () => {
    jest.useFakeTimers();
    player.playing = true; // Ensure fade logic runs

    // Call fade with a duration of 2 seconds
    player.fade(0.5, 2);

    // Immediately after calling fade, _fading should be true.
    expect(player["_fading"]).toBe(true);

    // Advance the timers to simulate fade completion.
    jest.advanceTimersByTime(2000);

    // After the timer, _fading should be set to false.
    expect(player["_fading"]).toBe(false);
  });

  test("should fade out and pause", () => {
    jest.useFakeTimers(); // Use fake timers for timeout control
    player.playing = true;
    player.fade = jest.fn();
    player.pause = jest.fn();

    // Call fadeOutAndPause
    player.fadeOutAndPause();

    // Assert that fade is called with 0
    expect(player.fade).toHaveBeenCalledWith(0);

    // Fast-forward timers so that timeout executes
    jest.runAllTimers();

    // Assert that pause is then called
    expect(player.pause).toHaveBeenCalled();
  });

  test("should handle loading progress callback", () => {
    const mockCallback = jest.fn();

    player.onLoadingProgress(mockCallback);
    player.loadingCallback(50);

    expect(mockCallback).toHaveBeenCalledWith(50);
  });

  test("should handle onEnd callback", () => {
    const mockCallback = jest.fn();

    player.onEnd(mockCallback);
    player.endCallback();

    expect(mockCallback).toHaveBeenCalled();
  });

  test("should update buffer and start playing immediately", () => {
    player.timerStop = jest.fn();
    player.timerStart = jest.fn();

    player.updateBufferAndPlayNow(mockAudioBuffer);

    expect(player.timerStop).toHaveBeenCalled();
    expect(player.currentBuffer).toBe(mockAudioBuffer);
    expect(player.timerStart).toHaveBeenCalled();
  });

  test("should set pan position", () => {
    player.setPanPosition(0.5);

    expect(player.panNode.pan.value).toBe(0.5);
  });

  test("should log messages", () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => { });

    // Call the log method
    player.log("Test message");

    // Verify that the formatted log contains the expected output
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("[Speaker: 1] Test message"),
      expect.any(String)
    );

    logSpy.mockRestore();
  });

  // Existing test case for cancelFadeOutAndPause remains unchanged
  test("should clear _fadeOutAndPauseTimeout if it exists", () => {
    // Set _fadeOutAndPauseTimeout with a mocked timeout value
    const timeoutId = setTimeout(() => { }, 1000);
    player._fadeOutAndPauseTimeout = timeoutId;

    // Spy on clearTimeout to ensure it is called
    const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");

    // Call cancelFadeOutAndPause, which should call clearTimeout with timeoutId
    player.cancelFadeOutAndPause();

    expect(clearTimeoutSpy).toHaveBeenCalledWith(timeoutId);
    // Since production code doesn't reset _fadeOutAndPauseTimeout to null,
    // we assert that its value remains unchanged.
    expect(player._fadeOutAndPauseTimeout).toBe(timeoutId);
  });

  test("should clear previous _fadingTimeout when fade is called again", () => {
    jest.useFakeTimers(); // Use fake timers for control

    // Set up the player so that fading can occur
    player.playing = true;
    // Ensure the gain node methods exist for fade to function properly
    player.gainNode.gain.cancelScheduledValues = jest.fn();
    player.gainNode.gain.cancelAndHoldAtTime = jest.fn();
    player.gainNode.gain.exponentialRampToValueAtTime = jest.fn();

    // Call fade for the first time, which sets _fadingTimeout
    player.fade(0.8, 3);
    const firstTimeout = player["_fadingTimeout"];
    expect(firstTimeout).toBeDefined();

    // Spy on clearTimeout
    const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");

    // Call fade again with a different target volume.
    // This should trigger the condition to clear the previous _fadingTimeout.
    player.fade(0.5, 3);
    expect(clearTimeoutSpy).toHaveBeenCalledWith(firstTimeout);

    // Optionally, you can also confirm that _fadingTimeout has been updated (i.e. it’s a new value)
    expect(player["_fadingTimeout"]).not.toBe(firstTimeout);
  });

  test("should not initialize source if currentBuffer is not set", () => {
    player.currentBuffer = undefined;
    player.initializeSource();
    expect(player.source).toBeUndefined();
  });

  test("should initialize source correctly with loop disabled", () => {
    player.currentBuffer = mockAudioBuffer;
    player.config.loop = false;

    const disconnectSpy = jest.spyOn(player, "disconnect");
    const fadeSpy = jest.spyOn(player, "fade").mockImplementation(() => { });
    const connectToDestSpy = jest.spyOn(player, "connectToDest");
    const createBufferSourceSpy = jest.spyOn(mockAudioContext, "createBufferSource");
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => { });

    player.initializeSource();

    expect(disconnectSpy).toHaveBeenCalled();
    expect(createBufferSourceSpy).toHaveBeenCalled();
    expect(player.source).toBeDefined();
    expect(player.source!.buffer).toBe(player.currentBuffer);
    expect(player.source!.loop).toBe(false);
    expect(connectToDestSpy).toHaveBeenCalled();
    expect(player.started).toBe(false);
    // Instead of expecting a strict call, check that one of the calls has "init" exactly.
    expect(consoleSpy.mock.calls.some(call => call[0] === "init")).toBeTruthy();
    expect(fadeSpy).toHaveBeenCalled();

    disconnectSpy.mockRestore();
    fadeSpy.mockRestore();
    connectToDestSpy.mockRestore();
    createBufferSourceSpy.mockRestore();
    consoleSpy.mockRestore();
  });

  test("should initialize source correctly with loop enabled", () => {
    player.currentBuffer = mockAudioBuffer;
    player.config.loop = true;
    player.config.length = 9; // explicit length

    const connectToDestSpy = jest.spyOn(player, "connectToDest");
    const fadeSpy = jest.spyOn(player, "fade").mockImplementation(() => { });

    player.initializeSource();

    expect(player.source!.loop).toBe(true);
    expect(player.source!.loopEnd).toBe(9);

    connectToDestSpy.mockRestore();
    fadeSpy.mockRestore();
  });

  test("should connect source to destination correctly", () => {
    // Create a dummy source with a chainable connect method.
    const fakeSource = {
      connect: jest.fn().mockReturnThis()
    };
    // Cast the fake source to any to appease TypeScript.
    player.source = fakeSource as any;
    player.connectToDest();
    expect(fakeSource.connect).toHaveBeenCalledWith(player.gainNode);
  });

  test("should disconnect gainNode and panNode", () => {
    const disconnectGainSpy = jest.spyOn(player.gainNode, "disconnect");
    const disconnectPanSpy = jest.spyOn(player.panNode, "disconnect");
  
    player.disconnect();
  
    expect(disconnectGainSpy).toHaveBeenCalled();
    expect(disconnectPanSpy).toHaveBeenCalled();
  
    disconnectGainSpy.mockRestore();
    disconnectPanSpy.mockRestore();
  });
  
  test("should pause playback when playing is true", () => {
    player.playing = true;
    const disconnectSpy = jest.spyOn(player, "disconnect");
  
    player.pause();
  
    expect(disconnectSpy).toHaveBeenCalled();
    expect(player.playing).toBe(false);
  
    disconnectSpy.mockRestore();
  });
  

});
