var roundwareServerUrl = "http://localhost:8888/api/2";
var roundwareProjectId = 1; // corresponds to a project setup in the roundware server developer seed script

var roundware = new Roundware({
  serverUrl: roundwareServerUrl,
  projectId: roundwareProjectId
});

var streamPlayer, audioSource, pauseButton, playButton, tagIds;

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
  console.error("Roundware Error: " + userErrMsg);
}

$(function startApp() {
  streamPlayer = $("#streamplayer");
  audioSource  = $("#audiosource");
  pauseButton  = $("#pause");
  playButton  = $("#play");
  tagIds = $("#tag_ids");

  roundware.connect().
    then(ready).
    catch(handleError);
});
