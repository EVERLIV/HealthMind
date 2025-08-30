import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorData;
    try {
      const text = await res.text();
      // Check if response is HTML (starts with <!DOCTYPE or <html)
      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        console.error('Server returned HTML instead of JSON:', res.status, res.url);
        errorData = { error: `Server error ${res.status}: Service temporarily unavailable` };
      } else {
        errorData = JSON.parse(text);
      }
    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
      errorData = { error: res.statusText || 'Unknown error' };
    }
    
    const error = new Error(`${res.status}: ${errorData.error || res.statusText}`);
    (error as any).response = { data: errorData };
    throw error;
  }
}

export async function apiRequest(
  url: string,
  options?: RequestInit,
): Promise<any> {
  // Get auth token from localStorage
  const authToken = localStorage.getItem('authToken');
  
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string> || {}),
  };
  
  // Add auth token if available
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  // Add content-type if body is present
  if (options?.body) {
    headers['Content-Type'] = 'application/json';
  }
  
  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return await res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey, signal }) => {
    const url = queryKey.join("/") as string;
    
    // Special timeout for recommendations API (2 minutes)
    const timeoutMs = url.includes('/api/recommendations') ? 120000 : 30000;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    // Combine with existing signal if provided
    if (signal?.aborted) {
      clearTimeout(timeoutId);
      throw new Error('Query was cancelled');
    }
    
    // Get auth token from localStorage
    const authToken = localStorage.getItem('authToken');
    const headers: Record<string, string> = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    try {
      const res = await fetch(url, {
        credentials: "include",
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error?.name === 'AbortError') {
        throw new Error('Запрос занимает слишком много времени. Попробуйте позже.');
      }
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
