import { logger } from "./shims";

var jQuery = require('jquery');

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
   * @param options {object} - any additional options to add to the Ajax request **/
  send(path,data,options = {}) {
    var url = this._serverUrl + path;
    options.data = data;
    return this._ajaxInterface.ajax(url,options);
  }

  setAuthToken(authToken) {
    var headers = {
      Authorization: "token " + authToken,
    };

    this._ajaxInterface.ajaxSetup({
      headers: headers,
      crossDomain: true
    });
  }
}
