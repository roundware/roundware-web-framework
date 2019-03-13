var MicrophonePlugin;
var wavesurferInput;
var time_remaining = 0;
var time_remaining_interval_id = -1;

function initRecording() {
  var recorder;

  // startRecordButton.addEventListener( "click", function(){ recorder.start(); });
  // for future reference, if anything needs to be triggered post-recorder init, do this:
  startRecordButton.addEventListener( "click", function(){
    console.log("bowser available in recording.js");
    if (bowser.ios && bowser.safari) {
      console.log("you are using mobile safari, disable level meter visualization.");
      recorder.start();
    } else {
      console.log("you are NOT using mobile safari.");
      recorder.start().then(() => visualize());
    }
  });
  stopRecordButton.addEventListener( "click", function(){ recorder.stop(); });

  if (!Recorder.isRecordingSupported()) {
    console.log("Recording features are not supported in your browser.");
  }

  recorder = new Recorder({
    monitorGain: 0,
    // numberOfChannels: parseInt(numberOfChannels.value, 10),
    // wavBitDepth: parseInt(bitDepth.value,10),
    encoderPath: "waveWorker.min.js"
  });

  recorder.onstart = function(){
    console.log('Recorder is started');
    startRecordButton.disabled = true;
    stopRecordButton.disabled = false;
    uploadButton.disabled = false;
    startCountdown();
  };

  recorder.onstop = function(){
    console.log('Recorder is stopped');
    stopRecordButton.disabled = true
    wavesurferInput.microphone.stop();
    resetCountdown();
  };

  recorder.onstreamerror = function(e){
    console.log('Error encountered: ' + e.error.name );
  };

  recorder.ondataavailable = function( typedArray ){
    uploadButton.disabled = false;
    playbackButton.disabled = false;
    var dataBlob = new Blob( [typedArray], { type: 'audio/wav' } );
    var wavFileName = new Date().toISOString() + ".wav";
    var url = URL.createObjectURL( dataBlob );
    var TimelinePlugin = window.WaveSurfer.timeline;

    // display waveform with wavesurfer.js
    var wavesurfer = WaveSurfer.create({
      container: '#waveform',
      waveColor: 'red',
      progressColor: 'purple',
      barWidth: 2,
      plugins: [
        TimelinePlugin.create({
            container: '#waveform-timeline'
        })
      ]
    });
    wavesurfer.load(url);
    wavesurfer.on('ready', function () {
      // var timeline = Object.create(WaveSurfer.Timeline);
      // timeline.init({
      //   wavesurfer: wavesurfer,
      //   container: '#waveform-timeline'
      // });
      console.log("wavesurfer ready to display waveform");
    });
    playbackButton.addEventListener( "click", function(){
      wavesurfer.playPause();
    });

    uploadButton.addEventListener( "click", function(){
      uploadButton.disabled = true;
      let data = {};
      let speakTagIds = $("#uiSpeakDisplay input:checked").map(function() {
        return this.value;
      }).get().join();
      if (speakTagIds != "") {
        data = {"tag_ids": speakTagIds, "latitude": document.getElementById("speakLatitude").value, "longitude": document.getElementById("speakLongitude").value};
      } else {
        data = {"latitude": document.getElementById("speakLatitude").value, "longitude": document.getElementById("speakLongitude").value};
      }
      roundware.saveAsset(dataBlob,wavFileName,data).then(function(data) {
        console.log("asset uploaded!" + data);
      });
    });
  };
  // visualize();
}

// input meter visual display
function visualize() {
  console.log("visualizing!");

  wavesurferInput = WaveSurfer.create({
    container: '#inputmeter',
    waveColor: 'red',
    height: 200,
    barWidth: 2,
    barHeight: 1.2,
    cursorWidth: 0,
    plugins: [
      WaveSurfer.microphone.create()
    ]
  });
  // MicrophonePlugin.play;
  console.log(wavesurferInput);
  // microphone = Object.create(WaveSurfer.Microphone);
  // microphone.init({
  //   wavesurfer: wavesurferInput
  // });
  wavesurferInput.microphone.on('deviceReady', function(stream) {
      console.log('Device ready!', stream);
  });
  wavesurferInput.microphone.on('deviceError', function(code) {
      console.warn('Device error: ' + code);
  });
  wavesurferInput.microphone.start();
  // // MicrophonePlugin.on('deviceReady', function(stream) {
  // MicrophonePlugin.deviceReady = function(stream){
  //
  //   console.log('Microphone ready!', stream);
  // };
  // // MicrophonePlugin.on('deviceError', function(code) {
  // MicrophonePlugin.deviceError = function(code){
  //   console.log('Microphone error: ' + code);
  // };
}

/**
 * read max_recording_length from the project config and then use it
 * to display a countdown-timer.
 */
function startCountdown() {
  time_remaining = roundware._project.maxRecordingLength;
  var minutes = Math.floor(time_remaining / 60);
  var seconds = time_remaining % 60;
  // console.log( hours +':'+ ('0'+minutes).slice(-2) +':'+ ('0'+seconds).slice(-2) );
  $('#countdown').text(minutes + ':' + ('0'+seconds).slice(-2)).css( "visibility", "visible");
  time_remaining_interval_id = setInterval(updateCountdown, 1000, time_remaining);
}

/**
 * callback for startCountdown: update the countdown timer until it reaches
 * 0, then clear the interval timer and trigger a click on the record/stop/play
 * button.
 */
function updateCountdown(seconds) {
  time_remaining = --time_remaining;
  var minutes = Math.floor(time_remaining / 60);
  var seconds = time_remaining % 60;
  $('#countdown').text(minutes + ':' + ('0'+seconds).slice(-2));

  if (0 == time_remaining) {
      clearInterval(time_remaining_interval_id);
      $('#stopRecordButton').trigger('click');
  }
}

// reset counter to max recording length

function resetCountdown() {
  var minutes = Math.floor(roundware._project.maxRecordingLength / 60);
  var seconds = roundware._project.maxRecordingLength % 60;
  $('#countdown').text(minutes + ':' + ('0'+seconds).slice(-2));
  clearInterval(time_remaining_interval_id);
}
