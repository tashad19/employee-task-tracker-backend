import { getAuthToken } from "./auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function handleResponse(res: Response) {
  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }
    throw new Error(message);
  }
  return res.json();
}

function getHeaders(includeContentType = false): Record<string, string> {
  const headers: Record<string, string> = {};
  const token = getAuthToken();
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }
  
  return headers;
}

export async function apiGet<T = unknown>(url: string): Promise<T> {
  const res = await fetch(`${API_URL}${url}`, {
    method: "GET",
    headers: getHeaders(),
    credentials: "include",
  });
  return handleResponse(res);
}

export async function apiPost<T = unknown>(url: string, data?: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${url}`, {
    method: "POST",
    headers: getHeaders(true),
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });
  return handleResponse(res);
}

export async function apiPut<T = unknown>(url: string, data?: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${url}`, {
    method: "PUT",
    headers: getHeaders(true),
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });
  return handleResponse(res);
}

export async function apiDelete<T = unknown>(url: string): Promise<T> {
  const res = await fetch(`${API_URL}${url}`, {
    method: "DELETE",
    headers: getHeaders(),
    credentials: "include",
  });
  return handleResponse(res);
}