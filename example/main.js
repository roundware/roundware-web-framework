var roundwareServerUrl = "http://localhost:8888/api/2";
var roundwareProjectId = 1; // corresponds to a project setup in the Roundware server developer seed script

var roundware;
var streamPlayer, audioSource, pauseButton, playButton, killButton,
    skipButton, replayButton, tagIds;
var assetMarkers = [];
var map;

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
      replayButton.prop("disabled",false);
      skipButton.prop("disabled",false);
    }).
    catch(handleError);
}

function pause() {
  console.info("pausing");
  streamPlayer.trigger("pause");
  pauseButton.prop("disabled",true);
  playButton.prop("disabled",false);
  replayButton.prop("disabled",true);
  skipButton.prop("disabled",true);
  roundware.pause();
}

function kill() {
  console.info("killing");
  streamPlayer.trigger("pause");
  pauseButton.prop("disabled",true);
  playButton.prop("disabled",false);
  killButton.prop("disabled",true);
  replayButton.prop("disabled",true);
  skipButton.prop("disabled",true);
  roundware.kill();
}

function replay() {
  console.log("replaying");
  roundware.replay();
}

function skip() {
  console.log("skipping");
  roundware.skip();
}

function update() {
  console.info("updating stream");
  let updateData = {};
  let tagIds = $("#uiDisplay input:checked").map(function() {
    return this.value;
  }).get().join();

  updateData.latitude = latitude.val();
  updateData.longitude = longitude.val();
  updateData.tagIds = tagIds;
  console.log(updateData);
  roundware.update(updateData);
}

function ready() {
  console.info("Connected to Roundware Server. Ready to play.");

  playButton.prop("disabled",false);
  playButton.click(play);
  pauseButton.click(pause);
  killButton.click(kill);
  replayButton.click(replay);
  skipButton.click(skip);
  updateButton.click(update);

  displayTags();
  setupMap();
  console.log(roundware._assetData);
  console.log(`project recording radius = ${roundware._project.recordingRadius}`);
}

function displayTags() {
  console.log(roundware._uiConfig.listen);
  let listenUi = roundware._uiConfig.listen;
  $.each(listenUi, function(index,element) {
    console.log(index + ": " + element.header_display_text);
    let str = "";
    str += `<h4>${element.header_display_text}</h4>`;
    str += "<form>";
    $.each(element.display_items, function(index,element) {
      let checked = "";
      if (element.default_state) {
        checked = "checked";
      }
      str += `<input type="checkbox" value=${element.tag_id} ${checked}>${element.tag_display_text}<br>`;
    });
    str += "</form>";
    $('#uiDisplay').append(str);
  });

  // setup tag change listeners
  $('#uiDisplay input:checkbox').change(
    function() {
      update();
      showHideMarkers();
    });
}

function mapSpeakers(map) {
  let speakers = roundware._speakerData;

  $.each(speakers, function (i, item) {
    if (item.activeyn == true) {
      map.data.addGeoJson({
        "type": "Feature",
        "geometry": item.shape,
        "properties": {
          "speaker_id": item.id,
          "name": "outer"
        }
      });
      map.data.addGeoJson({
        "type": "Feature",
        "geometry": item.attenuation_border,
        "properties": {
          "speaker_id": item.id,
          "name": "inner"
        }
      });
      map.data.setStyle(function(feature) {
        if (feature.getProperty('name') == "outer") {
          return {
            fillColor: '#aaaaaa',
            fillOpacity: .5,
            strokeWeight: 1,
            strokeOpacity: .5
          };
        }
        else if (feature.getProperty('name') == "inner") {
          return {
            fillColor: '#555555',
            fillOpacity: 0,
            strokeWeight: 1,
            strokeOpacity: .2
          };
        }
      });
    }
  });
}

function mapAssets(map) {
  console.log(roundware._assetData[0]);
  let assets = roundware._assetData;

  $.each(assets, function (i, item) {
    var marker_img = new google.maps.MarkerImage('https://www.google.com/intl/en_us/mapfiles/ms/micons/yellow-dot.png');
    var point = new google.maps.LatLng(item.latitude, item.longitude);
    // var tag_ids = item.tag_ids.toString();
    // console.log('tag_ids = ' + tag_ids);

    var marker = new google.maps.Marker({
    position: point,
    map: map,
    icon: marker_img
    });
    marker.id = item.id;
    marker.rw_tags = [];
    if (item.tag_ids) {
    marker.rw_tags = item.tag_ids;
    }
    // display asset shape if exists
    if (item.shape) {
    console.log("map the asset's shape");
    marker.shape = new google.maps.Data();
    marker.shape.addGeoJson({
      "type": "Feature",
      "geometry": item.shape,
      "properties": {
        "asset_id": item.id,
        "name": "assetRange"
      }
    });
    marker.shape.setStyle(function(feature) {
      if (feature.getProperty('name') == "assetRange") {
        return {
          fillColor: '#6292CF',
          fillOpacity: .25,
          strokeWeight: 1,
          strokeOpacity: .8,
          strokeColor: '#6292CF'
        };
      }
    });
    }
    // if no asset shape, display default circle range
    else {
    var circle = {
      strokeColor: '#6292CF',
      strokeOpacity: 0.8,
      strokeWeight: 1,
      fillColor: '#6292CF',
      fillOpacity: 0.25,
      map: map,
      center: new google.maps.LatLng(item.latitude, item.longitude),
      radius: roundware._project.recordingRadius
    };
    marker.circle = new google.maps.Circle(circle);
    }
    assetMarkers.push(marker);
    });
}

function showHideMarkers() {
  $.each(assetMarkers, function(i, item) {
    // if any item tags are not included in selected tags, hide marker, otherwise show it
    let selectedTagIds = $("#uiDisplay input:checked").map(function() {
      return Number(this.value);
    }).get();
	var is_visible = true;
	$.each(item.rw_tags, function(j, tag_id) {
      // if tag_id isn't selected, set to false and return
      if (!(selectedTagIds.includes(tag_id))) {
        is_visible = false;
	    return;
	  }
	});
	item.setVisible(is_visible);
    if (item.circle) {
      item.circle.setVisible(is_visible);
    }
    if (item.shape) {
      if (is_visible) {
        item.shape.setMap(map);
      } else if (!is_visible) {
        item.shape.setMap(null);
      }
    }
  });
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
  replayButton = $("#replay");
  skipButton   = $("#skip");
  tagIds       = $("#tag_ids");
  latitude     = $("#latitude");
  longitude    = $("#longitude");
  updateButton = $("#update");

  roundware.connect().
    then(ready).
    catch(handleError);
});

// Google Maps

function setupMap() {
  var initialLocation = {lat: roundware._project.location.latitude,
                         lng: roundware._project.location.longitude};
  map = new google.maps.Map(document.getElementById('map'), {
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
  mapAssets(map);
  mapSpeakers(map);
  showHideMarkers();

}
