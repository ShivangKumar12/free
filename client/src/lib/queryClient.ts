import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      // Try to parse as JSON first
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await res.json();
        const errorMessage = errorData.message || res.statusText;
        throw new Error(`${res.status}: ${errorMessage}`);
      } else {
        // Fall back to text
        const text = (await res.text()) || res.statusText;
        throw new Error(`${res.status}: ${text}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`${res.status}: ${res.statusText}`);
    }
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // When running on Replit, we should use relative URLs
  // The Vite dev server will proxy them to the backend
  
  // Only use Netlify path replacement on Netlify
  let apiUrl = url;
  if (window.location.hostname.includes('netlify.app')) {
    // Netlify production
    apiUrl = url.replace('/api', '/.netlify/functions/server/api');
  }
  
  console.log(`API Request: ${method} ${apiUrl}`, data);
  
  try {
    const res = await fetch(apiUrl, {
      method,
      headers: data ? { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      } : {
        "Accept": "application/json"
      },
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    console.log(`API Response status: ${res.status}`);

    // Check for HTML response (probably an error page)
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      console.error('Received HTML response instead of JSON');
      throw new Error('Received HTML response instead of JSON. Server might be returning an error page.');
    }

    // Clone the response before checking status
    const clonedRes = res.clone();
    
    try {
      await throwIfResNotOk(res);
      return clonedRes;
    } catch (error) {
      // Try to get more details from the response
      const responseText = await clonedRes.text();
      console.error('API Request failed with response:', responseText);
      throw error;
    }
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
      const url = queryKey[0] as string;
      
      // Only adjust URL for Netlify
      let apiUrl = url;
      if (window.location.hostname.includes('netlify.app')) {
        // Netlify production
        apiUrl = url.replace('/api', '/.netlify/functions/server/api');
      }
      
      console.log('Fetching from API URL:', apiUrl);
      
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
      
      // Get the response text first to debug any JSON parsing issues
      const responseText = await res.text();
      
      try {
        // Try to parse as JSON
        return JSON.parse(responseText);
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError, 'Response text:', responseText);
        throw new Error(`Failed to parse server response as JSON: ${jsonError}`);
      }
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
