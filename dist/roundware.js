"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _project = require("./project");

var _session = require("./session");

var _geoPosition = require("./geo-position");

var _stream = require("./stream");

var _shims = require("./shims");

var _apiClient = require("./api-client");

var _user = require("./user");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var serverUrl, projectId;
var geoPosition = {};
var user = {};
var session = {};
var project = {};
var stream = {};

var noOp = function noOp() {};

/** This class is the primary integration point between Roundware's server and your application
 * @example
   var roundwareServerUrl = "http://localhost:8888/api/2";
   var roundwareProjectId = 1;

   var roundware = new Roundware({
     serverUrl: roundwareServerUrl,
     projectId: roundwareProjectId
   });

   roundware.start().
      then(function success(audioStreamURL) {
        console.info("We can now listen to:",audioStreamURL);
      },function error(errMsg) {
        console.error(errMsg);
      });
   });
**/

var Roundware = function () {
  /** @param {Object} options - Collection of parameters for configuring this Roundware instance
   * @param {String} options.serverUrl - identifies the Roundware server
   * @param {Number} options.projectId - identifies the Roundware project to connect
   * @param {Boolean} options.geoListenEnabled - whether or not to attempt to initialize geolocation-based listening
   * @throws Will throw an error if serveUrl or projectId are missing **/
  function Roundware() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Roundware);

    serverUrl = options.serverUrl;
    projectId = options.projectId;

    if (serverUrl === undefined) {
      throw "Roundware objects must be initialized with a serverUrl";
    }

    if (projectId === undefined) {
      throw "Roundware objects must be initialized with a projectId";
    }

    var apiClient = new _apiClient.ApiClient(serverUrl);
    options.apiClient = apiClient;

    user = options.user || new _user.User(options);
    geoPosition = options.geoPosition || new _geoPosition.GeoPosition(options);
    session = options.session || new _session.Session(projectId, geoPosition.geoListenEnabled, options);
    project = options.project || new _project.Project(projectId, options);
    stream = options.stream || new _stream.Stream(options);
  }

  /** Initiate a connection to Roundware
   *  @return {Promise} - Can be resolved in order to get the audio stream URL, or rejected to get an error message; see example above **/


  _createClass(Roundware, [{
    key: "start",
    value: function start() {
      var initialGeoLocation = geoPosition.connect(stream.update); // want to start this process as soon as possible, as it can take a few seconds

      _shims.logger.info("Initializing Roundware for project ID #" + projectId);

      return user.connect().then(session.connect).then(project.connect).then(function (sessionId) {
        return stream.connect(sessionId, initialGeoLocation);
      });
    }

    /** Update the Roundware stream with new tag IDs 
     * @param {string} tagIdStr - comma-separated list of tag IDs to send to the streams API **/

  }, {
    key: "tags",
    value: function tags(tagIdStr) {
      stream.update({ tag_ids: tagIdStr });
    }
  }]);

  return Roundware;
}();

// Slight hack here to export Roundware module to browser properly; see https://github.com/webpack/webpack/issues/3929


exports.default = Roundware;
module.exports = Roundware;