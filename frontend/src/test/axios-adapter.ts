import { AxiosError, AxiosHeaders, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

/**
 * Builds the value a custom axios adapter must produce. Real adapters apply `validateStatus`
 * themselves, so a non-2xx response has to be thrown as an AxiosError here — that's what makes
 * the response interceptors under test see it exactly as they would in production.
 */
export function respond<T>(config: InternalAxiosRequestConfig, status: number, data?: T): AxiosResponse<T> {
  const response: AxiosResponse<T> = {
    data: data as T,
    status,
    statusText: String(status),
    headers: new AxiosHeaders(),
    config,
  };
  if (status >= 400) {
    throw new AxiosError(`Request failed with status code ${status}`, 'ERR_BAD_RESPONSE', config, null, response);
  }
  return response;
}

/** The Authorization header the adapter actually received (after request interceptors ran). */
export function authHeaderOf(config: InternalAxiosRequestConfig): string | undefined {
  return AxiosHeaders.from(config.headers).get('Authorization')?.toString();
}

export function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

/** Lets every pending promise callback (e.g. queued interceptor handlers) run. */
export function flushPromises(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
