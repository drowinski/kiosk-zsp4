// data, ok, error
type Success<T> = [T, true, undefined];
type Failure<E> = [undefined, false, E];

type SafeResult<T, E = Error> = Success<T> | Failure<E>;

export function trySync<T, E = Error>(func: () => T): SafeResult<T, E> {
  try {
    const data = func();
    return [data as T, true, undefined];
  } catch (error) {
    return [undefined, false, error as E];
  }
}

export async function tryAsync<T, E = Error>(promise: Promise<T>): Promise<SafeResult<T, E>> {
  try {
    const data = await promise;
    return [data as T, true, undefined];
  } catch (error) {
    return [undefined, false, error as E];
  }
}
