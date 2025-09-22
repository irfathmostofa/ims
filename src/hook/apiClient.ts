type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface ApiOptions {
  method?: HttpMethod;
  data?: any; // JSON body or FormData
  tokenType?: "jwt" | "barrier"; // optional token type
  headers?: Record<string, string>;
}

export async function apiClient(url: string, options: ApiOptions = {}) {
  const { method = "GET", data, tokenType, headers = {} } = options;

  const jwtToken = localStorage.getItem("token");
  const barrierToken = localStorage.getItem("barrierToken");

  const isFormData = data instanceof FormData;

  // pick correct token
  let authHeader: Record<string, string> = {};
  if (tokenType === "jwt" && jwtToken) {
    authHeader = { Authorization: `Bearer ${jwtToken}` };
  } else if (tokenType === "barrier" && barrierToken) {
    authHeader = { Authorization: `Barrier ${barrierToken}` }; // 👈 or change to custom header if backend requires
    // e.g. authHeader = { "x-barrier-token": barrierToken }
  }

  const response = await fetch(url, {
    method,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...authHeader,
      ...headers,
    },
    body: isFormData ? data : data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    throw new Error(error.message || "API Error");
  }

  if (response.status === 204) return null;

  return response.json();
}
