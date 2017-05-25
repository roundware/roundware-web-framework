import { Project } from "./project";
import { Session } from "./session";
import { GeoPosition } from "./geo-position";
import { Stream } from "./stream";
import { logger } from "./shims";
import { ApiClient } from "./api-client";
import { User } from "./user";

var serverUrl, projectId;
var geoPosition = {};
var user = {};
var session = {};
var project = {};
var stream = {};

const noOp = () => {};

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
export default class Roundware {
  /** @param {Object} options - Collection of parameters for configuring this Roundware instance
   * @param {String} options.serverUrl - identifies the Roundware server
   * @param {Number} options.projectId - identifies the Roundware project to connect
   * @param {Boolean} options.geoListenEnabled - whether or not to attempt to initialize geolocation-based listening
   * @throws Will throw an error if serveUrl or projectId are missing **/
  constructor(options = {}) {
    serverUrl = options.serverUrl;
    projectId = options.projectId;

    if (serverUrl === undefined) {
      throw "Roundware objects must be initialized with a serverUrl";
    }

    if (projectId === undefined) {
      throw "Roundware objects must be initialized with a projectId";
    }

    let apiClient = new ApiClient(serverUrl);
    options.apiClient = apiClient;

    user        = options.user || new User(options);
    geoPosition = options.geoPosition || new GeoPosition(options);
    session     = options.session || new Session(projectId,geoPosition.isGeoEnabled,options);
    project     = options.project || new Project(projectId,options);
    stream      = options.stream || new Stream(options);
  }

  /** Initiate a connection to Roundware
   *  @return {Promise} - Can be resolved in order to get the audio stream URL, or rejected to get an error message; see example above **/
  start() {
    var initialGeoLocation = geoPosition.connect(stream.update); // want to start this process as soon as possible, as it can take a few seconds

    logger.info("Initializing Roundware for project ID #" + projectId);

    return user.connect().
      then(session.connect).
      then(project.connect).
      then((sessionId) => { return stream.connect(sessionId,initialGeoLocation); });
  }

  /** Update the Roundware stream with new tag IDs 
   * @param {string} tagIdStr - comma-separated list of tag IDs to send to the streams API **/
  tags(tagIdStr) {
    stream.update({ tag_ids: tagIdStr });
  }
}

// Slight hack here to export Roundware module to browser properly; see https://github.com/webpack/webpack/issues/3929
//module.exports = RoundwareClient;
