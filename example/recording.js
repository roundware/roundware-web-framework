// Audio recording code roughly adapted from https://github.com/mdn/web-dictaphone/ example
var audioCtx = new window.AudioContext();
var canvas = document.querySelector('.visualizer');
var canvasCtx = canvas.getContext("2d");

function initRecording() {
  var recorder;

  startRecordButton.addEventListener( "click", function(){ recorder.start(); });
  stopRecordButton.addEventListener( "click", function(){ recorder.stop(); });
  // uploadButton.addEventListener( "click", function(){ recorder.stop(); });

  if (!Recorder.isRecordingSupported()) {
    console.log("Recording features are not supported in your browser.");
  }

  recorder = new Recorder({
    // monitorGain: parseInt(monitorGain.value, 10),
    // numberOfChannels: parseInt(numberOfChannels.value, 10),
    // wavBitDepth: parseInt(bitDepth.value,10),
    encoderPath: "waveWorker.min.js"
  });

  recorder.addEventListener( "start", function(e){
    console.log('Recorder is started');
    startRecordButton.disabled = true;
    stopRecordButton.disabled = false;
  });

  recorder.addEventListener( "stop", function(e){
    console.log('Recorder is stopped');
    stopRecordButton.disabled = startRecordButton.disabled = true;
  });

  recorder.addEventListener( "streamError", function(e){
    console.log('Error encountered: ' + e.error.name );
  });

  recorder.addEventListener( "streamReady", function(e){
    stopRecordButton.disabled = true;
    startRecordButton.disabled = false;
    console.log('Audio stream is ready.');
  });

  recorder.addEventListener( "dataAvailable", function(e){
    uploadButton.disabled = false;
    var dataBlob = new Blob( [e.detail], { type: 'audio/wav' } );
    var wavFileName = new Date().toISOString() + ".wav";
    var url = URL.createObjectURL( dataBlob );

    var audio = document.createElement('audio');
    audio.controls = true;
    audio.src = url;

    var link = document.createElement('a');
    link.href = url;
    link.download = wavFileName;
    link.innerHTML = link.download;

    var li = document.createElement('li');
    li.appendChild(link);
    li.appendChild(audio);

    recordingslist.appendChild(li);

    uploadButton.addEventListener( "click", function(){
      let data = {};
      let speakTagIds = $("#uiSpeakDisplay input:checked").map(function() {
        return this.value;
      }).get().join();
      if (speakTagIds != "") {
        data = {"tag_ids": speakTagIds};
      }
      roundware.saveAsset(dataBlob,wavFileName,data);
    });
  });

  recorder.initStream();
}

function setupRecordingControls(saveCallback) {
  var record = $(".record");
  var stop = $(".stop");
  var soundClips = $('.sound-clips');

  // disable stop button while not recording
  stop.disabled = true;

  var constraints = { audio: true };
  var chunks = [];

  var onSuccess = function(stream) {
    visualize(stream);

    var mediaRecorder = new MediaRecorder(stream);

    record.click(function(evt) {
      mediaRecorder.start();
      console.log(mediaRecorder.state);
      console.log("recorder started");
      record.attr("style","background: red");

      stop.disabled = false;
      record.disabled = true;
    });

    stop.click(function(evt) {
      mediaRecorder.stop();
      console.log(mediaRecorder.state);
      console.log("recorder stopped");
      record.removeAttr("style");
      // mediaRecorder.requestData();

      stop.disabled = true;
      record.disabled = false;
    });

    mediaRecorder.onstop = function(e) {
      console.log("data available after MediaRecorder.stop() called.");

      var clipName = prompt('Enter a name for your sound clip?','My unnamed clip');
      var clipContainer = document.createElement('article');
      var clipLabel = document.createElement('p');
      var audio = document.createElement('audio');
      var deleteButton = document.createElement('button');
      var saveButton = document.createElement('button');

      clipContainer.classList.add('clip');
      audio.setAttribute('controls', '');
      deleteButton.textContent = 'Delete';
      deleteButton.className = 'delete';

      clipLabel.id = "clipLabel";
      saveButton.textContent = 'Save';
      saveButton.id = "saveBtn";

      if(clipName === null) {
        clipLabel.textContent = 'My unnamed clip';
      } else {
        clipLabel.textContent = clipName;
      }

      clipContainer.appendChild(audio);
      clipContainer.appendChild(clipLabel);
      clipContainer.appendChild(deleteButton);
      clipContainer.appendChild(saveButton);

      soundClips.append(clipContainer);

      audio.controls = true;
      let blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
      chunks = [];

      let audioURL = window.URL.createObjectURL(blob);
      audio.src = audioURL;
      console.log("recorder stopped");

      deleteButton.onclick = function(e) {
        evtTgt = e.target;
        evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode);
      };

      clipLabel = $(clipLabel);

      saveButton.onclick = function() {
        let fileName = clipLabel.text();
        let encoder = new WavAudioEncoder(audioCtx.sampleRate,1);
        let wavBlob = encoder.finish();
        
        saveCallback(wavBlob,fileName);
      };

      clipLabel.click = function() {
        var existingName = clipLabel.text();
        var newClipName = prompt('Enter a new name for your sound clip?');

        if (newClipName === null) {
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
