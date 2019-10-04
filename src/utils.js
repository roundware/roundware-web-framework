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

// @see https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore#_minby-and-_maxby //const makeSelect = (comparator) => (a,b) => comparator(a,b) ? a : b;
//export const minValue = makeSelect((a,b) => a <= b);
//const minByValue = makeSelect((a, b) => a.value <= b.value)
//const maxByValue = makeSelect((a, b) => a.value >= b.value)

// @see https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore#_random
export const random = (a = 1, b = 0) => {
  const lower = Math.min(a,b);
  const upper = Math.max(a,b);

  return lower + Math.random() * (upper - lower);
};

export const randomInt = (a = 1, b = 0) => {
  const lower = Math.ceil(Math.min(a,b));
  const upper = Math.floor(Math.max(a,b));

  return Math.floor(lower + Math.random() * (upper - lower + 1));
};

export const NO_OP = () => {};
