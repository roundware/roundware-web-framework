"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ApiClient = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _shims = require("./shims");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var jQuery = require('jquery');

var ApiClient = exports.ApiClient = function () {
  function ApiClient(baseServerUrl) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, ApiClient);

    this._serverUrl = baseServerUrl;
    this._ajaxInterface = options.ajaxInterface || jQuery;
  }

  _createClass(ApiClient, [{
    key: "get",
    value: function get(path, data) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      options.method = "GET";
      return this.send(path, data, options);
    }
  }, {
    key: "post",
    value: function post(path, data) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      options.method = "POST";
      return this.send(path, data, options);
    }
  }, {
    key: "patch",
    value: function patch(path, data) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      options.method = "PATCH";
      return this.send(path, data, options);
    }

    // note: Roundware Server expects paths to end with a trailing slash: /sessions/ instead of /sessions
    // TODO make this method account for that, adding it if needed

  }, {
    key: "send",
    value: function send(path, data) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      var url = this._serverUrl + path;
      options.data = data;
      return this._ajaxInterface.ajax(url, options);
    }
  }, {
    key: "setAuthToken",
    value: function setAuthToken(authToken) {
      var headers = {
        Authorization: "token " + authToken
      };

      this._ajaxInterface.ajaxSetup({
        headers: headers,
        crossDomain: true
      });
    }
  }]);

  return ApiClient;
}();