/* global $, google, Roundware, turf */

const ROUNDWARE_SERVER_URL = 'https://prod.roundware.com/api/2';

//const ROUNDWARE_SERVER_URL = 'https://simw.roundware.com/api/2';
//const ROUNDWARE_DEFAULT_PROJECT_ID = 9;
//const ROUNDWARE_INITIAL_LATITUDE=39.22101;
//const ROUNDWARE_INITIAL_LONGITUDE=-85.897893;

//const ROUNDWARE_DEFAULT_PROJECT_ID = 10;
//const ROUNDWARE_INITIAL_LATITUDE = 42.337060559285234;
//const ROUNDWARE_INITIAL_LONGITUDE = -71.09792028045655;

//const ROUNDWARE_DEFAULT_PROJECT_ID = 1;
//const ROUNDWARE_INITIAL_LATITUDE = 41.0408653367726; 
//const ROUNDWARE_INITIAL_LONGITUDE = -73.22926793670655;

const ROUNDWARE_DEFAULT_PROJECT_ID = 27;
//const ROUNDWARE_INITIAL_LATITUDE = 33.86878099505993;
//const ROUNDWARE_INITIAL_LONGITUDE = -118.71928792609322;
const ROUNDWARE_INITIAL_LATITUDE = 34.02233;
const ROUNDWARE_INITIAL_LONGITUDE = -118.286364;

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

const MARKER_IMG_SRC = 'https://www.google.com/intl/en_us/mapfiles/ms/micons/yellow-dot.png';

