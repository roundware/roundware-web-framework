/* global $, google, Roundware */
const ROUNDWARE_SERVER_URL = 'https://prod.roundware.com/api/2';

//const ROUNDWARE_SERVER_URL = 'https://simw.roundware.com/api/2';
//const ROUNDWARE_DEFAULT_PROJECT_ID = 9;
//const ROUNDWARE_INITIAL_LATITUDE=39.22101;
//const ROUNDWARE_INITIAL_LONGITUDE=-85.897893;

//const ROUNDWARE_DEFAULT_PROJECT_ID = 10;
//const ROUNDWARE_INITIAL_LATITUDE = 42.337060559285234;
//const ROUNDWARE_INITIAL_LONGITUDE = -71.09792028045655;

const ROUNDWARE_DEFAULT_PROJECT_ID = 1;
const ROUNDWARE_INITIAL_LATITUDE = 41.0408653367726; 
const ROUNDWARE_INITIAL_LONGITUDE = -73.22926793670655;

function mapSpeakers(map,roundware) {
  const speakers = roundware.speakers();

  $.each(speakers,function (i, item) {
    map.data.addGeoJson({
      "type": "Feature",
      "geometry": item.shape,
      "properties": {
        "speaker_id": item.id,
        "title": "outer"
      }
    });

    map.data.addGeoJson({
      "type": "Feature",
      "geometry": item.attenuation_border,
      "properties": {
        "speaker_id": item.id,
        "title": "inner"
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
  });
}

function mapAssets(map,roundware) {
  const assets = roundware.assets();
  const assetMarkers = [];

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

  return assetMarkers;
}

function showHideMarkers(map,assetMarkers) {
  $.each(assetMarkers,function(i,item) {
    // if any item tags are not included in selected tags, hide marker, otherwise show it
    let selectedListenTagIds = $("#uiListenDisplay input:checked").map(function() {
      return Number(this.value);
    }).get();
    var is_visible = true;

    $.each(item.rw_tags, function(j, tag_id) {
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
        item.shape.setMap(map);
      } else if (!is_visible) {
        item.shape.setMap(null);
      }
    }
  });
}

// This function is intended to be invoked by the google API callback; see index.html
/* eslint-disable-next-line no-unused-vars */
function initDemo() { 
  const center = { 
    lat: ROUNDWARE_INITIAL_LATITUDE,
    lng: ROUNDWARE_INITIAL_LONGITUDE
  };

  const listenMapEl = document.getElementById('mixMap');
  const playPauseBtn = document.getElementById('playPauseBtn');

  const map = new google.maps.Map(listenMapEl,{
    zoom: 9,
    center
  });

  const listener = new google.maps.Marker({
    position: center,
    map,
    draggable: true
  });

  const roundware = new Roundware(window,{
    serverUrl: ROUNDWARE_SERVER_URL,
    projectId: ROUNDWARE_DEFAULT_PROJECT_ID,
    geoListenEnabled: true,
    speakerFilters: { activeyn: true },
    assetFilters:   { submitted: true, media_type: "audio" }
  });

  roundware.
    connect().
    then(() => console.log('Roundware connected')).
    then(() => {
      mapSpeakers(map,roundware);

      const assetMarkers = mapAssets(map,roundware);
      showHideMarkers(assetMarkers);

      const mixer = roundware.activateMixer({ 
        startingListenerCoordinates: {
          latitude: ROUNDWARE_INITIAL_LATITUDE,
          longitude: ROUNDWARE_INITIAL_LONGITUDE
        }
      });

      google.maps.event.addListener(listener, "dragend",() => {
        const position = listener.getPosition();
        map.setCenter(position);
        
        const latitude = position.lat();
        const longitude = position.lng();

        console.log('Position change',{ latitude, longitude });
        mixer.updatePosition({ latitude, longitude });
      });

      playPauseBtn.addEventListener('click',() => {
        const isPlaying = mixer.toggle();
        playPauseBtn.textContent = isPlaying ? 'Pause' : 'Play';
      });

      playPauseBtn.disabled = false;
    }).
    catch(err => console.log('Roundware connection error',err));
}
