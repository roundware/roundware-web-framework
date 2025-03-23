type EventMap = Record<string, (...args: any[]) => void>;

export class EventEmitter<T extends EventMap> {
  private events: { [K in keyof T]?: T[K][] } = {};

  // Add an event listener
  on<K extends keyof T>(event: K, listener: T[K]): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event]!.push(listener);
  }

  // Remove an event listener
  off<K extends keyof T>(event: K, listener: T[K]): void {
    if (!this.events[event]) return;
    const previousLength = this.events[event]!.length;
    this.events[event] = this.events[event]!.filter((l) => l !== listener);
    const currentLength = this.events[event]!.length;
    if (previousLength === currentLength) {
      console.warn("listener not found while removing", listener);
    }
  }

  // Emit an event
  emit<K extends keyof T>(event: K, ...args: Parameters<T[K]>): void {
    // console.log(this.toString(), "emitted", event);

    console.debug(
      `${this.toString()} emitted ${event.toString()}`,...args,
    );

    if (!this.events[event]) return;
    this.events[event]!.forEach((listener) => listener(...args));
  }
}
