/** Responsible for identifying an anonymous participant to the Roundware server
 * and retrieving a participant token for session persistence.
 *
 * Replaces the v2 User class for public/anonymous interactions.
 * The device_id is auto-generated and persisted in localStorage.
 */

import { ApiClient } from "./api-client";
import { IParticipantResponse } from "./types/participant";

const DEVICE_ID_KEY = "rw_device_id";

function generateDeviceId(): string {
  // Generate a random device ID similar to a browser fingerprint
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

function getOrCreateDeviceId(): string {
  try {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = generateDeviceId();
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch {
    // localStorage not available (SSR, private browsing, etc.)
    return generateDeviceId();
  }
}

export class Participant {
  apiClient: ApiClient;
  deviceId: string;
  clientType: string;
  id?: number;
  participantToken?: string;

  /** Create a Participant
   * @param {Object} options - Configuration parameters
   * @param {ApiClient} options.apiClient - the API client object to use for server API calls
   * @param {string} [options.deviceId] - optional explicit device ID; if omitted, auto-generated and persisted in localStorage
   * @param {string} [options.clientType="web"] - client type identifier
   */
  constructor({
    apiClient,
    deviceId,
    clientType = "web",
  }: {
    apiClient: ApiClient;
    deviceId?: string;
    clientType?: string;
  }) {
    this.apiClient = apiClient;
    this.deviceId = deviceId || getOrCreateDeviceId();
    this.clientType = clientType;
  }

  /** @returns {string} human-readable representation of this participant */
  toString(): string {
    return `Participant #${this.id ?? "not yet connected"} (deviceId ${this.deviceId})`;
  }

  /** Make an API call to find or create a participant for this device.
   * Upon success, sets the auth token on the apiClient.
   * @param {number} projectId - the project to associate with
   * @returns {Promise<IParticipantResponse>} the participant data including token
   */
  async connect(projectId: number): Promise<IParticipantResponse> {
    const data = {
      project_id: projectId,
      device_id: this.deviceId,
      client_type: this.clientType,
    };

    const responseData = await this.apiClient.post<IParticipantResponse>(
      "/participants/",
      data
    );

    this.id = responseData.id;
    this.participantToken = responseData.participant_token ?? undefined;

    // Sent with every request from now on, in its own header
    // (ApiClient.participantToken): not as Authorization: Bearer, which
    // the server reads as a team member's JWT and answers by demanding
    // X-Tenant-Slug.
    this.apiClient.participantToken = this.participantToken;

    // Persist the token for cross-session reconnection.
    if (this.participantToken) {
      try {
        localStorage.setItem("rw_participant_token", this.participantToken);
      } catch {
        // localStorage not available
      }
    }

    return responseData;
  }
}
