import Cookies from "js-cookie"

const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "")

const getHeaders = () => {
  const token = Cookies.get("auth_token")
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function requestJson<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? "GET",
    credentials: "include",
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(body || response.statusText)
  }

  return (await response.json()) as T
}
