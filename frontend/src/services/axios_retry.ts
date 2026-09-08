import { AxiosError } from "axios";

type RetryFn<T> = () => Promise<T>;
const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const isAxiosError = (error: unknown): error is AxiosError => {
  return typeof error === "object" && error !== null && "isAxiosError" in error;
};

export const retryRequest = async <T>(
  fn: RetryFn<T>,
  retries: number = 3,
  delay: number = 500
): Promise<T> => {
  try {
    return await fn();
  } catch (err: unknown) {
    if (retries <= 0) {
      throw err;
    }

    let shouldRetry = false;

    if (isAxiosError(err)) {
      // Retry for network errors OR 5xx
      shouldRetry =
        !err.response ||
        (err.response.status >= 500 && err.response.status < 600);
    }

    if (!shouldRetry) {
      throw err;
    }

    console.log(`Retrying... attempts left: ${retries}`);

    await wait(delay);

    return retryRequest(fn, retries - 1, delay * 2); // exponential backoff
  }
};
