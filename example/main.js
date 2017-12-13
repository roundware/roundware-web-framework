var roundwareServerUrl = "http://localhost:8888/api/2";
var roundwareProjectId = 1; // corresponds to a project setup in the Roundware server developer seed script

var roundware;
var streamPlayer, audioSource, pauseButton, playButton, killButton, tagIds;

function startListening(streamURL) {
  console.info("Loading " + streamURL);
  audioSource.prop("src",streamURL);
  streamPlayer.trigger("load");
  tagIds.prop("disabled",false);
  latitude.prop("disabled",false);
  longitude.prop("disabled",false);
  updateButton.prop("disabled",false);
}

function play(streamURL) {
  roundware.play(startListening).
    then(function handleListening() {
      console.info("Playing audio");
      streamPlayer.trigger("play");
      pauseButton.prop("disabled",false);
      playButton.prop("disabled",true);
      killButton.prop("disabled",false);
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

function kill() {
  console.info("killing");
  streamPlayer.trigger("pause");
  pauseButton.prop("disabled",true);
  playButton.prop("disabled",false);
  killButton.prop("disabled",true);
  roundware.kill();
}

function update() {
  console.info("updating stream");
  let updateData = {};
  updateData.latitude = latitude.val();
  updateData.longitude = longitude.val();
  updateData.tagIds = tagIds.val();
  console.log(updateData);
  roundware.update(updateData);
}

function handleTagInput(evt) {
  roundware.tags(tagIds.val().join(","));
}

function ready() {
  console.info("Connected to Roundware Server. Ready to play.");

  playButton.prop("disabled",false);
  playButton.click(play);
  pauseButton.click(pause);
  killButton.click(kill);
  updateButton.click(update);

  // tagIds.change(handleTagInput);

}

// Generally we throw user-friendly messages and log a more technical message
function handleError(userErrMsg) {
  console.error("There was a Roundware Error: " + userErrMsg);
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
  killButton   = $("#kill");
  tagIds       = $("#tag_ids");
  latitude     = $("#latitude");
  longitude    = $("#longitude");
  updateButton = $("#update");

  roundware.connect().
    then(ready).
    catch(handleError);
  initMap();
});

// Google Maps

function initMap() {
  var initialLocation = {lat: 1, lng: 1};
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 4,
    center: initialLocation
  });
  var listener = new google.maps.Marker({
    position: initialLocation,
    map: map,
    draggable: true
  });
  google.maps.event.addListener(listener, "dragend", function(event) {
      document.getElementById("latitude").value = listener.getPosition().lat();
      document.getElementById("longitude").value = listener.getPosition().lng();
      map.setCenter(listener.getPosition());
      update();
  });
}
