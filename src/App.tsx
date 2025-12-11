import { Authenticated, Refine } from "@refinedev/core";
import { BrowserRouter, Routes, Route, Outlet } from "react-router";
import routerProvider, { CatchAllNavigate } from "@refinedev/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";

import { Layout } from "./components/layout/Layout";
import { ProductList } from "./pages/products/list";
import { CreateProduct } from "./pages/products/create";
import { EditProduct } from "./pages/products/edit";
import AggregatorPage from "./pages/products/aggregator";
import AdvertiserDetailPage from "./pages/products/advertiser/[id]";
import { VariantList } from "./pages/variants/list";
import { VariantEdit } from "./pages/variants/edit";
import { CollectionList } from "./pages/collections/list";
import { CreateCollection } from "./pages/collections/create";
import { EditCollection } from "./pages/collections/edit";
import { Dashboard } from "./pages/dashboard";
import { Settings } from "./pages/settings";
import { Login } from "./pages/login";
import { ThemeProvider } from "./context/ThemeContext";
import { authProvider } from "./providers/authProvider";
import { dataProvider } from "./providers/dataProvider";
import { Toaster, useToast } from "./components/ui/toaster";

const queryClient = new QueryClient();

const axiosInstance = axios.create();

axiosInstance.interceptors.request.use((config) => {
  const token = Cookies.get("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to extract error messages
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const url: string = error.config?.url || "";

    // Skip refresh loop for login/refresh endpoints
    const isAuthEndpoint = url.includes("/auth/login") || url.includes("/auth/refresh");

    if (status === 401 && !isAuthEndpoint) {
      const refresh = Cookies.get("refresh_token");
      if (refresh) {
        try {
          const resp = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/internal/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: refresh }),
          });
          if (resp.ok) {
            const { accessToken, refreshToken } = await resp.json();
            Cookies.set("auth_token", accessToken, { expires: 7 });
            Cookies.set("refresh_token", refreshToken, { expires: 30 });
            // retry original request with new token
            error.config.headers.Authorization = `Bearer ${accessToken}`;
            return axiosInstance.request(error.config);
          }
        } catch (_e) {
          // fall through to logout
        }
      }
      Cookies.remove("auth_token");
      Cookies.remove("refresh_token");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // Extract human-readable error message from backend
    const message = error.response?.data?.message 
      || error.response?.data?.error 
      || error.message 
      || "An error occurred";
    
    // Attach message to error for notification provider
    error.message = message;
    return Promise.reject(error);
  }
);

function AppContent() {
  const toast = useToast();
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <Refine
            routerProvider={routerProvider}
            dataProvider={dataProvider(import.meta.env.VITE_API_URL, axiosInstance)}
            authProvider={authProvider}
            notificationProvider={{
              open: ({ message, description, type }) => {
                if (type === "success") {
                  toast.success(message, description);
                } else if (type === "error") {
                  toast.error(message, description);
                } else {
                  toast.info(message, description);
                }
              },
              close: () => {},
            }}
            resources={[
              {
                name: "admin/products",
                list: "/products",
                create: "/products/create",
                edit: "/products/:id/edit",
                meta: {
                  label: "Products",
                },
              },
              {
                name: "admin/variants",
                list: "/products/variants",
                edit: "/products/variants/:id/edit",
                meta: {
                  label: "Variants",
                },
              },
              {
                name: "admin/collections",
                list: "/collections",
                create: "/collections/create",
                edit: "/collections/:id/edit",
                meta: {
                  label: "Collections",
                },
              },
              {
                name: "admin/orders",
                list: "/orders",
                meta: {
                  label: "Orders",
                },
              },
              {
                name: "admin/customers",
                list: "/customers",
                meta: {
                  label: "Customers",
                },
              },
            ]}
          >
            <Routes>
              <Route
                element={
                  <Authenticated
                    key="authenticated-inner"
                    fallback={<CatchAllNavigate to="/login" />}
                  >
                    <Layout>
                      <Outlet />
                    </Layout>
                  </Authenticated>
                }
              >
                <Route path="/" element={<Dashboard />} />
                <Route path="/products" element={<ProductList />} />
                <Route path="/products/create" element={<CreateProduct />} />
                <Route path="/products/:id/edit" element={<EditProduct />} />
                <Route path="/products/aggregator" element={<AggregatorPage />} />
                <Route path="/products/advertiser/:id" element={<AdvertiserDetailPage />} />
                <Route path="/products/variants" element={<VariantList />} />
                <Route path="/products/variants/:id/edit" element={<VariantEdit />} />
                <Route path="/products/categories" element={<CollectionList />} />
                <Route path="/collections" element={<CollectionList />} />
                <Route path="/collections/create" element={<CreateCollection />} />
                <Route path="/collections/:id/edit" element={<EditCollection />} />
                <Route
                  path="/orders"
                  element={
                    <div className="p-8">
                      <h1 className="text-2xl font-semibold">Orders</h1>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Coming soon
                      </p>
                    </div>
                  }
                />
                <Route
                  path="/customers"
                  element={
                    <div className="p-8">
                      <h1 className="text-2xl font-semibold">Customers</h1>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Coming soon
                      </p>
                    </div>
                  }
                />
                <Route path="/settings" element={<Settings />} />
              </Route>
              <Route
                element={
                  <Authenticated key="authenticated-outer" fallback={<Outlet />}>
                    <CatchAllNavigate to="/" />
                  </Authenticated>
                }
              >
                <Route path="/login" element={<Login />} />
              </Route>
            </Routes>
          </Refine>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

function App() {
  return (
    <Toaster>
      <AppContent />
    </Toaster>
  );
}

export default App;
