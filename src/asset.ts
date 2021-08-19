import { ApiClient } from "./api-client";
import {
  InvalidArgumentError,
  MissingArgumentError,
} from "./errors/app.errors";

/* global process */
export const PATH =
  process.env.NODE_ENV === "development"
    ? "/assets/?created__lte=2019-08-15T18:06:39"
    : "/assets/";

export class Asset {
  private _projectId: number;
  private _apiClient: ApiClient;
  constructor(projectId: number, options: { apiClient: ApiClient }) {
    if (typeof projectId == "undefined")
      throw new MissingArgumentError(
        "projectId",
        "instantiating Asset",
        "number"
      );
    if (typeof projectId !== "number")
      throw new InvalidArgumentError(
        "projectId",
        "number",
        "instantiating Asset"
      );
    if (options.apiClient instanceof ApiClient)
      this._apiClient = options.apiClient;
    else
      throw new InvalidArgumentError(
        "apiClient",
        "ApiClient",
        "instantiating Asset"
      );
    this._projectId = projectId;
  }

  toString(): string {
    return `Roundware Assets (#${this._projectId})`;
  }

  async connect<T>(data = {}): Promise<T> {
    const options = { ...data, project_id: this._projectId };
    return await this._apiClient.get<T>(PATH, options);
  }
}
