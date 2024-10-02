import ApiClient from "../../src/api-client";
import { Session } from "../../src/session";

// Mock the ApiClient class
jest.mock("../../src/api-client");

describe("Session", () => {
  let session: Session;
  let mockApiClient: jest.Mocked<ApiClient>;

  beforeEach(() => {
    mockApiClient = new ApiClient("") as jest.Mocked<ApiClient>;
    session = new Session(window.navigator, 789, true, {
      apiClient: mockApiClient,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("constructor", () => {
    it("should truncate userAgent string if it is longer than 127 characters", () => {
      const longUserAgent =
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36".repeat(
          5
        ); // Make it longer than 127 characters

      const mockApiClient = new ApiClient("") as jest.Mocked<ApiClient>;
      const session = new Session(
        { userAgent: longUserAgent } as any,
        789,
        true,
        {
          apiClient: mockApiClient,
        }
      );

      expect(session["clientSystem"].length).toEqual(127);
    });
  });

  describe("toString", () => {
    it("should return a human-readable representation of the session", () => {
      const result = session.toString();
      expect(result).toEqual("Roundware Session #undefined");
    });
  });

  describe("connect", () => {
    it("should connect to the server and set sessionId on success", async () => {
      const responseData = { id: 123 };

      // Mock the post method of ApiClient
      mockApiClient.post.mockResolvedValue(responseData);

      const result = await session.connect();

      expect(mockApiClient.post).toHaveBeenCalledWith("/sessions/", {
        project_id: 789,
        geo_listen_enabled: true,
        client_system: expect.any(String),
      });

      expect(result).toEqual(123);
      expect(session.sessionId).toEqual(123);
    });

    it("should handle API call failure and throw an error", async () => {
      // Mock the post method of ApiClient to throw an error
      mockApiClient.post.mockRejectedValue(new Error("API call failure"));

      await expect(session.connect()).rejects.toThrowError("API call failure");
    });
  });
});
