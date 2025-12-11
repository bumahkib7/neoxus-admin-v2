import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ArrowLeft, Loader2, KeyRound, UserCheck, UserX } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/toaster";
import { AlertDialog } from "@/components/ui/alert-dialog";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
}

interface RolesResponse {
  roles: Role[];
  count: number;
}

interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  roles?: string[];
  isActive?: boolean;
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

export const EditUser = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [formData, setFormData] = useState<UpdateUserRequest>({
    firstName: "",
    lastName: "",
    roles: [],
    isActive: true,
  });
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  // Fetch user details
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["user", id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/api/v1/internal/admin/users/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  // Fetch available roles
  const { data: rolesData, isLoading: rolesLoading } = useQuery<RolesResponse>({
    queryKey: ["roles"],
    queryFn: async () => {
      const response = await axiosInstance.get("/api/v1/internal/admin/users/roles");
      return response.data;
    },
  });

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        isActive: user.isActive,
      });
    }
  }, [user]);

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: async (data: UpdateUserRequest) => {
      const response = await axiosInstance.put(`/api/v1/internal/admin/users/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", id] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User updated successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to update user", error.message);
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (newPassword: string) => {
      await axiosInstance.post(`/api/v1/internal/admin/users/${id}/reset-password`, {
        newPassword,
      });
    },
    onSuccess: () => {
      toast.success("Password reset successfully");
      setResetPasswordDialogOpen(false);
      setNewPassword("");
    },
    onError: (error: any) => {
      toast.error("Failed to reset password", error.message);
    },
  });

  // Toggle active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async (isActive: boolean) => {
      if (isActive) {
        await axiosInstance.post(`/api/v1/internal/admin/users/${id}/reactivate`);
      } else {
        await axiosInstance.post(`/api/v1/internal/admin/users/${id}/deactivate`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", id] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(formData.isActive ? "User deactivated successfully" : "User reactivated successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to update user status", error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.roles || formData.roles.length === 0) {
      toast.error("Validation failed", "At least one role is required");
      return;
    }

    updateMutation.mutate(formData);
  };

  const handleChange = (field: keyof UpdateUserRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRoleToggle = (roleName: string) => {
    const currentRoles = formData.roles || [];
    if (currentRoles.includes(roleName)) {
      handleChange(
        "roles",
        currentRoles.filter((r) => r !== roleName)
      );
    } else {
      handleChange("roles", [...currentRoles, roleName]);
    }
  };

  const handleToggleActive = () => {
    const newStatus = !formData.isActive;
    handleChange("isActive", newStatus);
    toggleActiveMutation.mutate(newStatus);
  };

  const handleConfirmResetPassword = () => {
    if (newPassword && newPassword.length >= 8) {
      resetPasswordMutation.mutate(newPassword);
    } else {
      toast.error("Validation failed", "Password must be at least 8 characters");
    }
  };

  // Filter to only show staff roles
  const staffRoles = rolesData?.roles.filter((role) =>
    ["ADMIN", "CUSTOMER_SERVICE", "WAREHOUSE_MANAGER", "DEVELOPER"].includes(role.name)
  ) || [];

  if (userLoading || rolesLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading user...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-destructive">User not found</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="px-8 py-6">
          <Breadcrumb
            items={[
              { label: "Users", href: "/users" },
              { label: user.email, href: `/users/${id}/edit` },
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
                <h1 className="text-xl font-semibold">Edit User</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setResetPasswordDialogOpen(true)}
              >
                <KeyRound className="mr-2 h-4 w-4" />
                Reset Password
              </Button>
              <Button
                variant={formData.isActive ? "destructive" : "default"}
                size="sm"
                onClick={handleToggleActive}
                disabled={toggleActiveMutation.isPending}
              >
                {toggleActiveMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : formData.isActive ? (
                  <UserX className="mr-2 h-4 w-4" />
                ) : (
                  <UserCheck className="mr-2 h-4 w-4" />
                )}
                {formData.isActive ? "Deactivate" : "Reactivate"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-auto p-8">
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
          {/* User Information */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-base font-semibold mb-4">User Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-muted-foreground">
                  Email
                </label>
                <div className="text-sm">{user.email}</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
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

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-muted-foreground">
                    Created At
                  </label>
                  <div className="text-sm">
                    {new Date(user.createdAt).toLocaleString()}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-muted-foreground">
                    Last Login
                  </label>
                  <div className="text-sm">
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleString()
                      : "Never"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Roles & Permissions */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-base font-semibold mb-4">Roles & Permissions</h2>
            <div className="space-y-3">
              {staffRoles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-start gap-3 rounded-md border border-border p-4 hover:bg-muted/30 transition-colors"
                >
                  <input
                    type="checkbox"
                    id={`role-${role.name}`}
                    checked={(formData.roles || []).includes(role.name)}
                    onChange={() => handleRoleToggle(role.name)}
                    className="mt-0.5 rounded border-border"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={`role-${role.name}`}
                      className="block text-sm font-medium cursor-pointer"
                    >
                      {role.name}
                    </label>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {role.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-base font-semibold mb-4">Status</h2>
            <div className="flex items-center gap-3">
              <div
                className={`h-3 w-3 rounded-full ${
                  formData.isActive ? "bg-green-500" : "bg-gray-400"
                }`}
              />
              <span className="text-sm font-medium">
                {formData.isActive ? "Active" : "Inactive"}
              </span>
              <span className="text-xs text-muted-foreground">
                {formData.isActive
                  ? "User can log in and access the system"
                  : "User is deactivated and cannot log in"}
              </span>
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
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Reset Password Dialog */}
      <AlertDialog
        open={resetPasswordDialogOpen}
        onOpenChange={setResetPasswordDialogOpen}
        variant="default"
        title="Reset Password"
        description={
          <div className="space-y-4">
            <p>Enter a new password for this user. They will be able to use this password to log in immediately.</p>
            <input
              type="password"
              placeholder="New password (min 8 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              minLength={8}
            />
          </div>
        }
        confirmLabel="Reset Password"
        cancelLabel="Cancel"
        onConfirm={handleConfirmResetPassword}
        onCancel={() => {
          setResetPasswordDialogOpen(false);
          setNewPassword("");
        }}
      />
    </div>
  );
};
