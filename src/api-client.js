import { logger } from "./shims";

// Handles HTTP interactions with the Roundware API server, v2.
// NOTE: Every HTTP method except ".get()" will cause most browsers to issue a preflight requirements check to the server via the OPTIONS verb,
// to verify CORS will allow the response to load in the browser. Sometimes this OPTIONS call can get obscured in debugging tools.
// @see http://roundware.org/docs/terminology/index.html
export class ApiClient {
  /** Create a new ApiClient
   * @param {Object} window - representing the context in which we are executing - provides reference to window.jQuery.ajax()
   * @param {String} baseServerUrl - identifies the Roundware server to receive API requests
   * @param {Boolean} [options.fetch = fetch] - for testing purposes, you can inject the fetch mechanism to use for making network requests **/
  constructor(window,baseServerUrl) {
    this._jQuery = window.jQuery;
    this._serverUrl = baseServerUrl;
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
   * @param options {object} - any additional options to add to the Ajax request
   * @return {Promise} - will resolve or reject depending on the status of the request
   * @todo might be a good place to implement exponential retry of certain types of errors
   * **/
  send(path,data,options = {}) {
    let url = this._serverUrl + path;

    options = Object.assign({},options);

    if (!options.timeout) {
      options.timeout = 30000; // 30 seconds, arbitrary
    }

    // If you specify a contentType, we assume you already have formatted your data
    if (options.contentType === 'multipart/form-data') {
      // multipart/form-data requires special treatment with jquery.ajax
      // in order to properly format the POST data
      options.data = data;
      options.contentType = false;
    } else if (options.contentType === 'x-www-form-urlencoded') {
      options.data = data;
    } else {
      // If you don't specify a contentType, we assume you want us to convert your payload to JSON
      options.contentType = 'application/json';
      options.data = JSON.stringify(data);
    }

    options.mode = "no-cors";

    let deferred = this._jQuery.Deferred();

    let promise = deferred.promise();

    this._jQuery.ajax(url,options).
      then((data) => deferred.resolve(data)).
      fail((jqXHR,textStatus,errorThrown) => {
        let techMsg = `${textStatus}: ${errorThrown}`;
        let usrMsg = `We were unable to contact the audio server due to a network problem; please try again: '${techMsg}'`;
        logger.error(techMsg,jqXHR);
        deferred.reject(usrMsg);
      });

    return promise;
  }

  /** Set the authorization token to use as the header for future API requests. Most Roundware API calls require an auth token to be set.
   * @param {String} authToken - characters to use in the authorization header **/
  setAuthToken(authToken) {
    this._jQuery.ajaxSetup({
      headers: { "Authorization": `token ${authToken}` }
    });
  }
}
