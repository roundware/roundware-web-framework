# RoundwareJS

## Introduction

[Roundware](http://roundware.org/) is a location-based contributory audio platform. This framework provides a JavaScript SDK for interacting with the [Roundware Server API](https://github.com/roundware/roundware-server). The goal is to enable the creation of browser-based contributory audio and audio augmented reality applications.

Note: this is currently alpha software; this code is in flux!

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

> Node
  
```bash
npm install roundware-web-framework
```

> Browser

TODO add browser example

## Resources

* [Code of Conduct](https://github.com/roundware/roundware-web-framework/blob/master/CODE_OF_CONDIUCT.md)
* [Documentation](https://roundware.github.io/roundware-web-framework/)
* [Source Code](https://github.com/roundware/roundware-web-framework/)
* [npm package](https://www.npmjs.com/package/roundware-web-framework)
* [CI Build](https://travis-ci.org/roundware/roundware-web-framework)
* TODO link to code coverage

## References

* [How to Write an Open Source JavaScript Library](https://github.com/sarbbottam/write-an-open-source-js-lib#creating-the-library-and-adding-dependencies): a lot of the initial project setup was adapted from this tutorial.

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

## Badges

[![Build Status](https://travis-ci.org/roundware/roundware-web-framework.svg?branch=master)](https://travis-ci.org/roundware/roundware-web-framework)

## Copyright and License

By Mike Subelsky and other authors. See [COPYRIGHT.txt](COPYRIGHT.txt) and [LICENSE.txt](LICENSE.txt) for more details.
