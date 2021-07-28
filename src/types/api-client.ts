export interface ApiClientOptions extends RequestInit {
  contentType?: string;
  [index: string]: any;
}

export interface IApiClient {
  get<T>(path: string, data: object, options?: ApiClientOptions): Promise<T>;
  post<T>(path: string, data: object, options?: ApiClientOptions): Promise<T>;
  patch<T>(path: string, data: object, options?: ApiClientOptions): Promise<T>;
  send<T>(path: string, data: object, options?: ApiClientOptions): Promise<T>;
  set authToken(token: string);
}
