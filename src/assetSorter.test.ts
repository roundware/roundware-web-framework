import { AssetSorter } from './assetSorter';
import { IAssetData } from './types/asset';
import { sortByProjectDefault } from './sortMethods';

// Mock the sortByProjectDefault function
jest.mock('./sortMethods', () => ({
  sortByProjectDefault: jest.fn()
}));

describe('AssetSorter', () => {
  let mockSortFunction: jest.Mock;
  let assetSorter: AssetSorter;
  let mockAssets: IAssetData[];

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create a mock sort function
    mockSortFunction = jest.fn();
    (sortByProjectDefault as jest.Mock).mockReturnValue(mockSortFunction);

    // Create mock assets
    mockAssets = [
      { id: 1, weight: 1, description: '', latitude: 0, longitude: 0, filename: '', volume: 1, start_time: 0, end_time: 0, created: new Date(), updated: new Date(), file: null, submitted: false, media_type: 'audio', audio_length_in_seconds: 0, tag_ids: [], session_id: 1, language_id: 1, envelope_ids: [], description_loc_ids: [], alt_text_loc_ids: [] },
      { id: 2, weight: 2, description: '', latitude: 0, longitude: 0, filename: '', volume: 1, start_time: 0, end_time: 0, created: new Date(), updated: new Date(), file: null, submitted: false, media_type: 'audio', audio_length_in_seconds: 0, tag_ids: [], session_id: 1, language_id: 1, envelope_ids: [], description_loc_ids: [], alt_text_loc_ids: [] },
      { id: 3, weight: 3, description: '', latitude: 0, longitude: 0, filename: '', volume: 1, start_time: 0, end_time: 0, created: new Date(), updated: new Date(), file: null, submitted: false, media_type: 'audio', audio_length_in_seconds: 0, tag_ids: [], session_id: 1, language_id: 1, envelope_ids: [], description_loc_ids: [], alt_text_loc_ids: [] }
    ];
  });

  describe('constructor', () => {
    it('should initialize with default random ordering when no sort methods provided', () => {
      assetSorter = new AssetSorter({});
      expect(sortByProjectDefault).toHaveBeenCalledWith('random');
      expect(assetSorter.sortMethods).toHaveLength(1);
      expect(assetSorter.sortMethods[0]).toBe(mockSortFunction);
    });

    it('should initialize with specified ordering when provided', () => {
      assetSorter = new AssetSorter({ ordering: 'by_weight' });
      expect(sortByProjectDefault).toHaveBeenCalledWith('by_weight');
      expect(assetSorter.sortMethods).toHaveLength(1);
      expect(assetSorter.sortMethods[0]).toBe(mockSortFunction);
    });

    it('should initialize with multiple sort methods when provided', () => {
      const sortMethods = ['random', 'by_weight', 'by_likes'];
      const mockSortFunctions = sortMethods.map(() => jest.fn());
      (sortByProjectDefault as jest.Mock).mockImplementation((method) => 
        mockSortFunctions[sortMethods.indexOf(method)]
      );

      assetSorter = new AssetSorter({ sortMethods });
      
      expect(sortByProjectDefault).toHaveBeenCalledTimes(3);
      expect(assetSorter.sortMethods).toHaveLength(3);
      expect(assetSorter.sortMethods).toEqual(mockSortFunctions);
    });
  });

  describe('sort', () => {
    it('should apply single sort method to assets', () => {
      assetSorter = new AssetSorter({});
      assetSorter.sort(mockAssets);
      expect(mockSortFunction).toHaveBeenCalledTimes(1);
      expect(mockSortFunction).toHaveBeenCalledWith(mockAssets);
    });

    it('should apply multiple sort methods in sequence', () => {
      const sortMethods = ['random', 'by_weight', 'by_likes'];
      const mockSortFunctions = sortMethods.map(() => jest.fn());
      (sortByProjectDefault as jest.Mock).mockImplementation((method) => 
        mockSortFunctions[sortMethods.indexOf(method)]
      );

      assetSorter = new AssetSorter({ sortMethods });
      assetSorter.sort(mockAssets);

      mockSortFunctions.forEach((mockFn, index) => {
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenCalledWith(mockAssets);
      });
    });
  });
}); 