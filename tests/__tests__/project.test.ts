import { Project } from "../../src/project";
import { ApiClient } from "../../src/api-client";
import { GeoListenMode } from "../../src/mixer";
import { IProjectData } from "../../src/types/project";

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
        max_recording_length_sec: 300,
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
        max_recording_length_sec: 600,
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
        max_recording_length_sec: 400,
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

  describe("fetchUIConfig", () => {
    it("should fetch uigroups and tags, then return transformed UI configuration", async () => {
      const mockUIGroups = [
        {
          id: 1,
          project_id: 123,
          name: "speak-group",
          ui_mode: "speak",
          tag_category_id: 1,
          select_type: "single",
          is_active: true,
          sort_index: 0,
          header_text: "Speak Header",
          ui_item_filter: null,
          ui_items: [
            {
              id: 1,
              ui_group_id: 1,
              tag_id: 101,
              sort_index: 0,
              is_default: true,
              is_active: true,
              parent_id: null,
            },
          ],
        },
      ];

      const mockTags = [
        {
          id: 101,
          project_id: 123,
          tag_category_id: 1,
          value: "Tag 1",
          description: null,
          data: null,
          filter: null,
        },
      ];

      // fetchUIConfig calls get() twice: once for /uigroups/, once for /tags/
      mockApiClient.get
        .mockResolvedValueOnce(mockUIGroups)
        .mockResolvedValueOnce(mockTags);

      const uiConfig = await project.fetchUIConfig(42);

      expect(mockApiClient.get).toHaveBeenCalledWith("/uigroups/", { project_id: 123 });
      expect(mockApiClient.get).toHaveBeenCalledWith("/tags/", { project_id: 123 });

      expect(uiConfig).toEqual({
        speak: [
          {
            display_items: [
              { id: 1, default_state: true, parent_id: null, tag_display_text: "Tag 1", tag_id: 101 },
            ],
            group_short_name: "speak-group",
            header_display_text: "Speak Header",
            select_type: "single",
            uiitem_filter: "none",
          },
        ],
      });
    });

    it("should handle API error gracefully while fetching UI config", async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error("API Error"));

      await expect(project.fetchUIConfig(42)).rejects.toThrow("API Error");
    });
  });
});
