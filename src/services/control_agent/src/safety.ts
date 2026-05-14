export class SafetyManager {
  private lastCommandAt = 0;

  constructor(private readonly commandTimeoutMs: number) {}

  markCommand(): void {
    this.lastCommandAt = Date.now();
  }

  shouldStop(now = Date.now()): boolean {
    if (this.lastCommandAt === 0) {
      return true;
    }
    return now - this.lastCommandAt > this.commandTimeoutMs;
  }
}
