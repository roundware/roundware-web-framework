export class Logger {
  log(...optionalParams: any[]): void {
    const className = this.constructor.name;
    console.log(`[${className}]: `, ...optionalParams);
  }

  warn(...optionalParams: any[]): void {
    const className = this.constructor.name;
    console.warn(`[${className}]: `, ...optionalParams);
  }
}
