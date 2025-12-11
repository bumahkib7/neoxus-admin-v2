import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ArrowLeft, Loader2 } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/toaster";

interface Role {
  id: string;
  name: string;
  description: string;
}

interface RolesResponse {
  roles: Role[];
  count: number;
}

interface CreateUserRequest {
  email: string;
  password: string;
  role: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
}

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

axiosInstance.interceptors.request.use((config) => {
  const token = Cookies.get("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const CreateUser = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState<CreateUserRequest>({
    email: "",
    password: "",
    role: "",
    firstName: "",
    lastName: "",
    isActive: true,
  });

  // Fetch available roles
  const { data: rolesData, isLoading: rolesLoading } = useQuery<RolesResponse>({
    queryKey: ["roles"],
    queryFn: async () => {
      const response = await axiosInstance.get("/api/v1/internal/admin/users/roles");
      return response.data;
    },
  });

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateUserRequest) => {
      const response = await axiosInstance.post("/api/v1/internal/admin/users/create", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("User created successfully");
      navigate("/users");
    },
    onError: (error: any) => {
      toast.error("Failed to create user", error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.email || !formData.password || !formData.role) {
      toast.error("Validation failed", "Email, password, and role are required");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Validation failed", "Password must be at least 8 characters");
      return;
    }

    createMutation.mutate(formData);
  };

  const handleChange = (field: keyof CreateUserRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Filter to only show staff roles
  const staffRoles = rolesData?.roles.filter((role) =>
    ["ADMIN", "CUSTOMER_SERVICE", "WAREHOUSE_MANAGER", "DEVELOPER"].includes(role.name)
  ) || [];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="px-8 py-6">
          <Breadcrumb
            items={[
              { label: "Users", href: "/users" },
              { label: "Create", href: "/users/create" },
            ]}
            className="mb-4"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/users")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Create User</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add a new internal user with assigned role
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-auto p-8">
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
          {/* Basic Information */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-base font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Email <span className="text-destructive">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="user@example.com"
                  required
                  className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    placeholder="John"
                    className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    placeholder="Doe"
                    className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Password <span className="text-destructive">*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder="Minimum 8 characters"
                  required
                  minLength={8}
                  className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Must be at least 8 characters long
                </p>
              </div>
            </div>
          </div>

          {/* Role & Permissions */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-base font-semibold mb-4">Role & Permissions</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Role <span className="text-destructive">*</span>
                </label>
                {rolesLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading roles...
                  </div>
                ) : (
                  <select
                    value={formData.role}
                    onChange={(e) => handleChange("role", e.target.value)}
                    required
                    className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="">Select a role</option>
                    {staffRoles.map((role) => (
                      <option key={role.id} value={role.name}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                )}
                {formData.role && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {staffRoles.find((r) => r.name === formData.role)?.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => handleChange("isActive", e.target.checked)}
                  className="rounded border-border"
                />
                <label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
                  Active
                </label>
                <p className="text-xs text-muted-foreground">
                  User will be able to log in immediately
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/users")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create User
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
