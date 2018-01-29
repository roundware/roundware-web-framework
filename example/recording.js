var microphone;

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

  recorder.addEventListener( "stop", function(e){
    console.log('Recorder is stopped');
    stopRecordButton.disabled = startRecordButton.disabled = true;
    microphone.stop();
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
