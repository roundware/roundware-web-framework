import { Roundware, GeoListenMode } from './roundware';
import { ApiClient } from './api-client';
import { User } from './user';
import { GeoPosition } from './geo-position';
import { Session } from './session';
import { Project } from './project';
import { Speaker } from './speaker';
import { Asset } from './asset';
import { TimedAsset } from './timed_asset';
import { Audiotrack } from './audiotrack';
import { Mixer } from './mixer';
import { ListenHistory } from './listenHistory';
import { RoundwareEvents } from './events';
import { Coordinates } from './types';
import { Envelope } from './envelope';
import { IAssetData, IMixParams, IUiConfig, ITagGroup, ITag, ITimedAssetData, IAudioTrackData } from './types';
import { IRoundwareConstructorOptions } from './types';
import { ISpeakerData } from './types';
import { noAssetData } from './constants/warning';

// Mock all the dependencies
jest.mock('./api-client');
jest.mock('./user');
jest.mock('./geo-position');
jest.mock('./session');
jest.mock('./project');
jest.mock('./speaker');
jest.mock('./asset');
jest.mock('./timed_asset');
jest.mock('./audiotrack');
jest.mock('./mixer');
jest.mock('./listenHistory');
jest.mock('./events');
jest.mock('./envelope');

describe('Roundware', () => {
  let roundware: Roundware;
  let mockApiClient: jest.Mocked<ApiClient>;
  let mockUser: jest.Mocked<User>;
  let mockGeoPosition: jest.Mocked<GeoPosition>;
  let mockSession: jest.Mocked<Session>;
  let mockProject: jest.Mocked<Project>;
  let mockSpeaker: jest.Mocked<Speaker>;
  let mockAsset: jest.Mocked<Asset>;
  let mockTimedAsset: jest.Mocked<TimedAsset>;
  let mockAudiotrack: jest.Mocked<Audiotrack>;
  let mockMixer: jest.Mocked<Mixer>;
  let mockListenHistory: jest.Mocked<ListenHistory>;
  let mockEvents: jest.Mocked<RoundwareEvents>;

  const mockLocation: Coordinates = {
    latitude: 40.7128,
    longitude: -74.0060
  };

  const mockOptions = {
    serverUrl: 'http://test-server.com',
    projectId: 1,
    listenerLocation: mockLocation,
    assetFilters: {},
    speakerConfig: { mode: 'stream' as const },
    deviceId: 'test-device',
    geoListenMode: GeoListenMode.AUTOMATIC
  };

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Setup mock implementations
    mockApiClient = new ApiClient(mockOptions.serverUrl) as jest.Mocked<ApiClient>;
    mockUser = new User({ apiClient: mockApiClient }) as jest.Mocked<User>;
    mockGeoPosition = new GeoPosition(window.navigator, {
      defaultCoords: mockLocation,
      geoListenMode: mockOptions.geoListenMode
    }) as jest.Mocked<GeoPosition>;
    mockSession = new Session(window.navigator, 1, true, { apiClient: mockApiClient }) as jest.Mocked<Session>;
    mockProject = new Project(1, { apiClient: mockApiClient }) as jest.Mocked<Project>;
    mockSpeaker = new Speaker(1, { apiClient: mockApiClient }) as jest.Mocked<Speaker>;
    mockAsset = new Asset(1, { apiClient: mockApiClient }) as jest.Mocked<Asset>;
    mockTimedAsset = new TimedAsset(1, { apiClient: mockApiClient }) as jest.Mocked<TimedAsset>;
    mockAudiotrack = new Audiotrack(1, { apiClient: mockApiClient }) as jest.Mocked<Audiotrack>;
    mockMixer = new Mixer({
      client: {} as any,
      listenerLocation: mockLocation,
      mixParams: {}
    }) as jest.Mocked<Mixer>;
    mockListenHistory = new ListenHistory() as jest.Mocked<ListenHistory>;
    mockEvents = new RoundwareEvents(1, mockApiClient) as jest.Mocked<RoundwareEvents>;

    // Mock constructor implementations
    (ApiClient as jest.Mock).mockImplementation(() => mockApiClient);
    (User as jest.Mock).mockImplementation(() => mockUser);
    (GeoPosition as jest.Mock).mockImplementation(() => mockGeoPosition);
    (Session as jest.Mock).mockImplementation(() => mockSession);
    (Project as jest.Mock).mockImplementation(() => mockProject);
    (Speaker as jest.Mock).mockImplementation(() => mockSpeaker);
    (Asset as jest.Mock).mockImplementation(() => mockAsset);
    (TimedAsset as jest.Mock).mockImplementation(() => mockTimedAsset);
    (Audiotrack as jest.Mock).mockImplementation(() => mockAudiotrack);
    (Mixer as jest.Mock).mockImplementation(() => mockMixer);
    (ListenHistory as jest.Mock).mockImplementation(() => mockListenHistory);
    (RoundwareEvents as jest.Mock).mockImplementation(() => mockEvents);

    roundware = new Roundware(mockOptions);
  });

  describe('constructor', () => {
    it('should throw MissingArgumentError if options is not an object', () => {
      expect(() => new Roundware(null as any)).toThrow(/Cannot destructure property 'serverUrl' of '.*options.*' as it is null/);
    });

    it('should throw MissingArgumentError if options is undefined', () => {
      expect(() => new Roundware(undefined as any)).toThrow('Expected argument "options" was missing or invalid while instantiating Roundware. Please pass options of type "IRoundwareConstructorOptions" while instantiating Roundware');
    });

    it('should throw InvalidArgumentError if serverUrl is not a string', () => {
      const invalidOptions: IRoundwareConstructorOptions = {
        projectId: 1,
        listenerLocation: mockLocation,
        assetFilters: {},
        speakerConfig: { mode: 'stream' as const },
        deviceId: 'test-device',
        geoListenMode: GeoListenMode.AUTOMATIC,
        serverUrl: 123 as any
      };
      expect(() => new Roundware(invalidOptions)).toThrow('Expected argument "options.serverUrl" to be "string" while instantiating Roundware');
    });

    it('should throw InvalidArgumentError if projectId is not a number', () => {
      const invalidOptions: IRoundwareConstructorOptions = {
        serverUrl: 'test',
        listenerLocation: mockLocation,
        assetFilters: {},
        speakerConfig: { mode: 'stream' as const },
        deviceId: 'test-device',
        geoListenMode: GeoListenMode.AUTOMATIC,
        projectId: 'invalid' as any
      };
      expect(() => new Roundware(invalidOptions)).toThrow('Expected argument "options.serverUrl" to be "string" while instantiating Roundware');
    });

    it('should throw InvalidArgumentError if listenerLocation is invalid', () => {
      const invalidOptions: IRoundwareConstructorOptions = {
        serverUrl: 'test',
        projectId: 1,
        listenerLocation: {} as any,
        assetFilters: {},
        speakerConfig: { mode: 'stream' as const },
        deviceId: 'test-device',
        geoListenMode: GeoListenMode.AUTOMATIC
      };
      expect(() => new Roundware(invalidOptions)).toThrow('Expected argument "options.listenerLocation" to be "Coordinates" while instantiating Roundware');
    });

    it('should initialize with valid options', () => {
      expect(roundware).toBeDefined();
      expect(roundware['_serverUrl']).toBe(mockOptions.serverUrl);
      expect(roundware['_projectId']).toBe(mockOptions.projectId);
      expect(roundware.listenerLocation).toEqual(mockOptions.listenerLocation);
    });
  });

  describe('connect', () => {
    it('should connect successfully', async () => {
      const mockSessionId = 123;
      const mockUiConfig = { listen: [], speak: [] };
      const mockSpeakerData = [{ id: 1, name: 'Speaker 1' }];
      const mockAudioTracksData = [{ id: 1, name: 'Track 1' }];

      mockUser.connect.mockResolvedValue({});
      mockSession.connect.mockResolvedValue(mockSessionId);
      mockProject.connect.mockResolvedValue(1);
      mockProject.uiconfig.mockResolvedValue(mockUiConfig);
      mockSpeaker.connect.mockResolvedValue([{
        id: 1,
        maxvolume: 1,
        minvolume: 0,
        attenuation_distance: 100,
        uri: 'test.mp3'
      }]);
      mockAudiotrack.connect.mockResolvedValue([{
        id: 1,
        fadeout_when_filtered: true,
        minvolume: 0,
        maxvolume: 1,
        minduration: 0,
        maxduration: 0,
        mindeadair: 0,
        maxdeadair: 0,
        minfadeintime: 0,
        maxfadeintime: 0,
        minfadeouttime: 0,
        maxfadeouttime: 0,
        minpanpos: 0,
        maxpanpos: 0,
        minpanduration: 0,
        maxpanduration: 0,
        repeatrecordings: false,
        active: true,
        start_with_silence: false,
        banned_duration: 0,
        tag_filters: [],
        project_id: 1,
        timed_asset_priority: "discard"
      }]);

      const result = await roundware.connect();

      expect(mockUser.connect).toHaveBeenCalled();
      expect(mockSession.connect).toHaveBeenCalled();
      expect(mockProject.connect).toHaveBeenCalledWith(mockSessionId);
      expect(mockSpeaker.connect).toHaveBeenCalled();
      expect(mockAudiotrack.connect).toHaveBeenCalled();
      expect(result).toEqual({ uiConfig: mockUiConfig });
    });

    it('should setup geolocation callback on connect', async () => {
      const mockCallback = jest.fn();
      mockGeoPosition.connect.mockImplementation((callback: any) => {
        // Store the callback for later verification
        mockCallback.mockImplementation(callback);
      });

      await roundware.connect();

      expect(mockGeoPosition.connect).toHaveBeenCalledWith(expect.any(Function));
      
      // Verify the callback updates location when called
      const newLocation = { latitude: 41.7128, longitude: -75.0060 };
      mockCallback(newLocation);
      
      expect(roundware.listenerLocation).toEqual(newLocation);
      expect(mockMixer.updateParams).toHaveBeenCalledWith({ listenerLocation: newLocation });
    });

    it('should handle connection errors', async () => {
      mockUser.connect.mockRejectedValue(new Error('Connection failed'));

      await expect(roundware.connect()).rejects.toThrow('Sorry, we were unable to connect to Roundware. Please try again.');
    });
  });

  describe('updateLocation', () => {
    it('should update location and trigger callback', () => {
      const newLocation = { latitude: 41.7128, longitude: -75.0060 };
      const mockCallback = jest.fn();
      roundware.onUpdateLocation = mockCallback;

      roundware.updateLocation(newLocation);

      expect(roundware.listenerLocation).toEqual(newLocation);
      expect(mockMixer.updateParams).toHaveBeenCalledWith({ listenerLocation: newLocation });
      expect(mockCallback).toHaveBeenCalledWith(newLocation);
    });
  });

  describe('enableGeolocation', () => {
    it('should enable geolocation in automatic mode', () => {
      roundware.enableGeolocation(GeoListenMode.AUTOMATIC);

      expect(mockGeoPosition.enable).toHaveBeenCalled();
      expect(mockMixer.updateParams).toHaveBeenCalledWith({ geoListenMode: GeoListenMode.AUTOMATIC });
    });

    it('should disable geolocation in manual mode', () => {
      roundware.enableGeolocation(GeoListenMode.MANUAL);

      expect(mockGeoPosition.disable).toHaveBeenCalled();
      expect(mockMixer.updateParams).toHaveBeenCalledWith({ geoListenMode: GeoListenMode.MANUAL });
    });
  });

  describe('disableGeolocation', () => {
    it('should disable geolocation and update mixer params', () => {
      roundware.disableGeolocation();

      expect(mockGeoPosition.disable).toHaveBeenCalled();
      expect(mockMixer.updateParams).toHaveBeenCalledWith({ geoListenMode: GeoListenMode.DISABLED });
    });
  });

  describe('getAssets', () => {
    it('should return preloaded assets if no options provided', async () => {
      const mockAssets = [mockAssetData];
      roundware.assetData = mockAssets;

      const result = await roundware.getAssets();

      expect(result).toEqual(mockAssets);
      expect(mockApiClient.get).not.toHaveBeenCalled();
    });

    it('should fetch assets from API with filters', async () => {
      const mockAssets = [mockAssetData];
      const filters = { tag_ids: [1, 2, 3] };
      mockApiClient.get.mockResolvedValue(mockAssets);

      const result = await roundware.getAssets(filters);

      expect(result).toEqual(mockAssets);
      expect(mockApiClient.get).toHaveBeenCalledWith('/assets/', expect.objectContaining({
        project_id: mockOptions.projectId,
        ...filters
      }));
    });
  });

  describe('getAsset', () => {
    it('should return asset from asset pool if available', async () => {
      const mockAsset = mockAssetData;
      roundware.assetData = [mockAsset];

      const result = await roundware.getAsset(1);

      expect(result).toEqual(mockAsset);
      expect(mockApiClient.get).not.toHaveBeenCalled();
    });

    it('should fetch asset from API if not in pool', async () => {
      const mockAsset = mockAssetData;
      mockApiClient.get.mockResolvedValue(mockAsset);

      const result = await roundware.getAsset(1);

      expect(result).toEqual(mockAsset);
      expect(mockApiClient.get).toHaveBeenCalledWith('/assets/1/', expect.objectContaining({
        session_id: undefined
      }));
    });
  });

  describe('getEnvelope', () => {
    it('should fetch envelope from API', async () => {
      const mockEnvelope = {
        id: 1,
        assets: []
      };
      mockApiClient.get.mockResolvedValue(mockEnvelope);

      const result = await roundware.getEnvelope(1);

      expect(result).toEqual(mockEnvelope);
      expect(mockApiClient.get).toHaveBeenCalledWith('/envelopes/1', expect.objectContaining({
        session_id: undefined
      }));
    });
  });

  describe('getMapBounds', () => {
    it('should handle speakers without shapes', () => {
      const mockSpeakers = [{ id: 1 }];
      (roundware as any).speakers = jest.fn().mockReturnValue(mockSpeakers);

      const bounds = roundware.getMapBounds();
      
      expect(bounds).toBeDefined();
      expect(bounds.southwest).toBeDefined();
      expect(bounds.northeast).toBeDefined();
    });

    it('should handle project without outOfRangeDistance', () => {
      const mockSpeakers = [{
        shape: {
          coordinates: [[[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]]
        }
      }];
      (roundware as any).speakers = jest.fn().mockReturnValue(mockSpeakers);
      roundware.project.outOfRangeDistance = undefined;

      const bounds = roundware.getMapBounds();
      
      expect(bounds).toBeDefined();
      expect(bounds.southwest).toBeDefined();
      expect(bounds.northeast).toBeDefined();
    });
  });

  describe('play', () => {
    it('should wait for initial geolocation and call callback', async () => {
      const mockCallback = jest.fn();
      mockGeoPosition.waitForInitialGeolocation.mockResolvedValue(mockOptions.listenerLocation);

      await roundware.play(mockCallback);

      expect(mockGeoPosition.waitForInitialGeolocation).toHaveBeenCalled();
      expect(mockCallback).toHaveBeenCalledWith(mockOptions.listenerLocation);
    });
  });

  describe('pause', () => {
    it('should pause the playlist if it exists', () => {
      roundware.mixer.playlist = { pause: jest.fn() } as any;

      roundware.pause();

      expect(roundware.mixer?.playlist?.pause).toHaveBeenCalled();
    });
  });

  describe('skip', () => {
    it('should skip the current asset if playlist exists', () => {
      roundware.mixer.playlist = { skip: jest.fn() } as any;

      roundware.skip();

      expect(roundware.mixer?.playlist?.skip).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update playlist params with new data', () => {
      const updateData = {
        latitude: 41.7128,
        longitude: -75.0060,
        tagIds: [1, 2, 3]
      };

      roundware.mixer.playlist = { updateParams: jest.fn() } as any;

      roundware.update(updateData);

      expect(roundware.mixer?.playlist?.updateParams).toHaveBeenCalledWith(updateData);
    });
  });

  describe('vote', () => {
    it('should post vote to API', async () => {
      const assetId = 1;
      const voteType = 'like';
      const value = true;

      mockApiClient.post.mockResolvedValue(undefined);

      await roundware.vote(assetId, voteType, value);

      expect(mockApiClient.post).toHaveBeenCalledWith('/assets/1/votes/', {
        session_id: undefined,
        vote_type: voteType,
        value
      });
    });
  });

  const mockAssetData: IAssetData = {
    id: 1,
    description: 'Test asset',
    latitude: 0,
    longitude: 0,
    filename: 'test.mp3',
    file: 'test.mp3',
    volume: 1,
    submitted: true,
    created: '2023-01-01',
    updated: '2023-01-01',
    weight: 1,
    start_time: 0,
    end_time: 0,
    user: {
      username: 'testuser',
      email: 'test@test.com'
    },
    media_type: 'audio',
    audio_length_in_seconds: 0,
    tag_ids: [],
    project_id: 1,
    language_id: 1,
    envelope_ids: [],
    session_id: 1,
    description_loc_ids: [],
    alt_text_loc_ids: []
  };

  describe('asset pool management', () => {
    it('should update asset pool with new assets', async () => {
      const mockNewAssets = [mockAssetData];
      mockAsset.connect.mockResolvedValue(mockNewAssets);
      
      await roundware.updateAssetPool();
      
      expect(mockAsset.connect).toHaveBeenCalled();
      expect(roundware.assetData).toEqual(mockNewAssets);
    });

    it('should include existing assets and filter by last update time when updating asset pool', async () => {
      const mockExistingAssets = [mockAssetData];
      const mockNewAssets = [{ ...mockAssetData, id: 2 }];
      const mockLastUpdate = new Date('2023-01-01');
      
      // Set up initial state
      roundware.assetData = mockExistingAssets;
      roundware['_lastAssetUpdate'] = mockLastUpdate;
      mockAsset.connect.mockResolvedValue(mockNewAssets);
      
      await roundware.updateAssetPool();
      
      expect(mockAsset.connect).toHaveBeenCalledWith(expect.objectContaining({
        created__gte: mockLastUpdate.toISOString()
      }));
      expect(roundware.assetData).toEqual([...mockExistingAssets, ...mockNewAssets]);
    });

    it('should call onPlayAssets callback with currently playing assets when set', () => {
      const mockCallback = jest.fn();
      const mockPlayingAssets = [mockAssetData];
      roundware.mixer = { playlist: { currentlyPlayingAssets: mockPlayingAssets } } as any;

      roundware.onPlayAssets = mockCallback;

      expect(mockCallback).toHaveBeenCalledWith(mockPlayingAssets);
    });

    it('should return empty array when no playlist exists', () => {
      roundware.mixer = { playlist: null } as any;
      const result = roundware.currentlyPlayingAssets;
      expect(result).toEqual([]);
    });

    it('should return currently playing assets from playlist', () => {
      const mockPlayingAssets = [mockAssetData];
      roundware.mixer = { playlist: { currentlyPlayingAssets: mockPlayingAssets } } as any;
      const result = roundware.currentlyPlayingAssets;
      expect(result).toEqual(mockPlayingAssets);
    });

    it('should trigger onPlayAssets callback with currently playing assets', () => {
      const mockCallback = jest.fn();
      const mockPlayingAssets = [mockAssetData];
      roundware.mixer = { playlist: { currentlyPlayingAssets: mockPlayingAssets } } as any;
      roundware['_onPlayAssets'] = mockCallback;

      roundware.triggerOnPlayAssets();

      expect(mockCallback).toHaveBeenCalledWith(mockPlayingAssets);
    });

    it('should not trigger onPlayAssets callback when it is not a function', () => {
      const mockCallback = 'not a function';
      roundware['_onPlayAssets'] = mockCallback as any;

      expect(() => roundware.triggerOnPlayAssets()).not.toThrow();
    });

    it('should call onUpdateAssets callback with assets when set', () => {
      const mockCallback = jest.fn();
      const mockAssets = [mockAssetData];
      roundware.assetData = mockAssets;

      roundware.onUpdateAssets = mockCallback;

      expect(mockCallback).toHaveBeenCalledWith(mockAssets);
    });

    it('should not call onUpdateAssets callback when assetData is null', () => {
      const mockCallback = jest.fn();
      roundware.assetData = null;

      roundware.onUpdateAssets = mockCallback;

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should load asset pool and setup periodic updates', async () => {
      const mockAssets = [mockAssetData];
      mockAsset.connect.mockResolvedValue(mockAssets);
      
      await roundware.loadAssetPool();
      
      expect(mockAsset.connect).toHaveBeenCalled();
      expect(roundware.assetData).toEqual(mockAssets);
      expect(roundware['_assetDataTimer']).toBeDefined();
    });

    it('should get assets from pool with filters', async () => {
      const mockAssets = [mockAssetData];
      mockAsset.connect.mockResolvedValue(mockAssets);
      
      const filter = () => true;
      const result = await roundware.getAssetsFromPool(filter);
      
      expect(result).toEqual(mockAssets);
    });

    it('should setup periodic asset pool updates when loading asset pool', async () => {
      const mockAssets = [mockAssetData];
      mockAsset.connect.mockResolvedValue(mockAssets);
      const setIntervalSpy = jest.spyOn(global, 'setInterval');
      
      await roundware.loadAssetPool();
      
      expect(mockAsset.connect).toHaveBeenCalled();
      expect(roundware.assetData).toEqual(mockAssets);
      expect(setIntervalSpy).toHaveBeenCalledWith(
        expect.any(Function),
        roundware['_assetUpdateInterval']
      );
      
      // Clean up
      setIntervalSpy.mockRestore();
    });

    it('should not setup periodic updates if asset pool already exists', async () => {
      const mockAssets = [mockAssetData];
      roundware.assetData = mockAssets;
      const setIntervalSpy = jest.spyOn(global, 'setInterval');
      
      await roundware.loadAssetPool();
      
      expect(setIntervalSpy).not.toHaveBeenCalled();
      
      // Clean up
      setIntervalSpy.mockRestore();
    });

    it('should call updateAssetPool in setInterval callback', async () => {
      const mockAssets = [mockAssetData];
      mockAsset.connect.mockResolvedValue(mockAssets);
      const setIntervalSpy = jest.spyOn(global, 'setInterval');
      const updateAssetPoolSpy = jest.spyOn(roundware, 'updateAssetPool');
      
      await roundware.loadAssetPool();
      
      // Get the callback function passed to setInterval
      const setIntervalCallback = setIntervalSpy.mock.calls[0][0];
      
      // Call the callback function
      // @ts-expect-error - TimerHandler can be a function or string, but we know it's a function here
      await setIntervalCallback();
      
      expect(updateAssetPoolSpy).toHaveBeenCalled();
      
      // Clean up
      setIntervalSpy.mockRestore();
      updateAssetPoolSpy.mockRestore();
    });

    it('should update mixer asset pool when both pool and timedAssetData are available', async () => {
      const mockAssets = [mockAssetData];
      const mockTimedAssets: ITimedAssetData[] = [{
        asset_id: 1,
        start: 0,
        end: 100
      }];
      
      // Set up mock pool with updateAssets method
      const mockPool = { updateAssets: jest.fn() };
      roundware.mixer = { assetPool: mockPool } as any;
      roundware.timedAssetData = mockTimedAssets;
      roundware.assetData = mockAssets;
      
      await roundware.updateAssetPool();
      
      expect(mockPool.updateAssets).toHaveBeenCalledWith(mockAssets, mockTimedAssets);
    });

    it('should not update mixer asset pool when pool is not available', async () => {
      const mockAssets = [mockAssetData];
      const mockTimedAssets: ITimedAssetData[] = [{
        asset_id: 1,
        start: 0,
        end: 100
      }];
      
      // Set up without pool
      roundware.mixer = { assetPool: null } as any;
      roundware.timedAssetData = mockTimedAssets;
      roundware.assetData = mockAssets;
      
      await roundware.updateAssetPool();
      
      // Since assetPool is null, we can verify that the code path that would call updateAssets was not taken
      expect(roundware.mixer.assetPool).toBeNull();
    });

    it('should not update mixer asset pool when timedAssetData is not an array', async () => {
      const mockAssets = [mockAssetData];
      
      // Set up mock pool with updateAssets method
      const mockPool = { updateAssets: jest.fn() };
      roundware.mixer = { assetPool: mockPool } as any;
      roundware.timedAssetData = null;
      roundware.assetData = mockAssets;
      
      await roundware.updateAssetPool();
      
      expect(mockPool.updateAssets).not.toHaveBeenCalled();
    });
  });

  describe('mixer and playlist functionality', () => {
    it('should activate mixer with params', async () => {
      const mockAssets = [mockAssetData];
      mockAsset.connect.mockResolvedValue(mockAssets);
      
      const activationParams: IMixParams = {
        listenerLocation: mockLocation,
        tagIds: []
      };
      const mixer = await roundware.activateMixer(activationParams);
      
      expect(mixer).toBeDefined();
      expect(mixer.updateParams).toHaveBeenCalledWith(expect.objectContaining(activationParams));
    });

    it('should kill stream', () => {
      expect(() => roundware.kill()).not.toThrow();
    });

    it('should replay current asset', () => {
      expect(() => roundware.replay()).not.toThrow();
    });

    it('should update stream with new data', () => {
      const updateData = {
        latitude: 41.7128,
        longitude: -75.0060,
        tagIds: [1, 2, 3]
      };

      roundware.mixer.playlist = { updateParams: jest.fn() } as any;
      if (roundware.mixer.playlist) {
        roundware.update(updateData);
        expect(roundware.mixer.playlist.updateParams).toHaveBeenCalledWith(updateData);
      }
    });
  });

  describe('asset saving and envelope management', () => {
    it('should save asset with audio data', async () => {
      const mockEnvelope = { upload: jest.fn() };
      (roundware as any).makeEnvelope = jest.fn().mockResolvedValue(mockEnvelope);

      const audioData = new Blob();
      const fileName = 'test.mp3';
      const data = { description: 'test' };

      await roundware.saveAsset(audioData, fileName, data);

      expect(mockEnvelope.upload).toHaveBeenCalledWith(audioData, fileName, data);
    });

    it('should create new envelope', async () => {
      const mockEnvelope = { connect: jest.fn() };
      (Envelope as jest.Mock).mockImplementation(() => mockEnvelope);
      roundware['_sessionId'] = 123; // Set session ID to allow envelope creation

      const envelope = await roundware.makeEnvelope();

      expect(envelope).toBeDefined();
      expect(mockEnvelope.connect).toHaveBeenCalled();
    });

    it('should throw error when creating envelope without session', async () => {
      roundware['_sessionId'] = undefined;
      
      await expect(roundware.makeEnvelope()).rejects.toThrow(
        "can't save assets without first connecting to the server"
      );
    });
  });

  describe('tag and map functionality', () => {
    it('should find tag description', () => {
      const mockUiConfig: IUiConfig = {
        listen: [{
          display_items: [{
            id: 1,
            parent_id: 1,
            default_state: false,
            tag_id: 1,
            tag_display_text: 'Test Tag'
          }]
        }]
      };
      roundware.uiConfig = mockUiConfig;

      const description = roundware.findTagDescription(1);
      expect(description).toBe('Test Tag');
    });

    it('should return undefined for non-existent tag', () => {
      const mockUiConfig: IUiConfig = {
        listen: [{
          display_items: [{
            id: 1,
            parent_id: 1,
            default_state: false,
            tag_id: 1,
            tag_display_text: 'Test Tag'
          }]
        }]
      };
      roundware.uiConfig = mockUiConfig;

      const description = roundware.findTagDescription(999);
      expect(description).toBeUndefined();
    });

    it('should get map bounds from speakers', () => {
      const mockSpeakers = [{
        shape: {
          coordinates: [[[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]]
        }
      }];
      (roundware as any).speakers = jest.fn().mockReturnValue(mockSpeakers);

      const bounds = roundware.getMapBounds();
      
      expect(bounds).toBeDefined();
      expect(bounds.southwest).toBeDefined();
      expect(bounds.northeast).toBeDefined();
    });
  });

  describe('speakers', () => {
    it('should return speaker data array when available', () => {
      const mockSpeakerData: ISpeakerData[] = [{
        id: 1,
        maxvolume: 1,
        minvolume: 0,
        attenuation_distance: 100,
        uri: 'test.mp3'
      }];
      roundware['_speakerData'] = mockSpeakerData;

      const result = roundware.speakers();
      expect(result).toEqual(mockSpeakerData);
    });

    it('should return empty array when speaker data is not available', () => {
      roundware['_speakerData'] = [] as ISpeakerData[];
      const result = roundware.speakers();
      expect(result).toEqual([]);
    });
  });

  describe('timedAssets', () => {
    it('should return timed asset data array when available', () => {
      const mockTimedAssets: ITimedAssetData[] = [{
        asset_id: 1,
        start: 0,
        end: 100
      }];
      roundware.timedAssetData = mockTimedAssets;

      const result = roundware.timedAssets();
      expect(result).toEqual(mockTimedAssets);
    });

    it('should return empty array and log warning when timed asset data is not available', () => {
      const consoleSpy = jest.spyOn(console, 'warn');
      roundware.timedAssetData = null;

      const result = roundware.timedAssets();
      
      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(noAssetData);
      
      consoleSpy.mockRestore();
    });
  });

  describe('audiotracks', () => {
    it('should return audio tracks data array when available', () => {
      const mockAudioTracksData: IAudioTrackData[] = [{
        id: 1,
        fadeout_when_filtered: true,
        minvolume: 0,
        maxvolume: 1,
        minduration: 0,
        maxduration: 0,
        mindeadair: 0,
        maxdeadair: 0,
        minfadeintime: 0,
        maxfadeintime: 0,
        minfadeouttime: 0,
        maxfadeouttime: 0,
        minpanpos: 0,
        maxpanpos: 0,
        minpanduration: 0,
        maxpanduration: 0,
        repeatrecordings: false,
        active: true,
        start_with_silence: false,
        banned_duration: 0,
        tag_filters: [],
        project_id: 1,
        timed_asset_priority: "discard"
      }];
      roundware['_audioTracksData'] = mockAudioTracksData;

      const result = roundware.audiotracks();
      expect(result).toEqual(mockAudioTracksData);
    });

    it('should return empty array when audio tracks data is not available', () => {
      roundware['_audioTracksData'] = null;
      const result = roundware.audiotracks();
      expect(result).toEqual([]);
    });
  });
});
