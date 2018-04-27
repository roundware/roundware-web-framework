var microphone;
var time_remaining = 0;
var time_remaining_interval_id = -1;

function initRecording() {
  var recorder;

  startRecordButton.addEventListener( "click", function(){ recorder.start(); });
  stopRecordButton.addEventListener( "click", function(){ recorder.stop(); });
  // uploadButton.addEventListener( "click", function(){ recorder.stop(); });

  if (!Recorder.isRecordingSupported()) {
    console.log("Recording features are not supported in your browser.");
  }

  recorder = new Recorder({
    monitorGain: 0,
    // numberOfChannels: parseInt(numberOfChannels.value, 10),
    // wavBitDepth: parseInt(bitDepth.value,10),
    encoderPath: "waveWorker.min.js"
  });

  recorder.addEventListener( "start", function(e){
    console.log('Recorder is started');
    startRecordButton.disabled = true;
    stopRecordButton.disabled = false;
    microphone.start();
  });
    startCountdown();

  recorder.addEventListener( "stop", function(e){
    console.log('Recorder is stopped');
    stopRecordButton.disabled = startRecordButton.disabled = true;
    microphone.stop();
  });
    resetCountdown();

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
    playbackButton.disabled = false;
    var dataBlob = new Blob( [e.detail], { type: 'audio/wav' } );
    var wavFileName = new Date().toISOString() + ".wav";
    var url = URL.createObjectURL( dataBlob );

    // display waveform with wavesurfer.js
    var wavesurfer = WaveSurfer.create({
      container: '#waveform',
      waveColor: 'red',
      progressColor: 'purple',
      barWidth: 2
    });
    wavesurfer.load(url);
    wavesurfer.on('ready', function () {
      var timeline = Object.create(WaveSurfer.Timeline);
      timeline.init({
        wavesurfer: wavesurfer,
        container: '#waveform-timeline'
      });
    });
    playbackButton.addEventListener( "click", function(){
      wavesurfer.playPause();
    });

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

  recorder.initStream().
    then((stream) => visualize(stream));
}

function visualize(stream) {
  // input meter visual display
  var wavesurferInput = WaveSurfer.create({
    container: '#inputmeter',
    waveColor: 'red',
    height: 200,
    barWidth: 2,
    barHeight: 1.2,
    cursorWidth: 0
  });
  microphone = Object.create(WaveSurfer.Microphone);
  microphone.init({
    wavesurfer: wavesurferInput
  });
  microphone.on('deviceReady', function(stream) {
    console.log('Microphone ready!', stream);
  });
  microphone.on('deviceError', function(code) {
    console.warn('Microphone error: ' + code);
  });
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
