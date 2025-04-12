import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const isNetlify = window.location.hostname.includes('netlify.app') || !window.location.hostname.includes('localhost');
  
  // If in Netlify production environment, adjust the path to use Netlify functions
  const apiUrl = isNetlify ? url.replace('/api', '/.netlify/functions/server/api') : url;
  
  try {
    const res = await fetch(apiUrl, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    // Check for HTML response (probably an error page)
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      throw new Error('Received HTML response instead of JSON. Server might be returning an error page.');
    }

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      const isNetlify = window.location.hostname.includes('netlify.app') || !window.location.hostname.includes('localhost');
      const url = queryKey[0] as string;
      const apiUrl = isNetlify ? url.replace('/api', '/.netlify/functions/server/api') : url;
      
      const res = await fetch(apiUrl, {
        credentials: "include",
        headers: {
          "Accept": "application/json"
        }
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      // Check for HTML response (probably an error page)
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        throw new Error('Received HTML response instead of JSON. Server might be returning an error page.');
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      console.error('Query function error:', error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
