/* global google, Roundware */

// TODO: eventually should get this stuff from dotenv file
const ROUNDWARE_SERVER_URL = 'https://prod.roundware.com/api/2';
const ROUNDWARE_DEFAULT_PROJECT_ID = 27;
const ROUNDWARE_INITIAL_LATITUDE = 34.02233;
const ROUNDWARE_INITIAL_LONGITUDE = -118.286364;

//http://en.wikipedia.org/wiki/Haversine_formula
//http://www.movable-type.co.uk/scripts/latlong.html

/**
 * Calculates the distance between two {@link Point|points} in degress, radians,
 * miles, or kilometers. This uses the [Haversine formula](http://en.wikipedia.org/wiki/Haversine_formula)
 * to account for global curvature. 
 *
 * Modified from https://github.com/Turfjs/turf-distance/blob/a79f9dcc4402e0244fbcd3b7f36d9b361d9032bf/index.js */
function distance(coordinates1,coordinates2) {
  const dLat = toRad(coordinates2[1] - coordinates1[1]);
  const dLon = toRad(coordinates2[0] - coordinates1[0]);
  const lat1 = toRad(coordinates1[1]);
  const lat2 = toRad(coordinates2[1]);

  const a = Math.pow(Math.sin(dLat/2), 2) +
            Math.pow(Math.sin(dLon/2), 2) * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  const distanceInKm = 6373 * c;
  return distanceInKm;
}

function toRad(degree) {
  return degree * Math.PI / 180;
}

function mapSpeakers(map,roundware) {
  const speakers = roundware.speakers();

  speakers.forEach(item => {
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

  assets.forEach(item => {
    const point = new google.maps.LatLng(item.latitude,item.longitude);

    const marker = new google.maps.Marker({
      map,
      position: point,
      icon: markerImg
    });

    marker.id = item.id;
    marker.rw_tags = [];

    if (item.tag_ids) {
      marker.rw_tags = item.tag_ids;
    }

    const { id: itemId, file, volume, created = '', weight, tag_ids } = item;

    const content = `
    <p><b>Asset ${itemId}</b></br>
    <em>${file}</em></br></p>
    <table>
      <tr><th>Volume</th><td>${volume}</td></tr>
      <tr><th>Created</th><td>${created.slice(0,19)}</td></tr>
      <tr><th>Weight</th><td>${weight}</td></tr>
      <tr><th>Tags</th><td>${tag_ids}</td></tr>
    </table>`;

    const infoWindow = new google.maps.InfoWindow({ content });

    marker.addListener('click', function() {
      infoWindow.open(map,marker);

      const assetLocationPoint = [
        marker.position.lng(),
        marker.position.lat()
      ];

      const listenerLocationPoint = [
        listener.position.lng(),
        listener.position.lat()
      ];

      const dist = distance(listenerLocationPoint,assetLocationPoint);

      console.info(`Asset #${marker.id}: ${dist.toFixed(1)}m from listener`);
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

      marker.shape.setStyle(feature => {
        if (feature.getProperty('name') === "assetRange") {
          return {
            fillColor: '#6292CF',
            fillOpacity: .25,
            strokeWeight: 1,
            strokeOpacity: .8,
            strokeColor: '#6292CF'
          };
        } else {
          return {};
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
  assetMarkers.forEach(item => {
    // if any item tags are not included in selected tags, hide marker, otherwise show it
    //const selectedListenTagIds = $("#uiListenDisplay input:checked").map(function() {
      //return Number(this.value);
    //}).get();

    //let is_visible = true;

    //const { rw_tags = [] } = item;

    //rw_tags.forEach((j,tag_id) =>{
    //// if tag_id isn't selected, set to false and return
    //if (!(selectedListenTagIds.includes(tag_id))) {
    //is_visible = false;
    //return;
    //}
    //});

    const is_visible = true;

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
    then(({ uiConfig }) => {
      mapSpeakers(map,roundware);

      const assetMarkers = mapAssets(map,listener,roundware);
      showHideMarkers(map,assetMarkers);

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

      const { listen: listenTags } = uiConfig;

      listenTags.forEach(tag => {
        const { header_display_text, display_items } = tag;

        tagDiv.insertAdjacentHTML('afterbegin',`<h2>${header_display_text}</h2>`);

        const checkboxEls = display_items.map(item => {
          const { tag_id,  tag_display_text, default_state } = item;
          const checkedAttrib = default_state ? 'checked' : '';

          return `
          <label>
            <input id='tag_checkbox_${tag_id}' type='checkbox' name='tags' value='${tag_id}' ${checkedAttrib} />
            ${tag_display_text} (#${tag_id})
          </label>
          <br/>
          `;
        });

        tagDiv.insertAdjacentHTML('beforeend',checkboxEls.join('\n'));
      });

      playPauseBtn.style.display = 'block';
      transportBtn.style.display = 'block';

      tagDiv.addEventListener('input',() => {
        const listenTagIds = [...tagDiv.querySelectorAll('[name=tags]:checked')].map(tag => tag.value);
        mixer.updateParams({ listenTagIds });
      });
    }).
    catch(err => {
      const errBox = document.getElementById('errorDisplay');
      errBox.style.display = 'block';
      errBox.appendChild(document.createTextNode(err));
    }).
    then(() => document.getElementById('loadingIndicator').remove());
}

const currentUrl = new URL(window.location);
const params = new URLSearchParams(currentUrl.search);
const googleMapsApiKey = params.get('mapsApiKey') || '';

const scriptTag = document.createElement('script');
scriptTag.src = `https://maps.googleapis.com/maps/api/js?callback=initDemo&key=${googleMapsApiKey}`;

document.body.appendChild(scriptTag);
