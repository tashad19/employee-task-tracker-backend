import { getAuthToken } from "./auth";

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || response.statusText);
  }

  return response;
}

export async function apiGet<T>(url: string): Promise<T> {
  const response = await authFetch(url);
  return response.json();
}

export async function apiPost<T>(url: string, data?: unknown): Promise<T> {
  const response = await authFetch(url, {
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
  });
  return response.json();
}

export async function apiPut<T>(url: string, data?: unknown): Promise<T> {
  const response = await authFetch(url, {
    method: "PUT",
    body: data ? JSON.stringify(data) : undefined,
  });
  return response.json();
}

export async function apiDelete<T>(url: string): Promise<T> {
  const response = await authFetch(url, {
    method: "DELETE",
  });
  return response.json();
}
