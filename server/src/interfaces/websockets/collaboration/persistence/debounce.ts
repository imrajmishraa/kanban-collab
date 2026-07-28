type AsyncTask = () => Promise<void>;

export class Debouncer {
  private readonly timers = new Map<string, NodeJS.Timeout>();

  debounce(key: string, delay: number, task: AsyncTask): void {
    const existing = this.timers.get(key);

    if (existing) {
      clearTimeout(existing);
    }

    const timeout = setTimeout(async () => {
      this.timers.delete(key);

      try {
        await task();
      } catch {
        // Caller is responsible for logging.
      }
    }, delay);

    this.timers.set(key, timeout);
  }

  cancel(key: string): void {
    const timer = this.timers.get(key);

    if (!timer) {
      return;
    }

    clearTimeout(timer);
    this.timers.delete(key);
  }

  clear(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }

    this.timers.clear();
  }
}
