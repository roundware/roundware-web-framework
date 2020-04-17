const GENERIC_ERROR_MSG = 'We were unable to contact the audio server, please try again.';

// Handles HTTP interactions with the Roundware API server, v2.
// NOTE: Every HTTP method except ".get()" will cause most browsers to issue a preflight requirements check to the server via the OPTIONS verb,
// to verify CORS will allow the response to load in the browser. Sometimes this OPTIONS call can get obscured in debugging tools.
// @see http://roundware.org/docs/terminology/index.html
export class ApiClient {
  /** Create a new ApiClient
   * @param {String} baseServerUrl - identifies the Roundware server to receive API requests
   * @param {Boolean} [options.fetch = fetch] - for testing purposes, you can inject the fetch mechanism to use for making network requests **/
  constructor(window,baseServerUrl) {
    this._jQuery = window.jQuery;
    this._serverUrl = baseServerUrl;
    this._authToken = null;
  }

  /** Make a GET request to the Roundware server
   * @param {String} path - the path for your API request, such as "/streams/"
   * @param {Object} options - see the "send" method
   * @see {send} **/
  get(path,data,options = {}) {
    options.method = "GET";
    options.contentType = 'x-www-form-urlencoded';
    return this.send(path,data,options);
  }

  /** Make a POST request to the Roundware server
   * @param {String} path - the path for your API request, such as "/streams/"
   * @param {Object} options - see the "send" method
   * @see {send} **/
  post(path,data,options = {}) {
    options.method = "POST";
    return this.send(path,data,options);
  }

  /** Make a PATCH request to the Roundware server
   * @param {String} path - the path for your API request, such as "/streams/"
   * @param {Object} options - see the "send" method
   * @see {send} **/
  patch(path,data,options = {}) {
    options.method = "PATCH";
    return this.send(path,data,options);
  }

  /** Transmit an Ajax request to the Roundware API. Note that the Roundware Server expects paths to end with a trailing slash: /sessions/ instead of /sessions
   * @param path {string} - identifies the endpoint to receive the request
   * @param data {object} - the payload to send
   * @param urlOptions {object} - any additional options to add to the URL
   * @return {Promise} - will resolve or reject depending on the status of the request
   * @todo might be a good place to implement exponential retry of certain types of errors
   * @todo as of 2019, the fetch() polyfills are good enough that we should be able to get rid of JQuery dependency
   * **/
  async send(path,data = {},{ contentType, method, ...urlOptions }) {
    const url = new URL(this._serverUrl + path);

    const requestInit = {
      method,
      mode: 'cors',
    };
    
    const queryParams = new URLSearchParams('');

    for (let key in urlOptions) {
      queryParams.append(key,urlOptions[key]);
    }

    const headers = {};

    switch (method) {
      // for these cases, anything in 'data' has to be appended to query string
      case 'GET':
      case 'HEAD':
        for (let key in data) queryParams.append(key,data[key]);
        break;
      // for other HTTP methods, 'data' has to be turned into a request body, with a properly-set Content-Type required by the Roundware server API.
      default:
        if (!contentType) {
          // If you don't specify a contentType, we assume you want us to convert your payload to JSON
          contentType = 'application/json';
          data = JSON.stringify(data);
        }

      if (contentType != "multipart/form-data") {
        headers['Content-Type'] = contentType;
      }
        requestInit.body = data;

        break;
    }

    url.search = queryParams;

    if (this._authToken) {
      headers['Authorization'] = this._authToken;
    }

    requestInit.headers = headers;

    let response;

    try {
      response = await fetch(url,requestInit);
    } catch (error) {
      console.error('Roundware network error:',error.message);
      throw GENERIC_ERROR_MSG;
    }

    if (!response.ok) {
      console.error('Roundware API error, code:',response.status);
      throw GENERIC_ERROR_MSG;
    }

    try {
      const json = await response.json();
      return json;
    } catch (error) {
      console.error('Unable to decode Roundware response',error);
      throw GENERIC_ERROR_MSG;
    }
  }

  /** Set the authorization token to use as the header for future API requests. Most Roundware API calls require an auth token to be set.
   * @param {String} authToken - characters to use in the authorization header **/
  set authToken(tokenStr) {
    this._authToken = `token ${tokenStr}`;
  }
}
