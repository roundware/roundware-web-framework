/* global google, Roundware */
const ROUNDWARE_SERVER_URL = 'https://simw.roundware.com/api/2';
const ROUNDWARE_DEFAULT_PROJECT_ID = 9;
const ROUNDWARE_INITIAL_LATITUDE=39.22101;
const ROUNDWARE_INITIAL_LONGITUDE=-85.897893;

//function mapSpeakers(map) {
  //let speakers = roundware._speakerData;

  //$.each(speakers,function (i, item) {
    //map.data.addGeoJson({
      //"type": "Feature",
      //"geometry": item.shape,
      //"properties": {
        //"speaker_id": item.id,
        //"name": "outer"
      //}
    //});

    //map.data.addGeoJson({
      //"type": "Feature",
      //"geometry": item.attenuation_border,
      //"properties": {
        //"speaker_id": item.id,
        //"name": "inner"
      //}
    //});

    //map.data.setStyle(function(feature) {
      //if (feature.getProperty('name') == "outer") {
        //return {
          //fillColor: '#aaaaaa',
          //fillOpacity: .5,
          //strokeWeight: 1,
          //strokeOpacity: .5
        //};
      //}
      //else if (feature.getProperty('name') == "inner") {
        //return {
          //fillColor: '#555555',
          //fillOpacity: 0,
          //strokeWeight: 1,
          //strokeOpacity: .2
        //};
      //}
    //});
  //});
//}

//function mapAssets(map) {
  //// console.log(roundware._assetData[0]);
  //let assets = roundware._assetData;

  //$.each(assets, function (i, item) {
    //var marker_img = new google.maps.MarkerImage('https://www.google.com/intl/en_us/mapfiles/ms/micons/yellow-dot.png');
    //var point = new google.maps.LatLng(item.latitude, item.longitude);
    //// var tag_ids = item.tag_ids.toString();
    //// console.log('tag_ids = ' + tag_ids);

    //var marker = new google.maps.Marker({
    //position: point,
    //map: map,
    //icon: marker_img
    //});
    //marker.id = item.id;
    //marker.rw_tags = [];
    //if (item.tag_ids) {
    //marker.rw_tags = item.tag_ids;
    //}
    //// display asset shape if exists
    //if (item.shape) {
    //console.log("map the asset's shape");
    //marker.shape = new google.maps.Data();
    //marker.shape.addGeoJson({
      //"type": "Feature",
      //"geometry": item.shape,
      //"properties": {
        //"asset_id": item.id,
        //"name": "assetRange"
      //}
    //});
    //marker.shape.setStyle(function(feature) {
      //if (feature.getProperty('name') == "assetRange") {
        //return {
          //fillColor: '#6292CF',
          //fillOpacity: .25,
          //strokeWeight: 1,
          //strokeOpacity: .8,
          //strokeColor: '#6292CF'
        //};
      //}
    //});
    //}
    //// if no asset shape, display default circle range
    //else {
      //var circle = {
        //strokeColor: '#6292CF',
        //strokeOpacity: 0.8,
        //strokeWeight: 1,
        //fillColor: '#6292CF',
        //fillOpacity: 0.25,
        //map: map,
        //center: new google.maps.LatLng(item.latitude, item.longitude),
        //radius: roundware._project.recordingRadius
      //};
      //marker.circle = new google.maps.Circle(circle);
      //}
      //assetMarkers.push(marker);
    //});
//}

//function showHideMarkers() {
  //$.each(assetMarkers, function(i, item) {
    //// if any item tags are not included in selected tags, hide marker, otherwise show it
    //let selectedListenTagIds = $("#uiListenDisplay input:checked").map(function() {
      //return Number(this.value);
    //}).get();
	//var is_visible = true;
	//$.each(item.rw_tags, function(j, tag_id) {
      //// if tag_id isn't selected, set to false and return
      //if (!(selectedListenTagIds.includes(tag_id))) {
        //is_visible = false;
			//return;
		//}
	//});
	//item.setVisible(is_visible);
    //if (item.circle) {
      //item.circle.setVisible(is_visible);
    //}
    //if (item.shape) {
      //if (is_visible) {
        //item.shape.setMap(listenMap);
      //} else if (!is_visible) {
        //item.shape.setMap(null);
      //}
    //}
  //});
//}

/**
 * Add editable circles centered on listener pin that define the listener_range
 * every time either circle is edited, a PATCH streams/ is sent with lat/lon and listener_range_min/max
 */
