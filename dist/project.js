"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Project = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _shims = require("./shims");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var projectId, apiClient;
var projectName = "(unknown)";
var pubDate, audioFormat;

var Project = exports.Project = function () {
  function Project(newProjectId, options) {
    _classCallCheck(this, Project);

    projectId = newProjectId;
    apiClient = options.apiClient;
  }

  _createClass(Project, [{
    key: "toString",
    value: function toString() {
      return "Roundware Project '" + projectName + "' (#" + projectId + ")";
    }
  }, {
    key: "connect",
    value: function connect(sessionId) {
      var path = "/projects/" + projectId;

      var data = {
        session_id: sessionId
      };

      return apiClient.get(path, data).then(function connectionSuccess(data) {
        projectName = data.name;
        pubDate = data.pub_date;
        audioFormat = data.audio_format;
        return sessionId;
      });
    }
  }]);

  return Project;
}();