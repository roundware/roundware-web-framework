// local development
// var roundwareServerUrl = "http://localhost:8888/api/2";
// deployment

var roundwareServerUrl = "https://prod.roundware.com/api/2";
var roundwareProjectId = 10; // corresponds to a project setup in the Roundware server developer seed script

var roundware;
var streamPlayer, audioSource, pauseButton, playButton, killButton,
  skipButton, replayButton, tagIds, recordButton, setBrowserLocation;
var assetMarkers = [];
var listenMap, speakMap;
var firstplay = false; // ultimately will be set to true initially to handle iOS playback properly
var use_listener_range = false;
var listener_circle_max, listener_circle_min;



function startListening(streamURL) {
  console.info("Loading " + streamURL);
  audioSource.prop("src", streamURL);
  streamPlayer.trigger("load");
  listenLatitude.prop("disabled", false);
  listenLongitude.prop("disabled", false);
  updateButton.prop("disabled", false);
}

function play(streamURL) {
  roundware.play(startListening).
    then(function handleListening() {
      console.info("Playing audio");
      streamPlayer.trigger("play");
      pauseButton.prop("disabled", false);
      playButton.prop("disabled", true);
      killButton.prop("disabled", false);
      replayButton.prop("disabled", false);
      skipButton.prop("disabled", false);
    }).
    catch(handleError);
}

function pause() {
  console.info("pausing");
  streamPlayer.trigger("pause");
  pauseButton.prop("disabled", true);
  playButton.prop("disabled", false);
  replayButton.prop("disabled", true);
  skipButton.prop("disabled", true);
  roundware.pause();
}

