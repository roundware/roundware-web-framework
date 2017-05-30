"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Stream = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _shims = require("./shims");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var apiClient, sessionId, streamId, streamApiUrl, streamAudioUrl, coords, heartbeatInterval;
var defaultHeartbeatIntervalSeconds = 60;

/** Establishes an audio stream with the Roundware server, and notifies Roundware of events like tag
 * and geoposition updates 
 * @todo skip/ - causes currently playing asset to fade out and next available asset in playlist to begin playing thereafter
 * @todo playasset/ - causes currently playing asset to fade out and asset specified by asset_id param is played thereafter
 * @todo replayasset/ - causes currently playing asset to fade out and start playing again
 * @todo pause/ - causes currently playing asset to fade out and prevents any further assets from being added to the stream (though the playlist continues to be updated per PATCH calls)
 * @todo resume/ - un-does pause by allowing assets to be added to stream again from the playlist
 * **/

var Stream = exports.Stream = function () {
  /** Create a new Stream 
   * @param {Object} options - Various configuration parameters for this stream
   * @param {apiClient} options.apiClient - the API client object to use for server API calls
   * @param {Number} [options.heartbeatIntervalSeconds = 60"] how frequently to send a stream heartbeat
  **/
  function Stream(options) {
    _classCallCheck(this, Stream);

    apiClient = options.apiClient;
    heartbeatInterval = (options.heartbeatIntervalSeconds || defaultHeartbeatIntervalSeconds) * 1000;
  }

  /** @returns {String] human-readable description of this stream **/


  _createClass(Stream, [{
    key: "toString",
    value: function toString() {
      return "Roundware Stream #" + streamId + " (" + streamApiUrl + ")";
    }

    /** Request a streaming audio URL from Roundware server and establish a regular heartbeat.
     * @param {Number} _sessionId - Identifies the current session, must have been previously established by an instance of the Session class
     * @param {Promise}  initialGeoLocation - we will wait on this promise to resolve with initial coordinates before attempting to establish a stream
     * @returns {Promise} represents the pending API call 
     * @note 
     * The heartbeat is used to keep a stream alive during a session. Streams take a lot of resources on the server, so we put the auto-kill mechanism 
     * in place to not have useless streams taking resources, but needed a method to keep them alive when we know they are still wanted.
     * **/

  }, {
    key: "connect",
    value: function connect(_sessionId, initialGeoLocation) {
      sessionId = _sessionId;

      return initialGeoLocation.then(function (coords) {
        var createStreamData = {};
        Object.assign(createStreamData, coords, { session_id: sessionId });

        // Now we ask the server to create a new audio stream for us
        var audioStreamPromise = apiClient.post("/streams/", createStreamData, {
          crossDomain: true,
          cache: true // to avoid CORS problems
        });

        return audioStreamPromise;
      }).then(function streamsSuccess(streamData) {
        streamAudioUrl = streamData.stream_url;
        streamId = streamData.stream_id;
        streamApiUrl = "/streams/" + streamId + "/";

        var heartbeatUrl = "/streams/" + streamId + "/heartbeat/";
        var heartbeatData = {
          session_id: sessionId
        };

        setInterval(function sendHeartbeat() {
          apiClient.post(heartbeatUrl, heartbeatData);
        }, heartbeatInterval);

        // return the audio URL back to the caller so this promise can be chained in the Roundware class
        return streamAudioUrl;
      });
    }

    /** Sends data to the Roundware server. If the Stream has not been established, does nothing. Can use a list of tag_ids or a position (lat/lon) to filter the assets available to the stream. 
     * Typically for a normal geo-listen project, the position PATCH calls are triggered automatically by the client’s GPS/location system: every time a new position is registered by the client, 
     * a PATCH call is sent to let the server know and the server acts accordingly by adjusting the underlying music mix as well as modifying the playlist of available assets to be played. 
     * @param {Object} data [{}] 
     * **/

  }, {
    key: "update",
    value: function update() {
      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (streamApiUrl) {
        data.session_id = sessionId;
        apiClient.patch(streamApiUrl, data);
      }
    }
  }]);

  return Stream;
}();