export interface DomainEvent {
  readonly type: string;
  readonly timestamp: Date;
  readonly payload: Record<string, unknown>;
}

export type EventHandler<T extends DomainEvent = DomainEvent> = (event: T) => void | Promise<void>;

export interface EventBus {
  publish<T extends DomainEvent>(event: T): void;
  subscribe<T extends DomainEvent>(eventType: T['type'], handler: EventHandler<T>): void;
  unsubscribe(eventType: string, handler: EventHandler): void;
}
