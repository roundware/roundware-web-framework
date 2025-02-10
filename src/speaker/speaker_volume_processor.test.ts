import { before, range, shuffle, xor } from "lodash";
import { SpeakerVolumeProcessor, VPTrack } from "./speaker_volume_processor";
import { coordsToPoints } from "../utils";

describe("Volume Processor", () => {
  const holdedTracks: VPTrack[] = range(0, 10).map((index) => ({
    calculatedVolume: Math.random(),
    minVolume: 0,
    speakerData: {
      parents: [],
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
      parents: [],
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

  describe("maxNRandom", () => {
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
});
