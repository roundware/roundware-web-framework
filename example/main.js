var roundwareServerUrl = "http://localhost:8888/api/2";
var roundwareProjectId = 1; // corresponds to a project setup in the roundware server developer seed script 
var roundware;
var streamPlayer, audioSource, pauseButton, playButton, tagIds, recordButton;

function startListening(streamURL) {
  console.info("Loading " + streamURL);
  audioSource.prop("src",streamURL);
  streamPlayer.trigger("load");
  tagIds.prop("disabled",false);
}

function play(streamURL) {
  roundware.play(startListening).
    then(function handleListening() {
      console.info("Playing audio");
      streamPlayer.trigger("play");
      pauseButton.prop("disabled",false);
      playButton.prop("disabled",true);
    }).
    catch(handleError);
}

function pause() {
  console.info("pausing");
  streamPlayer.trigger("pause");
  pauseButton.prop("disabled",true);
  playButton.prop("disabled",false);
  roundware.pause();
}

function handleTagInput(evt) {
  roundware.tags(tagIds.val().join(","));
}

function ready() {
  console.info("Connected to Roundware Server. Ready to play.");

  playButton.prop("disabled",false);
  playButton.click(play);
  pauseButton.click(pause);

  tagIds.change(handleTagInput);
}

// Generally we throw user-friendly messages and log a more technical message
function handleError(userErrMsg) {
  console.error("There was a Roundware Error: " + userErrMsg);
}

// Audio recording code adapted from https://github.com/mdn/web-dictaphone/ example
function setupRecordingControls() {
  // set up basic variables for app

  var record = $("#record");
  var stop = $("#stop");
  var soundClips = $('.sound-clips');
  var canvas = document.querySelector('.visualizer');

  // disable stop button while not recording
  stop.disabled = true;

  // visualiser setup - create web audio api context and canvas
  var audioCtx = new window.AudioContext();
  var canvasCtx = canvas.getContext("2d");

  if (navigator.getUserMedia) {
    console.log('getUserMedia supported.');

    var constraints = { audio: true };
    var chunks = [];

    var onSuccess = function(stream) {
      var mediaRecorder = new MediaRecorder(stream);

      visualize(stream);

      record.onclick = function() {
        mediaRecorder.start();
        console.log(mediaRecorder.state);
        console.log("recorder started");
        record.style.background = "red";

        stop.disabled = false;
        record.disabled = true;
      };

      stop.onclick = function() {
        mediaRecorder.stop();
        console.log(mediaRecorder.state);
        console.log("recorder stopped");
        record.style.background = "";
        record.style.color = "";
        // mediaRecorder.requestData();

        stop.disabled = true;
        record.disabled = false;
      };

      mediaRecorder.onstop = function(e) {
        console.log("data available after MediaRecorder.stop() called.");

        var clipName = prompt('Enter a name for your sound clip?','My unnamed clip');
        console.log(clipName);
        var clipContainer = document.createElement('article');
        var clipLabel = document.createElement('p');
        var audio = document.createElement('audio');
        var deleteButton = document.createElement('button');

        clipContainer.classList.add('clip');
        audio.setAttribute('controls', '');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'delete';

        if(clipName === null) {
          clipLabel.textContent = 'My unnamed clip';
        } else {
          clipLabel.textContent = clipName;
        }

        clipContainer.appendChild(audio);
        clipContainer.appendChild(clipLabel);
        clipContainer.appendChild(deleteButton);
        soundClips.appendChild(clipContainer);

        audio.controls = true;
        var blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
        chunks = [];
        var audioURL = window.URL.createObjectURL(blob);
        audio.src = audioURL;
        console.log("recorder stopped");

        deleteButton.onclick = function(e) {
          evtTgt = e.target;
          evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode);
        };

        clipLabel.onclick = function() {
          var existingName = clipLabel.textContent;
          var newClipName = prompt('Enter a new name for your sound clip?');
          if(newClipName === null) {
            clipLabel.textContent = existingName;
          } else {
            clipLabel.textContent = newClipName;
          }
        };
      };

      mediaRecorder.ondataavailable = function(e) {
        chunks.push(e.data);
      };
    };

    var onError = function(err) {
      console.log('The following error occured: ' + err);
    };

    navigator.getUserMedia(constraints, onSuccess, onError);
  } else {
    console.log('getUserMedia not supported on your browser!');
  }
}

function visualize(stream) {
  var source = audioCtx.createMediaStreamSource(stream);

  var analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  var bufferLength = analyser.frequencyBinCount;
  var dataArray = new Uint8Array(bufferLength);

  source.connect(analyser);
  //analyser.connect(audioCtx.destination);

  WIDTH = canvas.width;
  HEIGHT = canvas.height;

  draw();

  function draw() {

    requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = 'rgb(200, 200, 200)';
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

    canvasCtx.beginPath();

    var sliceWidth = WIDTH * 1.0 / bufferLength;
    var x = 0;


    for(var i = 0; i < bufferLength; i++) {

      var v = dataArray[i] / 128.0;
      var y = v * HEIGHT/2;

      if(i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height/2);
    canvasCtx.stroke();

  }
}


$(function startApp() {
  roundware = new Roundware(window,{
    serverUrl: roundwareServerUrl,
    projectId: roundwareProjectId
  });

  streamPlayer = $("#streamplayer");
  audioSource  = $("#audiosource");
  pauseButton  = $("#pause");
  playButton   = $("#play");
  tagIds       = $("#tag_ids");
  recordButton = $("#record");

  roundware.connect().
    then(ready).
    catch(handleError);
});
