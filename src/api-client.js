import { logger } from "./shims";

var jQuery = require('jquery');

// NOTE: Every HTTP method except ".get()" will cause most browers to issue a preflight requirements check to the server via the OPTIONS verb, 
// to verify CORS will allow the response to load in the browser. Sometimes this OPTIONS call can get obscured in debugging tools.
export class ApiClient {
  constructor(baseServerUrl,options = {}) {
    this._serverUrl = baseServerUrl;
    this._ajaxInterface = options.ajaxInterface || jQuery;
  }

  get(path,data,options = {}) {
    options.method = "GET";
    return this.send(path,data,options);
  }

  post(path,data,options = {}) {
    options.method = "POST";
    return this.send(path,data,options);
  }

  patch(path,data,options = {}) {
    options.method = "PATCH";
    return this.send(path,data,options);
  }

  /** Transmit an Ajax request to the Roundware API. Note that the Roundware Server expects paths to end with a trailing slash: /sessions/ instead of /sessions
   * @param path {string} - identifies the endpoint to receive the request
   * @param data {object} - the payload to send
   * @param options {object} - any additional options to add to the Ajax request 
   * @throws Will throw user-friendly error message and a technical error message in the event of an unsuccessful request 
   * @todo might be a good place to implement exponential retry of certain types of errors
   * **/
  send(path,data,options = {}) {
    var url = this._serverUrl + path;

    options.data = data;
    options.crossDomain = true;

    let requestPromise = this._ajaxInterface.ajax(url,options);

    let errorHandlingRequestPromise = requestPromise.catch((xhr,textStatus,errorThrown) => {
      // We catch and rethrow the error so it can bubble up as a useful error message to the user
      let techMsg = `API connection problem: '${textStatus}'; error thrown: (${errorThrown})`;
      logger.error(techMsg);

      let usrMsg = "We were unable to contact the audio server. Please try again.";
      throw(usrMsg,techMsg);
    });

    return errorHandlingRequestPromise;
  }

  setAuthToken(authToken) {
    var headers = {
      Authorization: "token " + authToken
    };

    this._ajaxInterface.ajaxSetup({
      headers: headers
    });
  }
}
