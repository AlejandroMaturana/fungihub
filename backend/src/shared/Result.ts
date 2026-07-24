class OkImpl<T> {
  readonly _tag = 'Ok' as const;
  constructor(readonly value: T) {}

  isOk(): this is OkImpl<T> { return true; }
  isErr(): this is ErrImpl<never> { return false; }

  map<U>(fn: (value: T) => U): OkImpl<U> {
    return new OkImpl(fn(this.value));
  }

  flatMap<U>(fn: (value: T) => Result<U, never>): OkImpl<U> {
    return fn(this.value) as OkImpl<U>;
  }

  unwrap(): T { return this.value; }
  unwrapOr(_fallback: T): T { return this.value; }
}

class ErrImpl<E> {
  readonly _tag = 'Err' as const;
  constructor(readonly error: E) {}

  isOk(): this is OkImpl<never> { return false; }
  isErr(): this is ErrImpl<E> { return true; }

  map<U>(_fn: (value: never) => U): ErrImpl<E> { return this; }
  mapErr<F>(fn: (error: E) => F): ErrImpl<F> {
    return new ErrImpl(fn(this.error));
  }

  flatMap<U>(_fn: (value: never) => Result<U, E>): ErrImpl<E> { return this; }

  unwrap(): never { throw new Error(`unwrap() called on Err: ${JSON.stringify(this.error)}`); }
  unwrapOr<U>(fallback: U): U { return fallback; }
}

export type Result<T, E> = OkImpl<T> | ErrImpl<E>;

export function Ok<T>(value: T): OkImpl<T> {
  return new OkImpl(value);
}

export function Err<E>(error: E): ErrImpl<E> {
  return new ErrImpl(error);
}

export function isOk<T, E>(result: Result<T, E>): result is OkImpl<T> {
  return result.isOk();
}

export function isErr<T, E>(result: Result<T, E>): result is ErrImpl<E> {
  return result.isErr();
}

export function unwrapFromResult<T, E>(result: Result<T, E>): T {
  if (isOk(result)) return result.value;
  throw new Error(`unwrap() called on Err: ${JSON.stringify(result.error)}`);
}
