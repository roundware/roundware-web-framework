import { Logger } from './Logger';

describe('Logger', () => {
  let logger: Logger;
  let consoleSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new Logger();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    warnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('log method', () => {
    it('should log message with class name', () => {
      logger.log('test message');
      
      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith('[Logger]: ', 'test message');
    });

    it('should handle multiple parameters', () => {
      logger.log('message', 123, { key: 'value' });
      
      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Logger]: ',
        'message',
        123,
        { key: 'value' }
      );
    });

    it('should handle no parameters', () => {
      logger.log();
      
      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith('[Logger]: ');
    });
  });

  describe('warn method', () => {
    it('should warn message with class name', () => {
      logger.warn('test warning');
      
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledWith('[Logger]: ', 'test warning');
    });

    it('should handle multiple parameters', () => {
      logger.warn('warning', 456, { error: 'test' });
      
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledWith(
        '[Logger]: ',
        'warning',
        456,
        { error: 'test' }
      );
    });

    it('should handle no parameters', () => {
      logger.warn();
      
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledWith('[Logger]: ');
    });
  });

  describe('class inheritance', () => {
    class CustomLogger extends Logger {}

    it('should use the correct class name when inherited', () => {
      const customLogger = new CustomLogger();
      customLogger.log('test');
      
      expect(consoleSpy).toHaveBeenCalledWith('[CustomLogger]: ', 'test');
    });
  });
});
