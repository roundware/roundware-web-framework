/* global require */

const { point } = require('@turf/helpers');

export function coordsToPoints({ latitude, longitude }) {
  // NOTE we need to reverse the order here to make geolocations compatible with Roundware geometries, which have points listed w/ longitude first
  return point([+longitude,+latitude]); // NOTE we need to reverse the order here to make geolocations compatible with Roundware geometries, which have points listed w/ longitude first
}

// @see https://stackoverflow.com/a/24403771/308448
export const isEmpty = array => !array || array.length < 1;

// @see https://eslint.org/docs/rules/no-prototype-builtins
export const hasOwnProperty = (target,propName) => Object.prototype.hasOwnProperty.call(target,propName);
