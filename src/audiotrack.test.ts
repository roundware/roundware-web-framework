import { Audiotrack } from "./audiotrack";
import { ApiClient } from "./api-client";
import { IAudioTrackData } from "./types/audioTrack";

// Mock the ApiClient
jest.mock("./api-client");

describe("Audiotrack", () => {
  let audiotrack: Audiotrack;
  let mockApiClient: jest.Mocked<ApiClient>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create a mock ApiClient
    mockApiClient = new ApiClient("http://test-server") as jest.Mocked<ApiClient>;
    audiotrack = new Audiotrack(123, { apiClient: mockApiClient });
  });

  describe("constructor", () => {
    test("should create an Audiotrack instance with the correct project ID", () => {
      expect(audiotrack).toBeInstanceOf(Audiotrack);
      expect(audiotrack.toString()).toBe("Roundware Audiotracks (#123)");
    });
  });

  describe("toString", () => {
    test("should return the correct string representation", () => {
      expect(audiotrack.toString()).toBe("Roundware Audiotracks (#123)");
    });
  });

  describe("connect", () => {
    test("should call apiClient.get with correct parameters", async () => {
      const mockResponse: IAudioTrackData[] = [{
        id: 8,
        minvolume: 0.7,
        maxvolume: 0.7,
        minduration: 200.0,
        maxduration: 250.0,
        mindeadair: 1.0,
        maxdeadair: 3.0,
        minfadeintime: 2.0,
        maxfadeintime: 4.0,
        minfadeouttime: 0.3,
        maxfadeouttime: 1.0,
        minpanpos: 0.0,
        maxpanpos: 0.0,
        minpanduration: 10.0,
        maxpanduration: 20.0,
        repeatrecordings: false,
        active: true,
        start_with_silence: false,
        banned_duration: 600,
        tag_filters: [],
        project_id: 123,
        fadeout_when_filtered: false,
        timed_asset_priority: "normal"
      }];

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await audiotrack.connect();

      expect(mockApiClient.get).toHaveBeenCalledWith("/audiotracks/", {
        project_id: 123,
        active: true
      });
      expect(result).toEqual(mockResponse);
    });

    test("should merge additional parameters with default ones", async () => {
      const mockResponse: IAudioTrackData[] = [{
        id: 8,
        minvolume: 0.7,
        maxvolume: 0.7,
        minduration: 200.0,
        maxduration: 250.0,
        mindeadair: 1.0,
        maxdeadair: 3.0,
        minfadeintime: 2.0,
        maxfadeintime: 4.0,
        minfadeouttime: 0.3,
        maxfadeouttime: 1.0,
        minpanpos: 0.0,
        maxpanpos: 0.0,
        minpanduration: 10.0,
        maxpanduration: 20.0,
        repeatrecordings: false,
        active: true,
        start_with_silence: false,
        banned_duration: 600,
        tag_filters: [],
        project_id: 123,
        fadeout_when_filtered: false,
        timed_asset_priority: "normal"
      }];
      
      mockApiClient.get.mockResolvedValue(mockResponse);

      const additionalParams = {
        customParam: "value",
        active: false // This should be overridden by the default
      };

      await audiotrack.connect(additionalParams);

      expect(mockApiClient.get).toHaveBeenCalledWith("/audiotracks/", {
        project_id: 123,
        active: true, // Should still be true despite being false in additionalParams
        customParam: "value"
      });
    });
  });
});
