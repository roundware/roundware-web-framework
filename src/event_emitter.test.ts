import { EventEmitter } from './event_emitter';

describe('EventEmitter', () => {
  // Define a test event map
  type TestEvents = {
    'test': (data: string) => void;
    'number': (value: number) => void;
    'multiple': (str: string, num: number) => void;
  };

  let emitter: EventEmitter<TestEvents>;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    emitter = new EventEmitter<TestEvents>();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  describe('on', () => {
    it('should register event listeners', () => {
      const listener = jest.fn();
      emitter.on('test', listener);
      emitter.emit('test', 'hello');
      expect(listener).toHaveBeenCalledWith('hello');
    });

    it('should allow multiple listeners for the same event', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      emitter.on('test', listener1);
      emitter.on('test', listener2);
      emitter.emit('test', 'hello');
      expect(listener1).toHaveBeenCalledWith('hello');
      expect(listener2).toHaveBeenCalledWith('hello');
    });

    it('should handle empty event arrays', () => {
      const listener = jest.fn();
      emitter.on('test', listener);
      emitter.off('test', listener);
      emitter.emit('test', 'hello');
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('off', () => {
    it('should remove event listeners', () => {
      const listener = jest.fn();
      emitter.on('test', listener);
      emitter.off('test', listener);
      emitter.emit('test', 'hello');
      expect(listener).not.toHaveBeenCalled();
    });

    it('should handle removing non-existent listeners gracefully', () => {
      const listener = jest.fn();
      emitter.off('test', listener);
      emitter.emit('test', 'hello');
      expect(listener).not.toHaveBeenCalled();
    });

    it('should warn when trying to remove a non-existent listener', () => {
      const listener = jest.fn();
      emitter.on('test', jest.fn());
      emitter.off('test', listener);
      expect(consoleWarnSpy).toHaveBeenCalledWith('listener not found while removing', listener);
    });

    it('should handle removing listeners from non-existent events', () => {
      const listener = jest.fn();
      emitter.off('nonexistent' as keyof TestEvents, listener);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('emit', () => {
    it('should emit events with correct arguments', () => {
      const listener = jest.fn();
      emitter.on('multiple', listener);
      emitter.emit('multiple', 'hello', 42);
      expect(listener).toHaveBeenCalledWith('hello', 42);
    });

    it('should handle events with no listeners', () => {
      const listener = jest.fn();
      emitter.emit('test', 'hello');
      expect(listener).not.toHaveBeenCalled();
    });

    it('should handle different event types', () => {
      const stringListener = jest.fn();
      const numberListener = jest.fn();
      emitter.on('test', stringListener);
      emitter.on('number', numberListener);
      emitter.emit('test', 'hello');
      emitter.emit('number', 42);
      expect(stringListener).toHaveBeenCalledWith('hello');
      expect(numberListener).toHaveBeenCalledWith(42);
    });

    it('should handle empty event arrays during emission', () => {
      emitter.emit('test', 'hello');
      // Should not throw any errors
    });
  });

  describe('clearListeners', () => {
    it('should clear all listeners for a given event', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      emitter.on('test', listener1);
      emitter.on('test', listener2);
      
      emitter.clearListeners('test');
      emitter.emit('test', 'hello');
      
      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });

    it('should handle clearing listeners for non-existent events', () => {
      expect(() => {
        emitter.clearListeners('nonexistent' as keyof TestEvents);
      }).not.toThrow();
    });

    it('should only clear listeners for the specified event', () => {
      const testListener = jest.fn();
      const numberListener = jest.fn();
      
      emitter.on('test', testListener);
      emitter.on('number', numberListener);
      
      emitter.clearListeners('test');
      emitter.emit('test', 'hello');
      emitter.emit('number', 42);
      
      expect(testListener).not.toHaveBeenCalled();
      expect(numberListener).toHaveBeenCalledWith(42);
    });
  });
});
