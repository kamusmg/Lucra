// This file handles the actual HTTP requests to a remote backend.
// It will be used when the app is not in MOCK mode.

// A simple wrapper for fetch to handle responses and errors consistently.
async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    return response.json();
}

const getApiBaseUrl = () => {
    // This provides a safe way to access Vite's env variables.
    const env = (typeof import.meta !== 'undefined' && (import.meta as any).env) ? (import.meta as any).env : {};
    return (env.VITE_API_BASE_URL || '').trim();
}

export const HttpTransport = {
  get: async <T>(path: string): Promise<T> => {
      const url = `${getApiBaseUrl()}${path}`;
      return fetch(url).then(res => handleResponse<T>(res));
  },
  post: async <T>(path: string, body: any): Promise<T> => {
      const url = `${getApiBaseUrl()}${path}`;
      return fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
      }).then(res => handleResponse<T>(res));
  },
};
