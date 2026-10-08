import { GeoListenMode } from "./mixer";
import { Coordinates, ITag, ITagGroup, IUiConfig } from "./types";
import { ApiClient } from "./api-client";
import { IProjectData } from "./types/project";

/** Raw UIGroup as returned by the v3 /uigroups/ endpoint */
interface IRawUIGroup {
  id: number;
  project_id: number;
  name: string;
  ui_mode: string; // "listen" | "speak"
  tag_category_id: number;
  select_type: string;
  is_active: boolean;
  sort_index: number;
  header_text: string;
  ui_item_filter: string | null;
  ui_items: IRawUIItem[];
}

/** Raw UIItem embedded in a UIGroup response */
interface IRawUIItem {
  id: number;
  ui_group_id: number;
  tag_id: number;
  sort_index: number;
  is_default: boolean;
  is_active: boolean;
  parent_id: number | null;
}

/** Raw Tag as returned by the v3 /tags/ endpoint */
interface IRawTag {
  id: number;
  project_id: number;
  tag_category_id: number;
  value: string; // This is the display text
  description: string | null;
  data: string | null;
  filter: string | null;
}

export class Project {
  projectId: number;
  projectName: string;
  apiClient: ApiClient;
  legalAgreement: string = "";
  recordingRadius!: number;
  maxRecordingLength?: number;
  location: Coordinates = { latitude: 1, longitude: 1 };
  outOfRangeDistance?: number;
  mixParams: {};
  listenEnabled?: boolean;
  speakerEnabled?: boolean;
  data?: IProjectData;

  constructor(newProjectId: number, { apiClient }: { apiClient: ApiClient }) {
    this.projectId = newProjectId;
    this.projectName = "(unknown)";
    this.apiClient = apiClient;
    this.mixParams = {};
  }

  toString(): string {
    return `Roundware Project '${this.projectName}' (#${this.projectId})`;
  }

  /**
   * Fetch project details from the server.
   * @param {number} sessionId
   * @returns {Promise} sessionId | undefined
   */
  async connect(sessionId: number): Promise<number | undefined> {
    const path = "/projects/" + this.projectId + "/";

    const requestData = { session_id: sessionId };

    try {
      const data = await this.apiClient.get<IProjectData>(path, requestData);
      this.data = data;
      this.projectName = data.name;
      this.legalAgreement = data.legal_agreement;
      this.recordingRadius = data.recording_radius;
      // v3 uses max_recording_length_sec; fall back to v2 max_recording_length
      this.maxRecordingLength = parseInt(
        (data.max_recording_length_sec ?? data.max_recording_length ?? 0).toString()
      );
      this.location = { latitude: data.latitude, longitude: data.longitude };
      this.outOfRangeDistance = data.out_of_range_distance;
      this.mixParams = {
        geoListenMode: data.geo_listen_enabled
          ? GeoListenMode.MANUAL
          : GeoListenMode.DISABLED,
        recordingRadius: data.recording_radius,
        ordering: data.ordering,
        ...this.mixParams,
      };

      return sessionId;
    } catch (err) {
      console.error("Unable to get Project details", err);
    }
  }

  /**
   * Fetch UI configuration by combining /uigroups/ and /tags/ endpoints.
   * This replaces the v2 /projects/{id}/uiconfig/ endpoint which no longer exists in v3.
   *
   * Transforms the raw UIGroup/UIItem/Tag data into the IUiConfig shape
   * expected by the web app (grouped by ui_mode with tag display text).
   *
   * @param {number} sessionId
   * @returns Promise<IUiConfig>
   */
  async fetchUIConfig(sessionId: number): Promise<IUiConfig> {
    // Fetch UIGroups (with embedded ui_items) and Tags in parallel
    const [uiGroups, tags] = await Promise.all([
      this.apiClient.get<IRawUIGroup[]>("/uigroups/", {
        project_id: this.projectId,
      }),
      this.apiClient.get<IRawTag[]>("/tags/", {
        project_id: this.projectId,
      }),
    ]);

    // Build tag lookup map: tag_id → display text (tag.value)
    const tagLookup = new Map<number, string>();
    for (const tag of tags) {
      tagLookup.set(tag.id, tag.value);
    }

    // Group UIGroups by ui_mode ("listen", "speak", etc.)
    const config: IUiConfig = {};

    for (const group of uiGroups) {
      if (!group.is_active) continue;

      const mode = group.ui_mode; // "listen" or "speak"

      // Transform ui_items into ITag[]
      const displayItems: ITag[] = group.ui_items
        .filter((item) => item.is_active)
        .sort((a, b) => a.sort_index - b.sort_index)
        .map((item) => ({
          id: item.id,
          tag_id: item.tag_id,
          default_state: item.is_default,
          parent_id: item.parent_id,
          tag_display_text: tagLookup.get(item.tag_id) || `Tag ${item.tag_id}`,
        }));

      const tagGroup: ITagGroup = {
        display_items: displayItems,
        group_short_name: group.name,
        header_display_text: group.header_text,
        select_type: group.select_type === "multi" ? "multi" : "single",
        uiitem_filter:
          group.ui_item_filter === "none" || !group.ui_item_filter
            ? "none"
            : (group.ui_item_filter as ITagGroup["uiitem_filter"]),
      };

      if (!config[mode]) {
        config[mode] = [];
      }
      config[mode]!.push(tagGroup);
    }

    return config;
  }

  /**
   * @deprecated Use fetchUIConfig() instead. The v2 /projects/{id}/uiconfig/ endpoint
   * does not exist in v3. This method is kept for backwards compatibility only.
   * @param {number} sessionId
   * @returns Promise<IUiConfig>
   */
  async uiconfig(sessionId: number): Promise<IUiConfig> {
    console.warn(
      "Project.uiconfig() is deprecated. Use Project.fetchUIConfig() instead."
    );
    return this.fetchUIConfig(sessionId);
  }
}
