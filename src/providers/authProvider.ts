import type { AuthProvider } from "@refinedev/core";
import Cookies from "js-cookie";

const API_URL = import.meta.env.VITE_API_URL;

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/internal/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const { accessToken, refreshToken } = await response.json();
        Cookies.set("auth_token", accessToken, { expires: 7 });
        Cookies.set("refresh_token", refreshToken, { expires: 30 });
        return {
          success: true,
          redirectTo: "/",
        };
      }

      return {
        success: false,
        error: {
          name: "LoginError",
          message: "Invalid email or password",
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          name: "LoginError",
          message: "An error occurred during login",
        },
      };
    }
  },
  logout: async () => {
    Cookies.remove("auth_token");
    Cookies.remove("refresh_token");
    return {
      success: true,
      redirectTo: "/login",
    };
  },
  check: async () => {
    const token = Cookies.get("auth_token");

    if (!token) {
      return {
        authenticated: false,
        redirectTo: "/login",
      };
    }

    try {
      const response = await fetch(`${API_URL}/api/v1/internal/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        return { authenticated: true };
      }

      // Try refresh on 401
      if (response.status === 401 || response.status === 403) {
        const refreshed = await tryRefresh();
        if (refreshed) {
          // verify with fresh token
          const me = await fetch(`${API_URL}/api/v1/internal/auth/me`, {
            headers: { Authorization: `Bearer ${Cookies.get("auth_token")}` },
          });
          if (me.ok) {
            return { authenticated: true };
          }
        }
        Cookies.remove("auth_token");
        Cookies.remove("refresh_token");
        return { authenticated: false, redirectTo: "/login" };
      }
    } catch {
      // network error - treat as unauthenticated
    }

    Cookies.remove("auth_token");
    Cookies.remove("refresh_token");
    return { authenticated: false, redirectTo: "/login" };
  },
  getPermissions: async () => null,
  getIdentity: async () => {
    const token = Cookies.get("auth_token");
    if (!token) return null;

    try {
      const response = await fetch(`${API_URL}/api/v1/internal/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        return await response.json();
      }
      if (response.status === 401 || response.status === 403) {
        const refreshed = await tryRefresh();
        if (refreshed) {
          const me = await fetch(`${API_URL}/api/v1/internal/auth/me`, {
            headers: { Authorization: `Bearer ${Cookies.get("auth_token")}` },
          });
          if (me.ok) return await me.json();
        }
        Cookies.remove("auth_token");
        Cookies.remove("refresh_token");
        return null;
      }
    } catch (_e) {
      return null;
    }
    return null;
  },
  onError: async (error) => {
    console.error(error);
    // Only logout on 401 (Unauthorized), not 403 (Forbidden)
    // 403 typically means permission denied, not invalid auth
    if (error.status === 401) {
      Cookies.remove("auth_token");
      return {
        logout: true,
        redirectTo: "/login",
      };
    }
    return {};
  },
};

async function tryRefresh(): Promise<boolean> {
  const refresh = Cookies.get("refresh_token");
  if (!refresh) return false;

  try {
    const resp = await fetch(`${API_URL}/api/v1/internal/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refresh }),
    });

    if (!resp.ok) {
      Cookies.remove("refresh_token");
      Cookies.remove("auth_token");
      return false;
    }

    const { accessToken, refreshToken } = await resp.json();
    Cookies.set("auth_token", accessToken, { expires: 7 });
    Cookies.set("refresh_token", refreshToken, { expires: 30 });
    return true;
  } catch (_e) {
    return false;
  }
}
