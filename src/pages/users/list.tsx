import { useState } from "react";
import { useNavigation } from "@refinedev/core";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { AlertDialog, useConfirmDelete } from "@/components/ui/alert-dialog";
import {
  Pencil,
  Trash,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown,
  Users as UsersIcon,
  KeyRound,
  UserCheck,
  UserX,
} from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/toaster";

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

interface UsersListResponse {
  users: User[];
  limit: number;
  offset: number;
  count: number;
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

export const UserList = () => {
  const { list } = useNavigation();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [current, setCurrent] = useState(1);
  const [pageSize] = useState(10);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  // Delete confirmation dialog state
  const { isOpen, pendingId, itemName, confirmDelete, handleCancel, setIsOpen } = useConfirmDelete();

  // Fetch users
  const { data, isLoading, isError } = useQuery<UsersListResponse>({
    queryKey: ["users", current, pageSize, searchQuery, sortField, sortOrder],
    queryFn: async () => {
      const offset = (current - 1) * pageSize;
      const params = new URLSearchParams({
        limit: pageSize.toString(),
        offset: offset.toString(),
      });
      if (searchQuery) params.append("q", searchQuery);
      if (sortField) {
        params.append("order", `${sortField}.${sortOrder}`);
      }
      const response = await axiosInstance.get(`/api/v1/internal/admin/users?${params.toString()}`);
      return response.data;
    },
  });

  // Deactivate user mutation
  const deactivateMutation = useMutation({
    mutationFn: async (userId: string) => {
      await axiosInstance.post(`/api/v1/internal/admin/users/${userId}/deactivate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deactivated successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to deactivate user", error.message);
    },
  });

  // Reactivate user mutation
  const reactivateMutation = useMutation({
    mutationFn: async (userId: string) => {
      await axiosInstance.post(`/api/v1/internal/admin/users/${userId}/reactivate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User reactivated successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to reactivate user", error.message);
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ userId, newPassword }: { userId: string; newPassword: string }) => {
      await axiosInstance.post(`/api/v1/internal/admin/users/${userId}/reset-password`, {
        newPassword,
      });
    },
    onSuccess: () => {
      toast.success("Password reset successfully");
      setResetPasswordDialogOpen(false);
      setNewPassword("");
      setSelectedUserId(null);
    },
    onError: (error: any) => {
      toast.error("Failed to reset password", error.message);
    },
  });

  const users = data?.users || [];
  const totalPages = Math.ceil((data?.count || 0) / pageSize);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrent(1);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleToggleActive = (user: User) => {
    if (user.isActive) {
      deactivateMutation.mutate(user.id);
    } else {
      reactivateMutation.mutate(user.id);
    }
  };

  const handleResetPassword = (userId: string) => {
    setSelectedUserId(userId);
    setResetPasswordDialogOpen(true);
  };

  const handleConfirmResetPassword = () => {
    if (selectedUserId && newPassword) {
      resetPasswordMutation.mutate({ userId: selectedUserId, newPassword });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading users...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-destructive">
          Failed to load users. Ensure you have the required permissions.
        </div>
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
            ]}
            className="mb-4"
          />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Users</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage internal users and their roles
              </p>
            </div>
            <Button onClick={() => window.location.href = "/users/create"}>
              <span className="mr-2">+</span>
              New User
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="border-b border-border bg-card px-8 py-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="relative max-w-sm">
              <input
                type="text"
                placeholder="Search users by email or name..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
          <button
            onClick={() => {
              const newOrder = sortOrder === "asc" ? "desc" : "asc";
              setSortOrder(newOrder);
              setSortField("email");
            }}
            className="flex items-center gap-2 rounded-md border border-border bg-transparent px-3 py-2 text-xs font-medium hover:bg-muted"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            Sort {sortField && `(${sortOrder})`}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="rounded-lg border border-border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="w-12 px-6 py-3">
                  <input
                    type="checkbox"
                    className="rounded border-border"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <button
                    onClick={() => handleSort("email")}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    User
                    {sortField === "email" && (
                      <ArrowUpDown className="h-3 w-3" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Roles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <button
                    onClick={() => handleSort("isActive")}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Status
                    {sortField === "isActive" && (
                      <ArrowUpDown className="h-3 w-3" />
                    )}
                  </button>
                </th>
                <th className="w-12 px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <UsersIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="mt-4 text-sm font-medium">
                        {searchQuery ? "No users found" : "No users yet"}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {searchQuery
                          ? "Try adjusting your search"
                          : "Get started by creating your first user"}
                      </p>
                      {!searchQuery && (
                        <Button
                          variant="outline"
                          className="mt-4"
                          size="sm"
                          onClick={() => window.location.href = "/users/create"}
                        >
                          Create User
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user: User) => (
                  <tr
                    key={user.id}
                    className="group border-b border-border transition-colors hover:bg-muted/30"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="rounded border-border"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium">
                          {(user.firstName?.[0] || user.email?.[0] || "U").toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <span
                            key={role}
                            className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground">
                        {user.lastLoginAt
                          ? new Date(user.lastLoginAt).toLocaleDateString()
                          : "Never"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            user.isActive
                              ? "bg-green-500"
                              : "bg-gray-400"
                          }`}
                        />
                        <span className="text-xs">
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `/users/${user.id}/edit`;
                          }}
                          className="rounded p-1 hover:bg-muted text-muted-foreground hover:text-foreground"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResetPassword(user.id);
                          }}
                          className="rounded p-1 hover:bg-muted text-muted-foreground hover:text-foreground"
                          title="Reset Password"
                        >
                          <KeyRound className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleActive(user);
                          }}
                          className={`rounded p-1 hover:bg-muted text-muted-foreground hover:text-foreground ${
                            user.isActive ? "hover:text-destructive" : "hover:text-green-500"
                          }`}
                          title={user.isActive ? "Deactivate" : "Reactivate"}
                        >
                          {user.isActive ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {users.length > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Page {current} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrent(current - 1)}
                disabled={current === 1}
                className="flex items-center gap-1 rounded-md border border-border bg-transparent px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
              >
                <ChevronLeft className="h-3 w-3" />
                Previous
              </button>
              <button
                onClick={() => setCurrent(current + 1)}
                disabled={current === totalPages}
                className="flex items-center gap-1 rounded-md border border-border bg-transparent px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
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
          setSelectedUserId(null);
        }}
      />
    </div>
  );
};
