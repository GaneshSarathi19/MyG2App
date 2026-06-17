import { logger } from '../utils/logger';

/**
 * Typed API error for structured error handling.
 */
export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

interface ApiConfig {
  headers?: Record<string, string>;
  /** Request timeout in milliseconds. Default: 10000 */
  timeout?: number;
}

/**
 * Generic POST wrapper with logging, timeout, and error handling.
 *
 * @param url - Full request URL.
 * @param body - Request payload.
 * @param config - Optional headers and timeout.
 * @returns Typed response data.
 * @throws ApiError on non-2xx status or network failure.
 */
export const post = async <T>(
  url: string,
  body: unknown,
  config?: ApiConfig,
): Promise<{ data: T; status: number }> => {
  const abortController = new AbortController();
  const timeoutMs = config?.timeout ?? 10000;
  const timer = setTimeout(() => abortController.abort(), timeoutMs);

  // Log outgoing request
  logger.log(`[API Request] POST ${url}`);
  logger.log(`[API Request Body]`, JSON.stringify(body, null, 2));

  try {
    const response = await fetch(url, {//axios
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config?.headers ?? {}),
      },
      body: JSON.stringify(body),
      signal: abortController.signal,
    });

    const rawText = await response.text();

    if (!rawText) {
      logger.log(`[API Response] ${response.status} (empty body)`);
      // Some backends return 200 with empty body
      return { data: undefined as unknown as T, status: response.status };
    }

    let data: T;
    try {
      data = JSON.parse(rawText) as T;
    } catch {
      logger.log(`[API Response] ${response.status} (non-JSON) RAW:`, rawText.slice(0, 500));
      throw new ApiError(
        `Non-JSON response (HTTP ${response.status}): ${rawText.slice(0, 200)}`,
        response.status,
        rawText,
      );
    }

    // Log parsed response
    logger.log(`[API Response] ${response.status}`, JSON.stringify(data, null, 2));

    if (!response.ok) {
      throw new ApiError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        data,
      );
    }

    return { data, status: response.status };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timeout', 0, { url });
    }

    const message = error instanceof Error ? error.message : 'Network request failed';
    logger.error(`[API Error] POST ${url}:`, message);
    throw new ApiError(message, 0, null);
  } finally {
    clearTimeout(timer);
  }
};
