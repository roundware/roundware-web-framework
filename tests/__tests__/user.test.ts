import { User } from "../../src/user";
import { ApiClient } from "../../src/api-client";

// Mock the ApiClient class
jest.mock("../../src/api-client");

describe("User", () => {
  let user: User;
  let mockApiClient: jest.Mocked<ApiClient>;

  beforeEach(() => {
    mockApiClient = new ApiClient("") as jest.Mocked<ApiClient>;
    user = new User({
      apiClient: mockApiClient,
      deviceId: "00000000000000",
      clientType: "web",
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("constructor", () => {
    it("should set default deviceId if not provided", () => {
      const mockApiClient = new ApiClient("") as jest.Mocked<ApiClient>;
      const user = new User({
        apiClient: mockApiClient,
        clientType: "web",
      });

      expect(user.deviceId).toEqual("00000000000000");
    });
  });

  describe("toString", () => {
    it("should return a human-readable representation of the user", () => {
      const result = user.toString();
      expect(result).toEqual("User (unknown) (deviceId 00000000000000)");
    });
  });

  describe("connect", () => {
    it("should connect the user and update properties on success", async () => {
      const responseData = {
        username: "testuser",
        token: "abc123",
        id: 123,
      };

      // Mock the post method of ApiClient
      mockApiClient.post.mockResolvedValue(responseData);

      await user.connect();

      expect(mockApiClient.post).toHaveBeenCalledWith("/users/", {
        device_id: "00000000000000",
        client_type: "web",
      });

      expect(user.userName).toEqual("testuser");
      expect(user.apiClient.authToken).toEqual("abc123");
      expect(user.id).toEqual(123);
    });

    it("should handle auth failure and return an empty object", async () => {
      // Mock the post method of ApiClient to throw an error
      mockApiClient.post.mockRejectedValue(new Error("Auth failure"));

      const result = await user.connect();

      expect(result).toEqual({});
    });
  });

  describe("updateUser", () => {
    it("should update the user's information", async () => {
      const partialUserData = {
        first_name: "John",
        last_name: "Doe",
      };

      const responseData = {
        username: "testuser",
        token: "abc123",
        id: 123,
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@example.com",
        device_id: "00000000000000",
        client_type: "web",
      };

      // Mock the patch method of ApiClient
      mockApiClient.patch.mockResolvedValue(responseData);

      const result = await user.updateUser(partialUserData);

      expect(mockApiClient.patch).toHaveBeenCalledWith(
        "/users/undefined",
        partialUserData
      );
      expect(result).toEqual(responseData);
    });
  });
});
