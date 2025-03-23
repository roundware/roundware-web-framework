import { noAssetData } from './warning';

describe('Warning Constants', () => {
  describe('noAssetData', () => {
    it('should contain the correct error message', () => {
      expect(noAssetData).toBe(
        'No Asset Data was found! This may happen when accessing asset data before fetching from API.'
      );
    });

    it('should be a non-empty string', () => {
      expect(typeof noAssetData).toBe('string');
      expect(noAssetData.length).toBeGreaterThan(0);
    });

    it('should be immutable', () => {
      const originalMessage = noAssetData;
      try {
        (noAssetData as any) = 'New message';
      } catch (e) {
      }
      expect(noAssetData).toBe(originalMessage);
    });
  });
});