function mapAssets(map,listener,roundware) {
  const assets = roundware.assets();
  const assetMarkers = [];
  const markerImg = new google.maps.MarkerImage(MARKER_IMG_SRC);

  $.each(assets, function (i, item) {
    const point = new google.maps.LatLng(item.latitude,item.longitude);
    // var tag_ids = item.tag_ids.toString();
    // console.log('tag_ids = ' + tag_ids);

    const marker = new google.maps.Marker({
      position: point,
      map: map,
      icon: markerImg
    });

    marker.id = item.id;
    marker.rw_tags = [];

    if (item.tag_ids) {
      marker.rw_tags = item.tag_ids;
    }

    const content = `<p><b>Asset ${item.id}</b></br>
                     <em>${item.file}</em></br></p>
                     <table>
                      <tr><th>Volume</th><td>${item.volume}</td></tr>
                      <tr><th>Created</th><td>${item.created.slice(0,19)}</td></tr>
                      <tr><th>Weight</th><td>${item.weight}</td></tr>
                      <tr><th>Tags</th><td>${item.tag_ids}</td></tr>
                      </table>`;

    const infoWindow = new google.maps.InfoWindow({ content });

    marker.addListener('click', function() {
      infoWindow.open(map,marker);

      let longitude = marker.position.lng();
      let latitude = marker.position.lat();

      const assetLocationPoint = turf.point([longitude,latitude]);

      longitude = listener.position.lng();
      latitude = listener.position.lat();

      const listenerLocationPoint = turf.point([longitude,latitude]);

      const dist = turf.distance(listenerLocationPoint,assetLocationPoint,{ units: 'meters' });

      console.info(`Asset ${marker.id}: ${dist} meters from listener`,{ 
        assetLocationPoint: assetLocationPoint.geometry.coordinates, 
        listenerLocationPoint: listenerLocationPoint.geometry.coordinates 
      });
    });

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
    } else {
      // if no asset shape, display default circle range
      const circle = { 
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

const drawListeningCircle = (map,center,radius) => (
  new google.maps.Circle({
    strokeColor: '#FF0000',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#FF0000',
    fillOpacity: 0.35,
    map,
    center,
    radius
  })
);

// This function is intended to be invoked by the google API callback; see index.html
/* eslint-disable-next-line no-unused-vars */
function initDemo() { 
  const googleMapsCenter = { 
    lat: ROUNDWARE_INITIAL_LATITUDE,
    lng: ROUNDWARE_INITIAL_LONGITUDE
  };

  const listenerLocation = { 
    latitude: ROUNDWARE_INITIAL_LATITUDE,
    longitude: ROUNDWARE_INITIAL_LONGITUDE
  };

  const listenMapEl = document.getElementById('mixMap');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const transportBtn = document.getElementById('transportBtn');

  const map = new google.maps.Map(listenMapEl,{
    zoom: 18,
    center: googleMapsCenter
  });

  const listener = new google.maps.Marker({
    position: googleMapsCenter,
    map,
    draggable: true
  });

  const roundware = new Roundware(window,{
    serverUrl: ROUNDWARE_SERVER_URL,
    projectId: ROUNDWARE_DEFAULT_PROJECT_ID,
    geoListenEnabled: true,
    speakerFilters: { activeyn: true },
    assetFilters:   { submitted: true, media_type: "audio" },
    listenerLocation
  });

  function updateMap(listenerLocation,recordingRadius) {
    const position = {
      lat: listenerLocation.latitude,
      lng: listenerLocation.longitude
    };

    map.setCenter(position);
        
    return drawListeningCircle(map,position,recordingRadius);
  }

  roundware.
    connect().
    then(() => {
      mapSpeakers(map,roundware);

      const assetMarkers = mapAssets(map,listener,roundware);
      showHideMarkers(assetMarkers);

      const { recordingRadius = 25 } = roundware.mixParams;

      let listeningCircle = drawListeningCircle(map,googleMapsCenter,recordingRadius);

      const mixer = roundware.activateMixer();

      google.maps.event.addListener(listener,"dragend",() => {
        const position = listener.getPosition();
        const latitude = position.lat();
        const longitude = position.lng();

        roundware.updateLocation({ latitude, longitude });
      });

      roundware.onUpdateLocation = listenerLocation => {
        //console.info("updating map",{ listenerLocation });
        listeningCircle.setMap(null);
        listeningCircle = updateMap(listenerLocation,recordingRadius);
      };

      playPauseBtn.addEventListener('click',() => {
        const isPlaying = mixer.toggle();
        playPauseBtn.textContent = isPlaying ? 'Pause' : 'Play';
      });

      transportBtn.addEventListener('click',() => {
        roundware.updateLocation({
          latitude: ROUNDWARE_INITIAL_LATITUDE,
          longitude: ROUNDWARE_INITIAL_LONGITUDE
        });

        transportBtn.remove();
      },{ once: true });

      const tagDiv = document.getElementById("tagSelection");

      roundware.getTags().then(tagData => {
        tagData.forEach(tag => {
          const newCheckbox = document.createElement("input"); 

          const checkboxId = `tag_checkbox_${tag.id}`;

          newCheckbox.id = checkboxId;
          newCheckbox.type = 'checkbox';
          newCheckbox.name = 'tags';
          newCheckbox.value = tag.id;

          const newLabel = document.createElement('label');
          newLabel.appendChild(newCheckbox);
          const labelContent = document.createTextNode(tag.value);
          newLabel.appendChild(labelContent);  

          tagDiv.appendChild(newLabel);
        });
      });

      playPauseBtn.style.display = 'block';
      transportBtn.style.display = 'block';

      tagDiv.addEventListener('input',() => {
        const listenTagIds = [...document.querySelectorAll('[name=tags]:checked')].map(tag => tag.value);
        mixer.updateParams({ listenTagIds });
      });

      $('#loadingIndicator').remove();
      $('#instructions').show();
    }).
    catch(err => console.log('Roundware connection error',err));
}

const currentUrl = new URL(window.location);
const params = new URLSearchParams(currentUrl.search);
const googleMapsApiKey = params.get('mapsApiKey') || '';

const scriptTag = document.createElement('script');
scriptTag.src = `https://maps.googleapis.com/maps/api/js?callback=initDemo&key=${googleMapsApiKey}`;

document.body.appendChild(scriptTag);
