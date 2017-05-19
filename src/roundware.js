import { Project } from "./project";
import { Session } from "./session";
import { GeoPosition } from "./geo-position";
import { Stream } from "./stream";
import logger from "./logger";
import { ApiClient } from "./api-client";
import { User } from "./user";

var serverUrl, projectId;
var apiClient = {};
var geoPosition = {};
var user = {};
var session = {};
var project = {};
var stream = {};

class Roundware {
  constructor(options = {}) {
    // TODO add some error checking of these first two params, can"t be undefined
    serverUrl = options.serverUrl;
    projectId = options.projectId;

    apiClient = new ApiClient(serverUrl);

    options.apiClient = apiClient;

    user = new User(options);
    geoPosition = new GeoPosition(options);
    session = new Session(projectId,geoPosition.isGeoEnabled(),options);
    project = new Project(projectId,options);
    stream = new Stream(options);
  }

  start(options) {
    var initialGeoLocation = geoPosition.connect(); // want to start this process as soon as possible, as it can take a few seconds

    logger.info("Initializing Roundware for project ID #" + projectId);

    var successCallback = options.success || (() => {});
    var errorCallback   = options.error   || (() => {});

    user.connect().
      then(session.connect).
      then(project.connect).
      then((sessionId) => { return stream.connect(sessionId,initialGeoLocation); }).
      then(successCallback).
      fail(errorCallback);
  }

  tags(tagIdStr) {
    stream.update({ tag_ids: tagIdStr });
  }
}

// Slight hack here to export Roundware module to browser properly; see https://github.com/webpack/webpack/issues/3929
module.exports = Roundware;
