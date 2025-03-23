import { Project } from "../../src/project";
import { ApiClient } from "../../src/api-client";
import { GeoListenMode } from "../../src/mixer";
import { IProjectData } from "../../src/types/project";
import { IUiConfig } from "../../src/types";

jest.mock("../../src/api-client");

describe("Project", () => {
  let mockApiClient: jest.Mocked<ApiClient>;
  let project: Project;

  beforeEach(() => {
    const mockBaseServerUrl = "http://mock-server-url.com";
    mockApiClient = new ApiClient(mockBaseServerUrl) as jest.Mocked<ApiClient>;
    project = new Project(123, { apiClient: mockApiClient });
  });

  it("should initialize with default values in the constructor", () => {
    expect(project.projectId).toBe(123);
    expect(project.projectName).toBe("(unknown)");
    expect(project.apiClient).toBe(mockApiClient);
    expect(project.legalAgreement).toBe("");
    expect(project.mixParams).toEqual({});
  });

  it("should return a string representation of the project", () => {
    const projectString = project.toString();
    expect(projectString).toBe("Roundware Project '(unknown)' (#123)");
  });

  describe("connect", () => {
    it("should fetch project details and update properties", async () => {
      const mockResponse: IProjectData = {
        name: "Test Project",
        legal_agreement: "Some Agreement",
        recording_radius: 50,
        max_recording_length: 300,
        latitude: 40.7128,
        longitude: -74.006,
        geo_listen_enabled: true,
        ordering: "by_likes",
        out_of_range_distance: 100,
        id: 0,
        pub_date: "",
        audio_format: "",
        auto_submit: false,
        listen_questions_dynamic: false,
        speak_questions_dynamic: false,
        sharing_url: "",
        out_of_range_url: "",
        listen_enabled: false,
        speak_enabled: false,
        geo_speak_enabled: false,
        reset_tag_defaults_on_startup: false,
        timed_asset_priority: false,
        repeat_mode: "",
        files_url: "",
        files_version: "",
        audio_stream_bitrate: "",
        demo_stream_enabled: false,
        demo_stream_url: "",
        sharing_message: "",
        out_of_range_message: "",
        demo_stream_message: "",
        language_ids: []
      };

      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const sessionId = await project.connect(42);

      expect(sessionId).toBe(42);
      expect(project.projectName).toBe("Test Project");
      expect(project.legalAgreement).toBe("Some Agreement");
      expect(project.recordingRadius).toBe(50);
      expect(project.maxRecordingLength).toBe(300);
      expect(project.location).toEqual({ latitude: 40.7128, longitude: -74.006 });
      expect(project.mixParams).toEqual({
        geoListenMode: GeoListenMode.MANUAL,
        recordingRadius: 50,
        ordering: "by_likes",
      });
    });

    it("should set GeoListenMode to DISABLED when geo_listen_enabled is false", async () => {
      const mockResponse: IProjectData = {
        name: "Test Project",
        legal_agreement: "Some Agreement",
        recording_radius: 100,
        max_recording_length: 600,
        latitude: 20.5937,
        longitude: 78.9629,
        geo_listen_enabled: false,
        ordering: "by_weight",
        out_of_range_distance: 200,
        id: 0,
        pub_date: "",
        audio_format: "",
        auto_submit: false,
        listen_questions_dynamic: false,
        speak_questions_dynamic: false,
        sharing_url: "",
        out_of_range_url: "",
        listen_enabled: false,
        speak_enabled: false,
        geo_speak_enabled: false,
        reset_tag_defaults_on_startup: false,
        timed_asset_priority: false,
        repeat_mode: "",
        files_url: "",
        files_version: "",
        audio_stream_bitrate: "",
        demo_stream_enabled: false,
        demo_stream_url: "",
        sharing_message: "",
        out_of_range_message: "",
        demo_stream_message: "",
        language_ids: []
      };

      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const sessionId = await project.connect(42);

      expect(sessionId).toBe(42);
      expect(project.mixParams).toEqual({
        geoListenMode: GeoListenMode.DISABLED,
        recordingRadius: 100,
        ordering: "by_weight",
      });
    });

    it("should log an error and return undefined on API failure", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
  
      mockApiClient.get.mockRejectedValueOnce(new Error("API Error"));
  
      const sessionId = await project.connect(42);
  
      expect(sessionId).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Unable to get Project details",
        expect.any(Error)
      );
  
      consoleSpy.mockRestore();
    });

    it("should preserve existing mixParams while updating geoListenMode", async () => {
      project.mixParams = { customParam: "customValue" };

      const mockResponse: IProjectData = {
        name: "Test Project",
        legal_agreement: "Some Agreement",
        recording_radius: 200,
        max_recording_length: 400,
        latitude: 51.5074,
        longitude: -0.1278,
        geo_listen_enabled: true,
        ordering: "random",
        out_of_range_distance: 300,
        id: 0,
        pub_date: "",
        audio_format: "",
        auto_submit: false,
        listen_questions_dynamic: false,
        speak_questions_dynamic: false,
        sharing_url: "",
        out_of_range_url: "",
        listen_enabled: false,
        speak_enabled: false,
        geo_speak_enabled: false,
        reset_tag_defaults_on_startup: false,
        timed_asset_priority: false,
        repeat_mode: "",
        files_url: "",
        files_version: "",
        audio_stream_bitrate: "",
        demo_stream_enabled: false,
        demo_stream_url: "",
        sharing_message: "",
        out_of_range_message: "",
        demo_stream_message: "",
        language_ids: []
      };

      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const sessionId = await project.connect(42);

      expect(sessionId).toBe(42);
      expect(project.mixParams).toEqual({
        geoListenMode: GeoListenMode.MANUAL,
        recordingRadius: 200,
        ordering: "random",
        customParam: "customValue",
      });
    });
  });

  describe("uiconfig", () => {
    it("should fetch and return the UI configuration", async () => {
      const mockUiConfig: IUiConfig = {
        speak: [
          {
            display_items: [
              { id: 1, default_state: true, parent_id: null, tag_display_text: "Tag 1", tag_id: 101 },
            ],
            group_short_name: "speak-group",
          },
        ],
      };

      mockApiClient.get.mockResolvedValueOnce(mockUiConfig);

      const uiConfig = await project.uiconfig(42);

      expect(uiConfig).toEqual(mockUiConfig);
      expect(mockApiClient.get).toHaveBeenCalledWith("/projects/123/uiconfig/", { session_id: 42 });
    });

    it("should handle API error gracefully while fetching UI config", async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error("API Error"));

      await expect(project.uiconfig(42)).rejects.toThrow("API Error");
    });
  });
});