//function add_listener_range() {
    //use_listener_range = true;
    //var mapCenter = new google.maps.LatLng(listenLatitude.val(),
                                           //listenLongitude.val());
    //listener_circle_max = new google.maps.Circle({
        //strokeColor: '#000000',
        //strokeOpacity: 0.4,
        //strokeWeight: 1,
        //fillColor: '#000000',
        //fillOpacity: 0.08,
        //map: listenMap,
        //center: mapCenter,
        //radius: roundware._project.recordingRadius * 100,
        //editable: true,
        //draggable: false,
        //geodesic: true
    //});
    //listener_circle_min = new google.maps.Circle({
        //strokeColor: '#000000',
        //strokeOpacity: 0.4,
        //strokeWeight: 1,
        //fillColor: '#000000',
        //fillOpacity: 0,
        //map: listenMap,
        //center: mapCenter,
        //radius: roundware._project.recordingRadius * 50,
        //editable: true,
        //draggable: false,
        //geodesic: true
    //});
    //listenMap.setCenter(mapCenter);

    //google.maps.event.addListener(listener_circle_max, "radius_changed", function (event) {
        //lr_max = Math.round(listener_circle_max.getRadius());
        //lr_min = Math.round(listener_circle_min.getRadius());
        //// ensure listener_range_max isn't smaller than listener_range_min
        //if (lr_max < lr_min) {
            //listener_circle_max.setRadius(lr_min);
            //console.log("maximum range can't be smaller than minimum range!")
        //}
        //if (!firstplay) {
          //var data = { "listener_range_max": lr_max,
                       //"listener_range_min": lr_min }
          //update(data);
        //}
        //console.log("max range = " + lr_max);
    //});
    //google.maps.event.addListener(listener_circle_min, "radius_changed", function (event) {
        //lr_min = Math.round(listener_circle_min.getRadius());
        //lr_max = Math.round(listener_circle_max.getRadius());
        //// ensure listener_range_min isn't larger than listener_range_max
        //if (lr_min > lr_max) {
            //listener_circle_min.setRadius(lr_max);
            //console.log("minimum range can't be bigger than maximum range!")
        //}
        //if (!firstplay) {
          //var data = { "listener_range_max": lr_max,
                       //"listener_range_min": lr_min }
          //update(data);
        //}
    //});
//}

//function remove_listener_range() {
  //use_listener_range = false;
  //listener_circle_max.setMap(null);
  //listener_circle_min.setMap(null);
//}
//// Generally we throw user-friendly messages and log a more technical message
//function handleError(userErrMsg) {
  //console.error("There was a Roundware Error: " + userErrMsg);
//}

function runDemo() {
  const roundware = new Roundware(window,{
    serverUrl: ROUNDWARE_SERVER_URL,
    projectId: ROUNDWARE_DEFAULT_PROJECT_ID,
    geoListenEnabled: true,
    speakerFilters: { activeyn: true},
    assetFilters:   { submitted: true, media_type: "audio" }
  });

  roundware.connect().
    then(() => console.log('Roundware connected')).
    catch(err => console.error('There was a Roundware connection error',err));
}

/* eslint-disable no-unused-vars */
// this function gets called by the google APIs script tax, see index.html
function setupMap() {
  const center = { 
    lat: ROUNDWARE_INITIAL_LATITUDE,
    lng: ROUNDWARE_INITIAL_LONGITUDE
  };

  const listenMapEl = document.getElementById('mixMap');

  const map = new google.maps.Map(listenMapEl,{
    zoom: 16,
    center
  });
  
  const listener = new google.maps.Marker({
    position: center,
    map,
    draggable: true
  });

  google.maps.event.addListener(listener, "dragend",() => {
    map.setCenter(listener.getPosition());

    //var data = {};

    //if (use_listener_range === true) {
      //listener_circle_max.setCenter(new google.maps.LatLng(listener.getPosition().lat(),
                                                           //listener.getPosition().lng()));

      //listener_circle_min.setCenter(new google.maps.LatLng(listener.getPosition().lat(),
                                                           //listener.getPosition().lng()));

      //data = { 
        //"listener_range_max": Math.round(listener_circle_max.getRadius()),
        //"listener_range_min": Math.round(listener_circle_min.getRadius()) 
      //};
    //}

    //update(data);
  });

  //mapAssets(listenMap);
  //mapSpeakers(listenMap);
  //showHideMarkers();
}
/* eslint-enable no-unused-vars */

window.onload = runDemo();
