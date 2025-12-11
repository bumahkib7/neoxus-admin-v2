import type { AuthProvider } from "@refinedev/core";
import Cookies from "js-cookie";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const axiosInstance = axios.create({
  baseURL: API_URL,
});

axiosInstance.interceptors.request.use((config) => {
  const token = Cookies.get("auth_token");
  if (token && config.headers) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/internal/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

    // Let the axios interceptor handle refresh. If this fails, it will reject.
    try {
      await axiosInstance.get("/api/v1/internal/auth/me");
      return { authenticated: true };
    } catch (error) {
      return {
        authenticated: false,
        redirectTo: "/login",
      };
    }
  },
  getPermissions: async () => null,
  getIdentity: async () => {
    const token = Cookies.get("auth_token");
    if (!token) return null;

    try {
      const { data } = await axiosInstance.get("/api/v1/internal/auth/me");
      return data;
    } catch (error) {
      return null;
    }
  },
  onError: async (error) => {
    console.error(error);
    // Let the axios interceptor handle 401s
    return {};
  },
};

