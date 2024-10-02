import { Speaker } from "../../src/speaker";
import { ApiClient } from "../../src/api-client";
import { ISpeakerData } from "../../src/types/speaker";

// Mock the ApiClient class
jest.mock("../../src/api-client");

describe("Speaker", () => {
  let speaker: Speaker;
  let mockApiClient: jest.Mocked<ApiClient>;

  beforeEach(() => {
    mockApiClient = new ApiClient("") as jest.Mocked<ApiClient>;
    speaker = new Speaker(789, { apiClient: mockApiClient });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("toString", () => {
    it("should return a string representation of Speaker", () => {
      const result = speaker.toString();
      expect(result).toEqual("Roundware Speaker (#789)");
    });
  });

  describe("connect", () => {
    it("should connect to speakers and return the result", async () => {
      const responseData: ISpeakerData[] = [
        {
          id: 1,
          maxvolume: 100,
          minvolume: 20,
          attenuation_distance: 50,
          uri: "https://example.com/audio1.mp3",
        },
        {
          id: 2,
          maxvolume: 90,
          minvolume: 30,
          attenuation_distance: 60,
          uri: "https://example.com/audio2.mp3",
        },
      ];

      // Mock the get method of ApiClient
      mockApiClient.get.mockResolvedValue(responseData);

      const result = await speaker.connect({ someOption: "value" });

      expect(mockApiClient.get).toHaveBeenCalledWith("/speakers/", {
        someOption: "value",
        project_id: 789,
      });

      expect(result).toEqual(responseData);
    });
  });
});
