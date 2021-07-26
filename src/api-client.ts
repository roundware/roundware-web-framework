const GENERIC_ERROR_MSG =
  "We were unable to contact the audio server, please try again.";

// Handles HTTP interactions with the Roundware API server, v2.
// NOTE: Every HTTP method except ".get()" will cause most browsers to issue a preflight requirements check to the server via the OPTIONS verb,
// to verify CORS will allow the response to load in the browser. Sometimes this OPTIONS call can get obscured in debugging tools.
// @see http://roundware.org/docs/terminology/index.html

interface ApiClientOptions extends RequestInit {
  contentType?: string;
  [index: string]: any;
}

export interface IApiClient {
  get(path: string, data: object, options: ApiClientOptions): Promise<object>;
  post(path: string, data: object, options: ApiClientOptions): Promise<object>;
  patch(path: string, data: object, options: ApiClientOptions): Promise<object>;
  send(path: string, data: object, options: ApiClientOptions): Promise<object>;
}
export class ApiClient implements IApiClient {
  /** Create a new ApiClient
   * @param {String} baseServerUrl - identifies the Roundware server to receive API requests
   * @param {Boolean} [options.fetch = fetch] - for testing purposes, you can inject the fetch mechanism to use for making network requests **/

  private _jQuery: any;
  _serverUrl: string;
  _authToken: string;

  constructor(window: Window, baseServerUrl: string) {
    this._jQuery = window.jQuery;
    this._serverUrl = baseServerUrl;
    this._authToken = "";
  }

  /** Make a GET request to the Roundware server
   * @param {String} path - the path for your API request, such as "/streams/"
   * @param {Object} options - see the "send" method
   * @see {send} **/
  async get(path: string, data: object, options: ApiClientOptions = {}) {
    options.method = "GET";
    options.contentType = "x-www-form-urlencoded";
    return await this.send(path, data, options);
  }

  /** Make a POST request to the Roundware server
   * @param {String} path - the path for your API request, such as "/streams/"
   * @param {Object} options - see the "send" method
   * @see {send} **/
  async post(path: string, data: object, options: ApiClientOptions = {}) {
    options.method = "POST";
    return await this.send(path, data, options);
  }

  /** Make a PATCH request to the Roundware server
   * @param {String} path - the path for your API request, such as "/streams/"
   * @param {Object} options - see the "send" method
   * @see {send} **/
  async patch(path: string, data: object, options: ApiClientOptions = {}) {
    options.method = "PATCH";
    return await this.send(path, data, options);
  }

  /** Transmit an Ajax request to the Roundware API. Note that the Roundware Server expects paths to end with a trailing slash: /sessions/ instead of /sessions
   * @param path {string} - identifies the endpoint to receive the request
   * @param data {object} - the payload to send
   * @param urlOptions {object} - any additional options to add to the URL
   * @return {Promise} - will resolve or reject depending on the status of the request
   * @todo might be a good place to implement exponential retry of certain types of errors
   * @todo as of 2019, the fetch() polyfills are good enough that we should be able to get rid of JQuery dependency
   * **/
  async send(
    path: string,
    data: { [key: string]: any } = {},
    urlOptions: ApiClientOptions
  ): Promise<object> {
    const url = new URL(this._serverUrl + path);

    let { contentType, method } = urlOptions;
    const requestInit: RequestInit = {
      method,
      mode: "cors",
      body: "",
      headers: {},
    };

    const queryParams = new URLSearchParams("");

    for (let key in urlOptions) {
      queryParams.append(key, urlOptions[key]);
    }

    const headers: { [key: string]: any } = {};

    switch (method) {
      // for these cases, anything in 'data' has to be appended to query string
      case "GET":
      case "HEAD":
        for (let key in data) queryParams.append(key, data[key]);
        break;
      // for other HTTP methods, 'data' has to be turned into a request body, with a properly-set Content-Type required by the Roundware server API.
      default:
        let stringData: string = "";
        if (!contentType) {
          // If you don't specify a contentType, we assume you want us to convert your payload to JSON
          contentType = "application/json";
          stringData = JSON.stringify(data);
        }

        if (contentType != "multipart/form-data") {
          headers["Content-Type"] = contentType;
        }
        requestInit.body = stringData;

        break;
    }

    url.search = queryParams.toString();

    if (this._authToken) {
      headers["Authorization"] = this._authToken;
    }

    requestInit.headers = headers;

    let response;

    try {
      response = await fetch(url.toString(), requestInit);
    } catch (error) {
      console.error("Roundware network error:", error.message);
      throw GENERIC_ERROR_MSG;
    }

    if (!response.ok) {
      console.error("Roundware API error, code:", response.status);
      throw GENERIC_ERROR_MSG;
    }

    try {
      const json = await response.json();
      return json;
    } catch (error) {
      console.error("Unable to decode Roundware response", error);
      throw GENERIC_ERROR_MSG;
    }
  }

  /** Set the authorization token to use as the header for future API requests. Most Roundware API calls require an auth token to be set.
   * @param {String} authToken - characters to use in the authorization header **/
  set authToken(tokenStr: string) {
    this._authToken = `token ${tokenStr}`;
  }
}