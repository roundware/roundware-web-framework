import { before, range, shuffle, xor } from "lodash";
import { SpeakerVolumeProcessor, VPTrack } from "./speaker_volume_processor";
import { coordsToPoints } from "../utils";
import { Logger } from "../helpers/Logger";

describe("Volume Processor", () => {
  const holdedTracks: VPTrack[] = range(0, 10).map((index) => ({
    calculatedVolume: Math.random(),
    minVolume: 0,
    speakerData: {
      parents: index === 0 ? [] : [index - 1],
    },
    speakerId: index,
    volumeByLocation() {
      return (1 + index) / 100;
    },
  }));

  const availableTracks: VPTrack[] = range(11, 20).map((index) => ({
    calculatedVolume: Math.random(),
    minVolume: 0,
    speakerData: {
      parents: [index - 1],
    },
    speakerId: index,
    volumeByLocation() {
      return (1 + index) / 100;
    },
  }));

  const allTracks = [...holdedTracks, ...availableTracks];

  const vP = new SpeakerVolumeProcessor(allTracks);

  test("should calculate available tracks correctly", () => {
    vP.holdList = holdedTracks;
    expect.assertions(3);
    const available = vP.getAvailableTracks();
    expect(available).toStrictEqual(availableTracks);
    expect(available).not.toContainEqual(holdedTracks);
    expect(vP.holdList).toEqual(holdedTracks);
  });

  describe("maxNRandom()", () => {
    const listenerPoint = coordsToPoints({
      latitude: 45,
      longitude: 45,
    }).geometry;

    beforeEach(() => {
      // Reset the processor state before each test
      vP.clearHolds();
      allTracks.forEach((track) => {
        track.calculatedVolume = Math.random();
      });
    });

    test("should make all other available tracks zero", () => {
      // Fill holdList with some initial tracks
      const initialTracks = allTracks.slice(0, 5);
      initialTracks.forEach((track) => vP.holdTrack(track));

      vP.maxNRandom(3, listenerPoint);

      // Check that available tracks have volume = 0
      const availableTracks = vP.getAvailableTracks();
      availableTracks.forEach((track) => {
        expect(track.calculatedVolume).toBe(0);
      });
    });

    test("should hold with correct volumes by location", () => {
      // Fill holdList with some initial tracks
      vP.byLocation(listenerPoint);
      const initialTracks = allTracks.slice(0, 5);
      initialTracks.forEach((track) => vP.holdTrack(track));

      for (let t = 0; t < 10; t++) {
        vP.maxNRandom(3, listenerPoint);
      }

      // holded volumes are correct by location.
      vP.holdList.forEach((track) => {
        if (track)
          expect(track.calculatedVolume).toEqual(
            (1 + (track.speakerId ?? 0)) / 100
          );
      });
    });

    test("should maintain correct holdList length", () => {
      // Fill holdList with 5 tracks
      const initialTracks = allTracks.slice(0, 5);
      initialTracks.forEach((track) => vP.holdTrack(track));

      const max = 4;
      const initialLength = vP.holdList.length;

      // for atleast 20 times
      for (let t = 0; t < 20; t++) {
        vP.maxNRandom(max, listenerPoint);
      }

      // Length should remain the same as we're just replacing elements
      expect(vP.holdList.length).toBe(initialLength);
    });

    test("should not duplicate tracks in holdList", () => {
      // Fill holdList with initial tracks
      const initialTracks = allTracks.slice(0, 5);
      initialTracks.forEach((track) => vP.holdTrack(track));

      vP.maxNRandom(4, listenerPoint);

      // Filter out null values and check for duplicates
      const nonNullTracks = vP.holdList.filter((track) => track !== null);
      const speakerIds = nonNullTracks.map((track) => track!.speakerId);
      const uniqueSpeakerIds = new Set(speakerIds);

      expect(speakerIds.length).toBe(uniqueSpeakerIds.size);
    });

    // should not duplicate tracks if available tracks are less than max
    test("should not duplicate tracks if available tracks are less than max", () => {
      // Fill holdList with initial track
      const initialTracks = allTracks.slice(0, 19);
      initialTracks.forEach((track) => vP.holdTrack(track));

      expect.assertions(20);
      for (let t = 0; t < 20; t++) {
        vP.maxNRandom(20, listenerPoint);

        // Filter out null values and check for duplicates
        const nonNullTracks = vP.holdList.filter((track) => track != null);
        const speakerIds = nonNullTracks.map((track) => track!.speakerId);
        const uniqueSpeakerIds = new Set(speakerIds);
        expect(speakerIds.length).toBe(uniqueSpeakerIds.size);
      }
    });

    // only max-1 are replaced
    test("should never replace the root", () => {
      vP.clearHolds();
      // Fill holdList with initial tracks
      const initialTracks = allTracks.slice(0, 5);
      initialTracks.forEach((track) => vP.holdTrack(track));

      vP.holdRoot();
      const baseTrack = vP.holdList[vP.holdList.length - 1];

      vP.restToZero();
      vP.holdList.push(...new Array(4).fill(null));
      expect.assertions(20);
      for (let i = 0; i < 20; i++) {
        vP.maxNRandom(5, listenerPoint);
        expect(vP.holdList[vP.holdList.length - 5]).toEqual(baseTrack);
      }
    });
  });

  describe("findRoot()", () => {
    const common = {
      calculatedVolume: 0,
      volumeByLocation() {
        return 0;
      },
      minVolume: 0,
    };
    const tracks: VPTrack[] = [
      {
        speakerId: 0,
        speakerData: {
          parents: [],
        },
        ...common,
      },
      {
        speakerId: 1,
        speakerData: {
          parents: [0],
        },
        ...common,
      },
      {
        speakerId: 2,
        speakerData: {
          parents: [1],
        },
        ...common,
      },
    ];

    test("should find the oldest ancestor", () => {
      const processor = new SpeakerVolumeProcessor(tracks);
      const root = processor.findRoot(shuffle(tracks));
      expect(root?.speakerId).toBe(0);
    });
  });
  describe("holdMinVolumes()", () => {
    const listenerPoint = coordsToPoints({
      latitude: 45,
      longitude: 45,
    }).geometry;

    beforeEach(() => {
      // Reset the processor state before each test
      vP.clearHolds();
      allTracks.forEach((track) => {
        track.calculatedVolume = Math.random();
      });
    });

    test("should hold tracks with minimum volume", () => {
      // Set some tracks to have calculatedVolume equal to minVolume
      allTracks[0].calculatedVolume = allTracks[0].minVolume;
      allTracks[1].calculatedVolume = allTracks[1].minVolume;

      vP.holdMinVolumes();

      // Check that holdList contains tracks with minVolume
      expect(vP.holdList).toContain(allTracks[0]);
      expect(vP.holdList).toContain(allTracks[1]);
    });

    test("should not hold tracks without minimum volume", () => {
      // Ensure no tracks have calculatedVolume equal to minVolume
      allTracks.forEach((track) => {
        track.calculatedVolume = track.minVolume + 0.1;
      });

      vP.holdMinVolumes();

      // Check that holdList is empty
      expect(vP.holdList).toHaveLength(0);
    });
  });
  describe("holdTrack()", () => {
    beforeEach(() => {
      // Reset the processor state before each test
      vP.clearHolds();
      allTracks.forEach((track) => {
        track.calculatedVolume = Math.random();
      });
    });

    test("should add null to holdList if track is null", () => {
      vP.holdTrack(null);
      expect(vP.holdList[vP.holdList.length - 1]).toEqual(null);
    });

    test("should add track to holdList if track is available", () => {
      const track = availableTracks[0];
      vP.holdTrack(track);
      expect(vP.holdList[vP.holdList.length - 1]).toEqual(track);
    });

    test("should not add track to holdList if track is not available", () => {
      vP.holdTrack(holdedTracks[0]);
      vP.holdTrack(holdedTracks[1]);
      vP.holdTrack(holdedTracks[2]);
      vP.holdTrack(holdedTracks[0]);
      expect(vP.holdList[vP.holdList.length - 1]).not.toEqual(holdedTracks[0]);
    });

    test("should not add duplicate tracks to holdList", () => {
      const track = availableTracks[0];
      vP.holdTrack(track);
      vP.holdTrack(track);
      const occurrences = vP.holdList.filter((t) => t === track).length;
      expect(occurrences).toBe(1);
    });

    test("should log a warning if track is already in holdList", () => {
      const track = holdedTracks[0];
      const warnSpy = jest.spyOn(vP, "warn");
      vP.holdTrack(track);
      vP.holdTrack(track);
      expect(warnSpy).toHaveBeenCalledWith(
        "Track was already holded",
        track.speakerId
      );
    });
  });
});
