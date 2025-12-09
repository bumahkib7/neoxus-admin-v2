import type { NotificationProvider } from "@refinedev/core";

// This will be set by the App component after toast context is available
let toastRef: {
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
} | null = null;

export const setToastRef = (ref: typeof toastRef) => {
  toastRef = ref;
};

export const notificationProvider: NotificationProvider = {
  open: ({ message, description, type }) => {
    if (!toastRef) {
      console.warn("Toast not initialized yet");
      return;
    }

    const variant = type === "success" ? "success" : type === "error" ? "error" : "info";
    
    if (variant === "success") {
      toastRef.success(message, description);
    } else if (variant === "error") {
      toastRef.error(message, description);
    } else {
      toastRef.info(message, description);
    }
  },
  close: () => {
    // Toasts auto-dismiss, no action needed
  },
};
