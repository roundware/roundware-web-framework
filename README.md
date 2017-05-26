# RoundwareJS

## Introduction

[Roundware](http://roundware.org/) is a location-based contributory audio platform. This framework provides a JavaScript SDK for interacting with the [Roundware Server API](https://github.com/roundware/roundware-server). The goal is to enable the creation of browser-based contributory audio and audio augmented reality applications.

## Code Samples

```html
<html>
  <body>
    <script type="text/javascript" src="roundware.js"></script>
    <script type="text/javascript" src="jquery-3.2.1.slim.min.js"></script>
    <script>
      var roundwareServerUrl = "http://localhost:8888/api/2";
      var roundwareProjectId = 1;

      var roundware = new Roundware({ serverUrl: roundwareServerUrl, projectId: roundwareProjectId });

      function handleListening(streamURL) {
        var streamPlayer = $("#streamplayer");
        var audioSource  = $("#audiosource");
        var pauseButton  = $("#pause");

        console.info("Starting to listen to " + streamURL);
        audioSource.prop("src",streamURL);

        streamPlayer.trigger("load");
        streamPlayer.trigger("play");

        pauseButton.click(function() {
          console.info("pausing");
          streamPlayer.trigger("pause");
        }).show();
      };

      $(function startApp() {
        roundware.start().then(handleListening);
      });
    </script>

    <audio id="streamplayer" style="border: solid 1px black;">
      <source id="audiosource" type="audio/mp3"></source>
    </audio>

    <button id="pause""display: none;">Pause</button>
  </body>
</html>
```

## Installation

* TODO: Need to fill this in after we release the first version and can practice setting it up

## Development

```bash
# Setup

git clone https://github.com/roundware/roundware-web-framework.git
cd roundware-web-framework
npm install

# Workflow

npm run test # run test suite
ROUNDWARE_DEBUG=true npm test # send logging statements to STDOUT

npm run devstart && open http://localhost:9000 # Uses webpack to live-reload source code in your browser

npm run build # see package.json for all the possible builds
npm run docbuild && open doc/index.html # creates jsdoc HTML files in doc/
```

## Copyright &amp; Open Source License

TODO: need to confer with @hburgund. Do we use GNU Affero General Public License v3.0 like the server does?
