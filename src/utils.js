/* global require */

const { point } = require('@turf/helpers');

export function coordsToPoints({ latitude, longitude }) {
  // NOTE we need to reverse the order here to make geolocations compatible with Roundware geometries, which have points listed w/ longitude first
  return point([+longitude,+latitude]); // NOTE we need to reverse the order here to make geolocations compatible with Roundware geometries, which have points listed w/ longitude first
}
