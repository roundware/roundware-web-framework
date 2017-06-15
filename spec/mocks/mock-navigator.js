let initialCoordinates = { coords: { latitude: 1, longitude: 2 } };

let watchCoordinates   = { coords: { latitude: 3, longitude: 4 } };

let mockGeolocationSystem = {
  getCurrentPosition: (successCallback,errCallback) => { successCallback(initialCoordinates); },
  watchPosition:      (successCallback,errCallback) => { successCallback(watchCoordinates); },
};

let mockNavigator = {
  userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
  geolocation: mockGeolocationSystem
};


export { mockNavigator, mockGeolocationSystem, initialCoordinates, watchCoordinates };
