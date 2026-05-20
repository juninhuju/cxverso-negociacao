export interface BffResponse<T> {
  readonly data: T;
  readonly correlationId: string;
  readonly timestamp: string;
}

export interface BffError {
  readonly code: string;
  readonly message: string;
  readonly correlationId: string;
}
