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
        
      // Verify that the API client was never called
      expect(mockApiClient.patch).not.toHaveBeenCalled();
    });

    beforeEach(() => {
      envelope['_envelopeId'] = 'test-envelope-id';
      mockGeoPosition.getLastCoords.mockReturnValue(mockCoordinates);
      mockApiClient.patch.mockResolvedValue({
        detail: '',
        envelope_ids: [1]
      });
      
      // Create a minimal IAssetData object with all required properties
      const mockAsset: IAssetData = {
        id: 1,
        description: '',
        latitude: 0,
        longitude: 0,
        filename: '',
        file: null,
        volume: 0,
        submitted: false,
        created: '',
        updated: '',
        weight: 0,
        start_time: 0,
        end_time: 0,
        media_type: '',
        audio_length_in_seconds: 0,
        tag_ids: [],
        session_id: 123,
        language_id: 1,
        envelope_ids: [1],
        description_loc_ids: [],
        alt_text_loc_ids: []
      };
      
      mockRoundware.assetData = [mockAsset];
      
      // Create a RoundwareEvents instance
      const mockEvents = new RoundwareEvents(123, mockApiClient);
      mockRoundware.events = mockEvents;
    });

    it('should successfully upload audio with default coordinates', async () => {
      await envelope.upload(mockAudioData, mockFileName);

      expect(mockApiClient.patch).toHaveBeenCalledWith(
        '/envelopes/test-envelope-id/',
        expect.any(FormData),
        { contentType: 'multipart/form-data' }
      );

      const formData = mockApiClient.patch.mock.calls[0][1] as FormData;
      expect(formData.get('session_id')).toBe('123');
      expect(formData.get('file')).toBe('[object Object]');
      expect(formData.get('latitude')).toBe(mockCoordinates.latitude.toString());
      expect(formData.get('longitude')).toBe(mockCoordinates.longitude.toString());
    });

    it('should use provided coordinates when available', async () => {
      const customCoords = { latitude: 51.5074, longitude: -0.1278 };
      await envelope.upload(mockAudioData, mockFileName, customCoords);

      const formData = mockApiClient.patch.mock.calls[0][1] as FormData;
      expect(formData.get('latitude')).toBe(customCoords.latitude.toString());
      expect(formData.get('longitude')).toBe(customCoords.longitude.toString());
    });

    it('should handle tag IDs correctly', async () => {
      const tagIds = [1, 2, 3];
      await envelope.upload(mockAudioData, mockFileName, { tag_ids: tagIds });

      const formData = mockApiClient.patch.mock.calls[0][1] as FormData;
      expect(formData.get('tag_ids')).toBe('1,2,3');
    });

    it('should handle non-array tag IDs correctly', async () => {
      const tagId = 1;
      await envelope.upload(mockAudioData, mockFileName, { tag_ids: tagId as any });

      const formData = mockApiClient.patch.mock.calls[0][1] as FormData;
      expect(formData.get('tag_ids')).toBe('1');
    });

    it('should handle media type', async () => {
      const mediaType = 'audio/mp3';
      await envelope.upload(mockAudioData, mockFileName, { media_type: mediaType });

      const formData = mockApiClient.patch.mock.calls[0][1] as FormData;
      expect(formData.get('media_type')).toBe(mediaType);
    });

    it('should throw error if envelope is not connected', async () => {
      envelope['_envelopeId'] = '(unknown)';
      mockApiClient.patch.mockRejectedValue(new Error('cannot upload audio without first connecting this envelope to the server'));
      
      await expect(envelope.upload(mockAudioData, mockFileName))
        .rejects
        .toThrow('cannot upload audio without first connecting this envelope to the server');
    });

    it('should update asset pool and log event on successful upload', async () => {
      // Mock the events object with a jest mock function
      const mockLogEvent = jest.fn();
      mockRoundware.events = { logEvent: mockLogEvent } as any;

      // Set up mock response with envelope_ids that match the mockAsset
      mockApiClient.patch.mockResolvedValue({
        detail: '',
        envelope_ids: [1] // Matches mockAsset.envelope_ids
      });

      await envelope.upload(mockAudioData, mockFileName);

      expect(mockRoundware.updateAssetPool).toHaveBeenCalled();
      expect(mockLogEvent).toHaveBeenCalledWith('upload_asset', {
        data: 'asset_id:1'
      });
    });

    it('should handle case when no asset is found after upload', async () => {
      // Mock the events object with a jest mock function
      const mockLogEvent = jest.fn();
      mockRoundware.events = { logEvent: mockLogEvent } as any;
      
      // Set up mock response with envelope_ids that don't match any asset
      mockApiClient.patch.mockResolvedValue({
        detail: '',
        envelope_ids: [999] // Different from mockAsset.envelope_ids
      });

      await envelope.upload(mockAudioData, mockFileName);

      expect(mockRoundware.updateAssetPool).toHaveBeenCalled();
      expect(mockLogEvent).not.toHaveBeenCalled();
    });

    it('should handle API errors', async () => {
      const error = new Error('Upload failed');
      mockApiClient.patch.mockResolvedValue({ detail: 'Upload failed', envelope_ids: [] });

      await expect(envelope.upload(mockAudioData, mockFileName))
        .rejects
        .toThrow('Upload failed');
    });
  });
});