function kill() {
  console.info("killing");
  streamPlayer.trigger("pause");
  pauseButton.prop("disabled", true);
  playButton.prop("disabled", false);
  killButton.prop("disabled", true);
  replayButton.prop("disabled", true);
  skipButton.prop("disabled", true);
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

function update(data = {}) {
  console.info("updating stream");
  let updateData = {};
  let listenTagIds = $("#uiListenDisplay input:checked").map(function () {
    return this.value;
  }).get().join();

  updateData.latitude = listenLatitude.val();
  updateData.longitude = listenLongitude.val();
  updateData.tagIds = listenTagIds;
  // handle any additional data params
  Object.keys(data).forEach(function (key) {
    updateData[key] = data[key];
  });
  console.log(updateData);
  roundware.update(updateData);
}

function ready() {
  console.info(`Connected to Roundware Server. Ready to play.`);

  playButton.prop("disabled", false);
  playButton.click(play);
  pauseButton.click(pause);
  killButton.click(kill);
  replayButton.click(replay);
  skipButton.click(skip);
  updateButton.click(update);

  displayListenTags();
  displaySpeakTags();
  setupListenMap();
  setupSpeakMap();

  // setup range listening toggle listener
  $('#isrange input:checkbox').change(
    function () {
      if ($(this).is(':checked')) {
        add_listener_range();
      } else {
        remove_listener_range();
      }
    }
  );
  console.log(roundware._assetData);
  console.log(`project recording radius = ${roundware._project.recordingRadius}`);
}

function displayListenTags() {
  console.log(roundware._uiConfig.listen);
  let listenUi = roundware._uiConfig.listen;
  $.each(listenUi, function (index, element) {
    console.log(index + ": " + element.header_display_text);
    let str = "";
    str += `<h4>${element.header_display_text}</h4>`;
    str += "<form>";
    $.each(element.display_items, function (index, element) {
      let checked = "";
      if (element.default_state) {
        checked = "checked";
      }
      str += `<input type="checkbox" value=${element.tag_id} ${checked}>${element.tag_display_text}<br>`;
    });
    str += "</form>";
    $('#uiListenDisplay').append(str);
  });

  // setup tag change listeners
  $('#uiListenDisplay input:checkbox').change(
    function () {
      update();
      showHideMarkers();
    });
}

function displaySpeakTags() {
  console.log(roundware._uiConfig.speak);
  let listenUi = roundware._uiConfig.speak;
  $.each(listenUi, function (index, element) {
    console.log(index + ": " + element.header_display_text);
    let str = "";
    str += `<h4>${element.header_display_text}</h4>`;
    str += "<form>";
    $.each(element.display_items, function (index, element) {
      let checked = "";
      if (element.default_state) {
        checked = "checked";
      }
      str += `<input type="checkbox" value=${element.tag_id} ${checked}>${element.tag_display_text}<br>`;
    });
    str += "</form>";
    $('#uiSpeakDisplay').append(str);
  });

  // setup tag change listeners
  $('#uiSpeakDisplay input:checkbox').change(
    function () {
      let speakTagIds = $("#uiSpeakDisplay input:checked").map(function () {
        return this.value;
      }).get().join();
      // update();
      console.log(`speak tags updated: ${speakTagIds}`);
    });
}

function mapSpeakers(map) {
  let speakers = roundware._speakerData;

  $.each(speakers, function (i, item) {
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
    map.data.setStyle(function (feature) {
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
  });
}

function mapAssets(map) {
  // console.log(roundware._assetData[0]);
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
      marker.shape.setStyle(function (feature) {
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
  $.each(assetMarkers, function (i, item) {
    // if any item tags are not included in selected tags, hide marker, otherwise show it
    let selectedListenTagIds = $("#uiListenDisplay input:checked").map(function () {
      return Number(this.value);
    }).get();
    var is_visible = true;
    $.each(item.rw_tags, function (j, tag_id) {
      // if tag_id isn't selected, set to false and return
      if (!(selectedListenTagIds.includes(tag_id))) {
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
        item.shape.setMap(listenMap);
      } else if (!is_visible) {
        item.shape.setMap(null);
      }
    }
  });
}

/**
 * Add editable circles centered on listener pin that define the listener_range
 * every time either circle is edited, a PATCH streams/ is sent with lat/lon and listener_range_min/max
 */
function add_listener_range() {
  use_listener_range = true;
  var mapCenter = new google.maps.LatLng(listenLatitude.val(),
    listenLongitude.val());
  listener_circle_max = new google.maps.Circle({
    strokeColor: '#000000',
    strokeOpacity: 0.4,
    strokeWeight: 1,
    fillColor: '#000000',
    fillOpacity: 0.08,
    map: listenMap,
    center: mapCenter,
    radius: roundware._project.recordingRadius * 100,
    editable: true,
    draggable: false,
    geodesic: true
  });
  listener_circle_min = new google.maps.Circle({
    strokeColor: '#000000',
    strokeOpacity: 0.4,
    strokeWeight: 1,
    fillColor: '#000000',
    fillOpacity: 0,
    map: listenMap,
    center: mapCenter,
    radius: roundware._project.recordingRadius * 50,
    editable: true,
    draggable: false,
    geodesic: true
  });
  listenMap.setCenter(mapCenter);

  google.maps.event.addListener(listener_circle_max, "radius_changed", function (event) {
    lr_max = Math.round(listener_circle_max.getRadius());
    lr_min = Math.round(listener_circle_min.getRadius());
    // ensure listener_range_max isn't smaller than listener_range_min
    if (lr_max < lr_min) {
      listener_circle_max.setRadius(lr_min);
      console.log("maximum range can't be smaller than minimum range!")
    }
    if (!firstplay) {
      var data = {
        "listener_range_max": lr_max,
        "listener_range_min": lr_min
      }
      update(data);
    }
    console.log("max range = " + lr_max);
  });
  google.maps.event.addListener(listener_circle_min, "radius_changed", function (event) {
    lr_min = Math.round(listener_circle_min.getRadius());
    lr_max = Math.round(listener_circle_max.getRadius());
    // ensure listener_range_min isn't larger than listener_range_max
    if (lr_min > lr_max) {
      listener_circle_min.setRadius(lr_max);
      console.log("minimum range can't be bigger than maximum range!")
    }
    if (!firstplay) {
      var data = {
        "listener_range_max": lr_max,
        "listener_range_min": lr_min
      }
      update(data);
    }
  });
}

function remove_listener_range() {
  use_listener_range = false;
  listener_circle_max.setMap(null);
  listener_circle_min.setMap(null);
}
// Generally we throw user-friendly messages and log a more technical message
function handleError(userErrMsg) {
  console.error("There was a Roundware Error: " + userErrMsg);
}

$(function startApp() {
  roundware = new Roundware(window, {
    serverUrl: roundwareServerUrl,
    projectId: roundwareProjectId,
    geoListenEnabled: true,
    // apply any speaker filters here
    speakerFilters: { "activeyn": true },
    // apply any asset filters here
    assetFilters: {
      "submitted": true,
      "media_type": "audio"
    }
  });

  // Listen elements
  streamPlayer = $("#streamplayer");
  audioSource = $("#audiosource");
  pauseButton = $("#pause");
  playButton = $("#play");
  killButton = $("#kill");
  replayButton = $("#replay");
  skipButton = $("#skip");
  listenLatitude = $("#listenLatitude");
  listenLongitude = $("#listenLongitude");
  updateButton = $("#update");

  // Speak elements
  setBrowserLocation = $("#setBrowserLocation");
  speakLatitude = $("#speakLatitude");
  speakLongitude = $("#speakLongitude");
  // recordButton       = $("#record");
  // startRecordButton  = $("#startRecordButton");

  roundware.connect().
    then(ready).
    catch(handleError);

  document.getElementById("initRecorder").addEventListener("click", function () {
    initRecording();
    startRecordButton.disabled = false;
    initRecorder.disabled = true;
  });

});

// Google Maps

function setupListenMap() {
  var initialLocation = {
    lat: roundware._project.location.latitude,
    lng: roundware._project.location.longitude
  };
  listenMap = new google.maps.Map(document.getElementById('listenMap'), {
    zoom: 16,
    center: initialLocation
  });
  var listener = new google.maps.Marker({
    position: initialLocation,
    map: listenMap,
    draggable: true
  });

  // setup geopositioning
  if (!navigator.geolocation) {
    console.log("no geolocation available for listening");
  }
  else {
    console.log("geolocation available");

    // on initial geoposition
    navigator.geolocation.getCurrentPosition(function (position) {
      initialLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      console.log(`initial browser determined position = ${initialLocation}`);
      console.log(initialLocation);
      var data = {};
      update(data);
    });

    // on geoposition update
    var watchID = navigator.geolocation.watchPosition(function (position) {
      var newPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      // // update listen map
      listenMap.setCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
      listener.setPosition(newPosition);
      document.getElementById("listenLatitude").value = listener.getPosition().lat();
      document.getElementById("listenLongitude").value = listener.getPosition().lng();
      var data = {};
      update(data);
    });
  }

  google.maps.event.addListener(listener, "dragend", function (event) {
    document.getElementById("listenLatitude").value = listener.getPosition().lat();
    document.getElementById("listenLongitude").value = listener.getPosition().lng();
    listenMap.setCenter(listener.getPosition());
    var data = {};
    if (use_listener_range === true) {
      listener_circle_max.setCenter(new google.maps.LatLng(listener.getPosition().lat(),
        listener.getPosition().lng()));
      listener_circle_min.setCenter(new google.maps.LatLng(listener.getPosition().lat(),
        listener.getPosition().lng()));
      data = {
        "listener_range_max": Math.round(listener_circle_max.getRadius()),
        "listener_range_min": Math.round(listener_circle_min.getRadius())
      }
    }
    update(data);
  });
  mapAssets(listenMap);
  mapSpeakers(listenMap);
  showHideMarkers();
}

function setupSpeakMap() {
  // TODO: change to location sensed by browser
  var initialLocation = {
    lat: roundware._project.location.latitude,
    lng: roundware._project.location.longitude
  };
  if (!navigator.geolocation) {
    console.log("no geolocation available for contributing");
  }
  else {
    console.log("geolocation available");

    // on initial geoposition
    navigator.geolocation.getCurrentPosition(function (position) {
      initialLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      console.log(`initial browser determined position = ${initialLocation}`);
      console.log(initialLocation);
      speakMap.setCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
      contributor.setPosition(initialLocation);
      document.getElementById("speakLatitude").value = contributor.getPosition().lat();
      document.getElementById("speakLongitude").value = contributor.getPosition().lng();
    });

    // on geoposition update
    var watchID = navigator.geolocation.watchPosition(function (position) {
      var newPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      // update speak map
      speakMap.setCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
      contributor.setPosition(newPosition);
      document.getElementById("speakLatitude").value = contributor.getPosition().lat();
      document.getElementById("speakLongitude").value = contributor.getPosition().lng();
    });
  }

  speakMap = new google.maps.Map(document.getElementById('speakMap'), {
    zoom: 16,
    center: initialLocation
  });
  var contributor = new google.maps.Marker({
    position: initialLocation,
    map: speakMap,
    draggable: true
  });
  google.maps.event.addListener(contributor, "dragend", function (event) {
    document.getElementById("speakLatitude").value = contributor.getPosition().lat();
    document.getElementById("speakLongitude").value = contributor.getPosition().lng();
    speakMap.setCenter(contributor.getPosition());
  });

  // element.addEventListener("click", function(){ alert("Hello World!"); });
  document.getElementById("setBrowserLocation").addEventListener("click", function () {
    console.log("setting browser location in map");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        console.log("current browser position determined");
        speakMap.setCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
        var newPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        contributor.setPosition(newPosition);
        document.getElementById("speakLatitude").value = contributor.getPosition().lat();
        document.getElementById("speakLongitude").value = contributor.getPosition().lng();
      });
    } else {
      console.log("no location available");
    }
  });
}
