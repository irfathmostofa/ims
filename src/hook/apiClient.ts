type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface ApiOptions<T = any> {
  method?: HttpMethod;
  data?: T;
  tokenType?: "jwt" | "barrier";
  headers?: Record<string, string>;
  timeout?: number; // Timeout in milliseconds
  retries?: number; // Number of retry attempts
  cacheKey?: string; // For caching responses
  cacheTTL?: number; // Cache time-to-live in milliseconds
  signal?: AbortSignal; // For request cancellation
}

interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: any;
}

// Simple in-memory cache (consider using a more robust solution for production)
const responseCache = new Map<string, { data: any; timestamp: number }>();

export async function apiClient<T = any>(
  url: string,
  options: ApiOptions = {}
): Promise<T> {
  const {
    method = "GET",
    data,
    tokenType,
    headers = {},
    timeout = 10000, // 10 seconds default
    retries = 0,
    cacheKey,
    cacheTTL = 30000, // 30 seconds default
    signal,
  } = options;

  // Check cache for GET requests
  if (method === "GET" && cacheKey) {
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cacheTTL) {
      return cached.data;
    }
  }

  const controller = new AbortController();
  const abortSignal = signal || controller.signal;
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // Cleanup function
  const cleanup = () => {
    clearTimeout(timeoutId);
  };

  const isFormData = data instanceof FormData;

  // Get tokens (using a function to allow SSR compatibility)
  const getToken = (type: "jwt" | "barrier") => {
    if (typeof window === "undefined") return null; // SSR safety

    if (type === "jwt") {
      return localStorage.getItem("token");
    } else {
      return localStorage.getItem("barrierToken");
    }
  };

  const jwtToken = tokenType === "jwt" ? getToken("jwt") : null;
  const barrierToken = tokenType === "barrier" ? getToken("barrier") : null;

  // Build headers
  const requestHeaders: HeadersInit = {
    ...(!isFormData && { "Content-Type": "application/json" }),
    ...(jwtToken && { Authorization: `Bearer ${jwtToken}` }),
    ...(barrierToken && { Authorization: `Barrier ${barrierToken}` }),
    ...headers,
  };

  // Remove Content-Type if FormData is empty
  if (isFormData && data && (data as FormData).entries().next().done) {
    delete requestHeaders["Content-Type"];
  }

  const makeRequest = async (attempt = 0): Promise<T> => {
    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: isFormData ? data : data ? JSON.stringify(data) : undefined,
        signal: abortSignal,
      });

      cleanup();

      if (!response.ok) {
        let errorData: any;
        const contentType = response.headers.get("content-type");

        try {
          if (contentType && contentType.includes("application/json")) {
            errorData = await response.json();
          } else {
            errorData = {
              message: (await response.text()) || response.statusText,
            };
          }
        } catch {
          errorData = { message: response.statusText };
        }

        const error: ApiError = new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
        error.status = response.status;
        error.code = errorData.code;
        error.details = errorData.details || errorData;

        // Don't retry 4xx errors (client errors)
        if (
          response.status >= 400 &&
          response.status < 500 &&
          response.status !== 408
        ) {
          throw error;
        }

        // Retry on 5xx errors or timeout (408)
        if (
          attempt < retries &&
          (response.status >= 500 || response.status === 408)
        ) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000); // Exponential backoff
          await new Promise((resolve) => setTimeout(resolve, delay));
          return makeRequest(attempt + 1);
        }

        throw error;
      }

      if (response.status === 204) {
        return null as any;
      }

      const contentType = response.headers.get("content-type");
      let result: any;

      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        result = await response.text();
      }

      // Cache the response for GET requests
      if (method === "GET" && cacheKey) {
        responseCache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
        });

        // Clean old cache entries periodically
        if (responseCache.size > 100) {
          const now = Date.now();
          for (const [key, value] of responseCache.entries()) {
            if (now - value.timestamp > 5 * 60 * 1000) {
              // 5 minutes
              responseCache.delete(key);
            }
          }
        }
      }

      return result;
    } catch (error: any) {
      cleanup();

      // Handle abort errors
      if (error.name === "AbortError") {
        const abortError: ApiError = new Error(
          `Request timeout after ${timeout}ms`
        );
        abortError.code = "TIMEOUT";
        throw abortError;
      }

      // Retry on network errors
      if (attempt < retries && !error.status) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return makeRequest(attempt + 1);
      }

      throw error;
    }
  };

  return makeRequest();
}

// Utility function to clear cache
export function clearApiCache(key?: string) {
  if (key) {
    responseCache.delete(key);
  } else {
    responseCache.clear();
  }
}

// Create a cancelable request helper
export function createCancelableRequest() {
  const controller = new AbortController();

  return {
    signal: controller.signal,
    cancel: () => controller.abort(),
    request: <T = any>(url: string, options?: Omit<ApiOptions, "signal">) =>
      apiClient<T>(url, { ...options, signal: controller.signal }),
  };
}
