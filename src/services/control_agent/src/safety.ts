export class SafetyManager {
  private lastCommandAt = 0;
  private stopAcknowledged = false;

  constructor(private readonly commandTimeoutMs: number) {}

  markCommand(): void {
    this.lastCommandAt = Date.now();
    this.stopAcknowledged = false;
  }

  acknowledgeStop(): void {
    this.stopAcknowledged = true;
  }

  shouldStop(now = Date.now()): boolean {
    if (this.lastCommandAt === 0) {
      return true;
    }
    return now - this.lastCommandAt > this.commandTimeoutMs;
  }

  needsStop(now = Date.now()): boolean {
    return this.shouldStop(now) && !this.stopAcknowledged;
  }
}
