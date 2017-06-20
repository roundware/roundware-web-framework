# RoundwareJS

## Introduction

[Roundware](http://roundware.org/) is a location-based contributory audio platform. This framework provides a JavaScript SDK for interacting with the [Roundware Server API](https://github.com/roundware/roundware-server). The goal is to enable the creation of browser-based contributory audio and audio augmented reality applications. The library is written in ES6 but is built to run in all modern browsers that support HTML5 audio. 

<aside class="warning">
This is currently alpha software; the code is in flux!
</aside>

## Code Samples

```html
<html>
  <body>
    <script type="text/javascript" src="https://unpkg.com/roundware-web-framework@0.0.1-alpha.4/dist/roundware.umd.min.js"></script>
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

* See [Roundware Web Demo](https://github.com/subelsky/roundware_web_demo) for an example of using Roundware inside of an application

## Resources

* [Code of Conduct](https://github.com/roundware/roundware-web-framework/blob/master/CODE_OF_CONDIUCT.md)
* [Documentation](https://roundware.github.io/roundware-web-framework/)
* [Demo Site](https://github.com/subelsky/roundware_web_demo/) (and also check out [examples])
* [Roundware Terminology](http://roundware.org/docs/terminology/index.html)
* [Source Code](https://github.com/roundware/roundware-web-framework/)
* [npm package](https://www.npmjs.com/package/roundware-web-framework)
* [CI Build](https://travis-ci.org/roundware/roundware-web-framework)
* TODO figure out how to display code coverage report

## References

* [How to Write an Open Source JavaScript Library](https://github.com/sarbbottam/write-an-open-source-js-lib#creating-the-library-and-adding-dependencies): a lot of the initial project setup was adapted from this tutorial.

## Development

See [HOW_TO_CONTRIBUTE](HOW_TO_CONTIRBUTE.md).

## Pieces of Flair

[![Build Status](https://travis-ci.org/roundware/roundware-web-framework.svg?branch=master)](https://travis-ci.org/roundware/roundware-web-framework)

## Copyright and License

By Mike Subelsky and other authors. See [COPYRIGHT.txt](COPYRIGHT.txt) and [LICENSE.txt](LICENSE.txt) for more details.
