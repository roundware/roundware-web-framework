import logger from "./logger";

var ajaxInterface = {};
var serverUrl;
var jQuery = require('jQuery');

export class ApiClient {
  constructor(baseServerUrl,options = {}) {
    ajaxInterface = options.ajaxInterface || jQuery;
    serverUrl = baseServerUrl;
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

  // note: Roundware Server expects paths to end with a trailing slash: /sessions/ instead of /sessions
  // TODO make this method account for that, adding it if needed
  send(path,data,options = {}) {
    var url = serverUrl + path;
    options.data = data;
    return ajaxInterface.ajax(url,options);
  }

  setAuthToken(authToken) {
    var headers = {
      Authorization: "token " + authToken,
    };

    console.info("AUTH TOKEN SET");
    ajaxInterface.ajaxSetup({
      headers: headers,
      crossDomain: true
    });
  }
}
