type AsyncTask = () => Promise<void>;

interface PendingTask {
  timer: NodeJS.Timeout;
  task: AsyncTask;
}

export class Debouncer {
  private readonly tasks = new Map<string, PendingTask>();

  /**
   * Schedules a task.
   * If another task with the same key exists,
   * it is replaced.
   */
  public debounce(key: string, delay: number, task: AsyncTask): void {
    const existing = this.tasks.get(key);

    if (existing) {
      clearTimeout(existing.timer);
    }

    const timer = setTimeout(async () => {
      this.tasks.delete(key);

      try {
        await task();
      } catch {
        // caller is responsible for logging
      }
    }, delay);

    this.tasks.set(key, {
      timer,
      task,
    });
  }

  //  Cancels a pending task.
  public cancel(key: string): void {
    const pending = this.tasks.get(key);

    if (!pending) {
      return;
    }

    clearTimeout(pending.timer);
    this.tasks.delete(key);
  }

  // Immediately executes one pending task.
  public async flush(key: string): Promise<void> {
    const pending = this.tasks.get(key);

    if (!pending) {
      return;
    }

    clearTimeout(pending.timer);
    this.tasks.delete(key);

    await pending.task();
  }

  //  Immediately executes every pending task.
  //  Used during graceful shutdown.
  public async flushAll(): Promise<void> {
    const pendingTasks = [...this.tasks.entries()];

    this.tasks.clear();

    await Promise.all(
      pendingTasks.map(async ([, pending]) => {
        clearTimeout(pending.timer);

        try {
          await pending.task();
        } catch {
          // Caller is responsible for logging.
        }
      }),
    );
  }

  //  Cancels all pending tasks without executing them.
  public cancelAll(): void {
    for (const { timer } of this.tasks.values()) {
      clearTimeout(timer);
    }

    this.tasks.clear();
  }
}
