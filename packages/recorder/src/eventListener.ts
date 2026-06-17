type EventHandler = (event: Record<string, unknown>) => void;

export class EventListener {
  private handlers: Map<string, Set<EventHandler>> = new Map();

  on(eventType: string, handler: EventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);

    return () => {
      this.handlers.get(eventType)?.delete(handler);
    };
  }

  emit(event: Record<string, unknown>): void {
    const handlers = this.handlers.get(event.type as string);
    if (handlers) {
      for (const handler of handlers) {
        handler(event);
      }
    }
  }

  removeAllListeners(): void {
    this.handlers.clear();
  }
}
