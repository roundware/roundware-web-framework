# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [0.12.2] - 2021-9-20

### Changed

- Fallback promise rejection when permission deny on Firefox

## [0.12.2] - 2021-9-17

Speaker Bug Fixes

## [0.12.1] - 2021-9-16

Bug Fixes

### Added

- `getMapBounds()` - detemines bounds for a map by Speakers polygons and out of range buffer

### Changed

- Changed the behaviour of fading to not perform fading time if it's already in middle fading to that volume.

### Fixed

- Fixed playing of Audio Track even when playlist was paused

## [0.12.0] - 2021-9-13

Codebase has been converted to TypeScript!

### Added

- [TypeScript Support](http://github.com/roundware/roundware-web-framework/src/types)
  Helpers & Interfaces for common objects like `IAssetData`, `IEnvelope`,
- [Listen Events](https://roundware.org/api/#get-listenevents)
  Listen events can be logged on server via `POST` request when assets play and `PATCH` when paused/stopped/ended
- [Audio Panning]()
  Recordings will now pan around with given `minpanpos`, `maxpanpos`, `minpanduration`. `maxpanduration`
- [Watch & Build]() `npm run watch` will watch and build the source which makes it easier to test as a dependency in another project.
- Initial test suite using Jest, and Github Actions for CodeCov

### Changed

- Properties from the `Roundware` class has been renamed to use public property convention without underscore(`_`)
- Skipping will fade out for `minfadeoutduration` and load next asset, instead of skipping the current state.
- Waiting in `LoadingState` until asset is eligible to play and Switch to `FadingInState` state as soon as starts playing after `LoadingState`, to avoid inaccurate fading duration.
- Added initial volume of audio to be `0` to avoid jumps in case delay in ramping.
- Speaker audio related implementation is moved into `speaker-player.ts`

### Fixed

- Bug where assets were not updated on given interval
- On updating assets it should not replace the assets in assetPool instead add new assets to existing
- Speaker not pausing even after calling `pause()`
- A check before play `play()` function to check if `AudioContext` is running and `resume()` if `suspended` or `closed`
- Before upload envelope make sure to convert `tag_ids` array into comma seperated values
