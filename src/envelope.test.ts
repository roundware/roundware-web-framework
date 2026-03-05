import { Envelope } from './envelope';
import { ApiClient } from './api-client';
import { GeoPosition } from './geo-position';
import { Roundware } from './roundware';
import { IAudioData, IAssetData } from './types';
import { RoundwareEvents } from './events';
import { Coordinates } from './types';
import { GeoListenMode } from './mixer';

// Mock dependencies
jest.mock('./api-client');
jest.mock('./geo-position');
jest.mock('./roundware');

describe('Envelope', () => {
  let envelope: Envelope;
  let mockApiClient: jest.Mocked<ApiClient>;
  let mockGeoPosition: jest.Mocked<GeoPosition>;
  let mockRoundware: jest.Mocked<Roundware>;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Create mock instances with required constructor arguments
    mockApiClient = new ApiClient('http://test-api') as jest.Mocked<ApiClient>;
    mockGeoPosition = new GeoPosition(window.navigator, {
      geoListenMode: GeoListenMode.AUTOMATIC,
      defaultCoords: { latitude: 0, longitude: 0 }
    }) as jest.Mocked<GeoPosition>;
    
    // Create a minimal Roundware instance with required options
    const mockOptions = {
      serverUrl: 'http://test-api',
      projectId: 1,
      listenerLocation: { latitude: 0, longitude: 0 } as Coordinates,
      assetFilters: {},
      speakerConfig: { mode: 'stream' as const },
      deviceId: 'test-device',
      geoListenMode: GeoListenMode.AUTOMATIC
    };
    
    mockRoundware = new Roundware(mockOptions) as jest.Mocked<Roundware>;

    // The upload() method accesses _projectId, updateAssetPool, and events on the roundware instance
    (mockRoundware as any)._projectId = 1;
    mockRoundware.updateAssetPool = jest.fn().mockResolvedValue(undefined);
    mockRoundware.events = { logEvent: jest.fn() } as any;

    // Initialize the envelope
    envelope = new Envelope(123, mockApiClient, mockGeoPosition, mockRoundware);
  });

  describe('constructor', () => {
    it('should initialize with correct values', () => {
      expect(envelope['_sessionId']).toBe(123);
      expect(envelope['_apiClient']).toBe(mockApiClient);
      expect(envelope['_geoPosition']).toBe(mockGeoPosition);
      expect(envelope['_roundware']).toBe(mockRoundware);
      expect(envelope['_envelopeId']).toBe('(unknown)');
    });
  });

  describe('toString', () => {
    it('should return correct string representation', () => {
      expect(envelope.toString()).toBe('Envelope undefined');
    });
  });

  describe('connect', () => {
    it('should successfully connect and set envelope ID', async () => {
      const mockResponse = { id: 'test-envelope-id' };
      mockApiClient.post.mockResolvedValue(mockResponse);

      await envelope.connect();

      expect(mockApiClient.post).toHaveBeenCalledWith('/envelopes/', {
        session_id: 123
      });
      expect(envelope['_envelopeId']).toBe('test-envelope-id');
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      mockApiClient.post.mockRejectedValue(error);

      await expect(envelope.connect()).rejects.toThrow('API Error');
    });
  });

  describe('upload', () => {
    const mockAudioData = {} as IAudioData;
    const mockFileName = 'test.mp3';
    const mockCoordinates = { latitude: 40.7128, longitude: -74.0060 };

    it('should throw error if envelope ID is falsy', async () => {
      // Reset any existing mock behavior
      jest.clearAllMocks();
      envelope['_envelopeId'] = '';

      await expect(envelope.upload(mockAudioData, mockFileName))
        .rejects
        .toEqual('cannot upload audio without first connecting this envelope to the server');

      // Verify that the API client was never called for upload
      expect(mockApiClient.post).not.toHaveBeenCalled();
    });

    beforeEach(() => {
      envelope['_envelopeId'] = 'test-envelope-id';
      mockGeoPosition.getLastCoords.mockReturnValue(mockCoordinates);

      // Create a minimal IAssetData object with all required v3 properties
      const mockAsset: IAssetData = {
        id: 1,
        description: '',
        latitude: 0,
        longitude: 0,
        file: null,
        volume: 0,
        submitted: false,
        created_at: '',
        updated_at: '',
        weight: 0,
        start_time: 0,
        end_time: 0,
        media_type: '',
        audio_length_sec: 0,
        tag_ids: [],
        session_id: 123,
        language_id: 1,
        envelope_id: 1
      };

      // v3: upload goes to POST /assets/ and returns the asset directly
      mockApiClient.post.mockResolvedValue(mockAsset);

      mockRoundware.assetData = [mockAsset];

      // Create a RoundwareEvents instance
      const mockEvents = new RoundwareEvents(123, mockApiClient);
      mockRoundware.events = mockEvents;
    });

    it('should successfully upload audio with default coordinates', async () => {
      await envelope.upload(mockAudioData, mockFileName);

      // v3: upload goes to POST /assets/ instead of PATCH /envelopes/{id}/
      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/assets/',
        expect.any(FormData),
        { contentType: 'multipart/form-data' }
      );

      const formData = mockApiClient.post.mock.calls[0][1] as FormData;
      expect(formData.get('session_id')).toBe('123');
      expect(formData.get('envelope_id')).toBe('test-envelope-id');
      expect(formData.get('file')).toBe('[object Object]');
      expect(formData.get('latitude')).toBe(mockCoordinates.latitude.toString());
      expect(formData.get('longitude')).toBe(mockCoordinates.longitude.toString());
    });

    it('should use provided coordinates when available', async () => {
      const customCoords = { latitude: 51.5074, longitude: -0.1278 };
      await envelope.upload(mockAudioData, mockFileName, customCoords);

      // Find the POST /assets/ call (skip the earlier POST /envelopes/ mock from connect)
      const assetPostCalls = mockApiClient.post.mock.calls.filter(
        (call) => call[0] === '/assets/'
      );
      const formData = assetPostCalls[0][1] as FormData;
      expect(formData.get('latitude')).toBe(customCoords.latitude.toString());
      expect(formData.get('longitude')).toBe(customCoords.longitude.toString());
    });

    it('should handle tag IDs correctly', async () => {
      const tagIds = [1, 2, 3];
      await envelope.upload(mockAudioData, mockFileName, { tag_ids: tagIds });

      const assetPostCalls = mockApiClient.post.mock.calls.filter(
        (call) => call[0] === '/assets/'
      );
      const formData = assetPostCalls[0][1] as FormData;
      expect(formData.get('tag_ids')).toBe('1,2,3');
    });

    it('should handle non-array tag IDs correctly', async () => {
      const tagId = 1;
      await envelope.upload(mockAudioData, mockFileName, { tag_ids: tagId as any });

      const assetPostCalls = mockApiClient.post.mock.calls.filter(
        (call) => call[0] === '/assets/'
      );
      const formData = assetPostCalls[0][1] as FormData;
      expect(formData.get('tag_ids')).toBe('1');
    });

    it('should handle media type', async () => {
      const mediaType = 'audio/mp3';
      await envelope.upload(mockAudioData, mockFileName, { media_type: mediaType });

      const assetPostCalls = mockApiClient.post.mock.calls.filter(
        (call) => call[0] === '/assets/'
      );
      const formData = assetPostCalls[0][1] as FormData;
      expect(formData.get('media_type')).toBe(mediaType);
    });

    it('should throw error if envelope is not connected', async () => {
      envelope['_envelopeId'] = '';

      await expect(envelope.upload(mockAudioData, mockFileName))
        .rejects
        .toEqual('cannot upload audio without first connecting this envelope to the server');
    });

    it('should update asset pool and log event on successful upload', async () => {
      // Mock the events object with a jest mock function
      const mockLogEvent = jest.fn();
      mockRoundware.events = { logEvent: mockLogEvent } as any;

      // v3: POST /assets/ returns the created asset directly
      const createdAsset: IAssetData = {
        id: 42,
        description: '',
        latitude: 0,
        longitude: 0,
        file: null,
        volume: 0,
        submitted: false,
        created_at: '',
        updated_at: '',
        weight: 0,
        start_time: 0,
        end_time: 0,
        media_type: '',
        audio_length_sec: 0,
        tag_ids: [],
        session_id: 123,
        language_id: 1,
        envelope_id: 1
      };
      mockApiClient.post.mockResolvedValue(createdAsset);

      await envelope.upload(mockAudioData, mockFileName);

      expect(mockRoundware.updateAssetPool).toHaveBeenCalled();
      expect(mockLogEvent).toHaveBeenCalledWith('upload_asset', {
        data: 'asset_id:42'
      });
    });

    it('should handle API errors', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Upload failed'));

      await expect(envelope.upload(mockAudioData, mockFileName))
        .rejects
        .toThrow('Upload failed');
    });
  });
});
