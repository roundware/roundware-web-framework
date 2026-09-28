import { AssetBundle } from './bundle';
import { ApiClient } from './api-client';
import { GeoPosition } from './geo-position';
import { Roundware } from './roundware';
import { IAudioData, IAssetData } from './types';
import { Coordinates } from './types';
import { GeoListenMode } from './mixer';

// Mock dependencies
jest.mock('./api-client');
jest.mock('./geo-position');
jest.mock('./roundware');

const makeAsset = (id: number, overrides: Partial<IAssetData> = {}): IAssetData => ({
  id,
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
  parent_asset_id: null,
  ...overrides,
});

/** The FormData of every POST /assets/ call, in order. */
const assetPosts = (api: jest.Mocked<ApiClient>) =>
  api.post.mock.calls.filter((c) => c[0] === '/assets/').map((c) => c[1] as FormData);

describe('AssetBundle', () => {
  let bundle: AssetBundle;
  let mockApiClient: jest.Mocked<ApiClient>;
  let mockGeoPosition: jest.Mocked<GeoPosition>;
  let mockRoundware: jest.Mocked<Roundware>;
  const mockAudioData = {} as IAudioData;
  const mockCoordinates = { latitude: 40.7128, longitude: -74.006 };

  beforeEach(() => {
    jest.clearAllMocks();

    mockApiClient = new ApiClient('http://test-api') as jest.Mocked<ApiClient>;
    mockGeoPosition = new GeoPosition(window.navigator, {
      geoListenMode: GeoListenMode.AUTOMATIC,
      defaultCoords: { latitude: 0, longitude: 0 },
    }) as jest.Mocked<GeoPosition>;
    mockGeoPosition.getLastCoords.mockReturnValue(mockCoordinates);

    mockRoundware = new Roundware({
      serverUrl: 'http://test-api',
      projectId: 1,
      listenerLocation: { latitude: 0, longitude: 0 } as Coordinates,
      assetFilters: {},
      speakerConfig: { mode: 'stream' as const },
      deviceId: 'test-device',
      geoListenMode: GeoListenMode.AUTOMATIC,
    }) as jest.Mocked<Roundware>;
    (mockRoundware as any)._projectId = 1;
    mockRoundware.updateAssetPool = jest.fn().mockResolvedValue(undefined);
    mockRoundware.events = { logEvent: jest.fn() } as any;

    // Each POST /assets/ returns the next id: 1, 2, 3, ...
    let nextId = 1;
    mockApiClient.post.mockImplementation(async () => makeAsset(nextId++));

    bundle = new AssetBundle(123, mockApiClient, mockGeoPosition, mockRoundware);
  });

  it('sends nothing to the server until the first upload', () => {
    expect(mockApiClient.post).not.toHaveBeenCalled();
  });

  it('never creates an envelope', async () => {
    await bundle.upload(mockAudioData, 'a.mp3');
    await bundle.upload(mockAudioData, 'b.jpg', { media_type: 'photo' });
    expect(mockApiClient.post.mock.calls.map((c) => c[0])).toEqual(['/assets/', '/assets/']);
  });

  describe('the main asset and its attachments', () => {
    it('makes the first upload the main asset, with no parent', async () => {
      await bundle.upload(mockAudioData, 'a.mp3');
      const [first] = assetPosts(mockApiClient);
      expect(first.get('parent_asset_id')).toBeNull();
      expect(first.get('envelope_id')).toBeNull();
    });

    it('attaches every later upload to the main asset', async () => {
      const main = await bundle.upload(mockAudioData, 'a.mp3');
      await bundle.upload(mockAudioData, 'photo.jpg', { media_type: 'photo' });
      await bundle.upload(mockAudioData, 'note.txt', { media_type: 'text' });

      const [, photo, text] = assetPosts(mockApiClient);
      expect(photo.get('parent_asset_id')).toBe(String(main.id));
      expect(text.get('parent_asset_id')).toBe(String(main.id));
    });

    it('lets any media type be the main asset', async () => {
      const photo = await bundle.upload(mockAudioData, 'photo.jpg', { media_type: 'photo' });
      await bundle.upload(mockAudioData, 'a.mp3', { media_type: 'audio' });
      expect(assetPosts(mockApiClient)[1].get('parent_asset_id')).toBe(String(photo.id));
    });

    it('makes parallel attachments wait for the main asset rather than race it', async () => {
      // The web app uploads the recording, then photos and text in parallel.
      let finishMain!: (a: IAssetData) => void;
      mockApiClient.post
        .mockImplementationOnce(() => new Promise((resolve) => (finishMain = resolve)))
        .mockImplementation(async () => makeAsset(99));

      const mainUpload = bundle.upload(mockAudioData, 'a.mp3');
      const photoUpload = bundle.upload(mockAudioData, 'p.jpg', { media_type: 'photo' });
      const textUpload = bundle.upload(mockAudioData, 't.txt', { media_type: 'text' });

      await Promise.resolve();
      expect(assetPosts(mockApiClient)).toHaveLength(1); // attachments are waiting

      finishMain(makeAsset(7));
      await Promise.all([mainUpload, photoUpload, textUpload]);

      const [, photo, text] = assetPosts(mockApiClient);
      expect(photo.get('parent_asset_id')).toBe('7');
      expect(text.get('parent_asset_id')).toBe('7');
    });

    it('fails attachments when the main upload fails, rather than orphaning them', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Upload failed'));
      const mainUpload = bundle.upload(mockAudioData, 'a.mp3');
      const photoUpload = bundle.upload(mockAudioData, 'p.jpg', { media_type: 'photo' });

      await expect(mainUpload).rejects.toThrow('Upload failed');
      await expect(photoUpload).rejects.toThrow('Upload failed');
      expect(assetPosts(mockApiClient)).toHaveLength(1);
    });

    it('exposes the main asset once it exists', async () => {
      expect(await bundle.primaryAsset()).toBeNull();
      const main = await bundle.upload(mockAudioData, 'a.mp3');
      expect(await bundle.primaryAsset()).toEqual(main);
    });
  });

  describe('each upload', () => {
    it('posts project, session, file and the last known coordinates', async () => {
      await bundle.upload(mockAudioData, 'a.mp3');
      expect(mockApiClient.post).toHaveBeenCalledWith('/assets/', expect.any(FormData), {
        contentType: 'multipart/form-data',
      });
      const [form] = assetPosts(mockApiClient);
      expect(form.get('project_id')).toBe('1');
      expect(form.get('session_id')).toBe('123');
      expect(form.get('file')).toBe('[object Object]');
      expect(form.get('latitude')).toBe(String(mockCoordinates.latitude));
      expect(form.get('longitude')).toBe(String(mockCoordinates.longitude));
    });

    it('uses provided coordinates when given', async () => {
      await bundle.upload(mockAudioData, 'a.mp3', { latitude: 51.5074, longitude: -0.1278 });
      const [form] = assetPosts(mockApiClient);
      expect(form.get('latitude')).toBe('51.5074');
      expect(form.get('longitude')).toBe('-0.1278');
    });

    it('sends tag ids comma-separated', async () => {
      await bundle.upload(mockAudioData, 'a.mp3', { tag_ids: [1, 2, 3] });
      expect(assetPosts(mockApiClient)[0].get('tag_ids')).toBe('1,2,3');
    });

    it('sends the media type', async () => {
      await bundle.upload(mockAudioData, 'p.jpg', { media_type: 'photo' });
      expect(assetPosts(mockApiClient)[0].get('media_type')).toBe('photo');
    });

    it('refreshes the asset pool and logs an event', async () => {
      const asset = await bundle.upload(mockAudioData, 'a.mp3');
      expect(mockRoundware.updateAssetPool).toHaveBeenCalled();
      expect(mockRoundware.events!.logEvent).toHaveBeenCalledWith('upload_asset', {
        data: `asset_id:${asset.id}`,
      });
    });
  });
});
