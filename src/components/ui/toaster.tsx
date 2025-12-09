import * as React from "react";
import { createContext, useContext, useState, useCallback } from "react";
import { Toast, type ToastProps } from "./toast";

type ToastType = "success" | "error" | "warning" | "info" | "default";

interface ToastItem extends Omit<ToastProps, "onClose"> {
  id: string;
  variant: ToastType;
}

interface ToastContextValue {
  toasts: ToastItem[];
  toast: (props: Omit<ToastItem, "id">) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

interface ToasterProps {
  children: React.ReactNode;
}

export function Toaster({ children }: ToasterProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const toast = useCallback((props: Omit<ToastItem, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...props, id }]);

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      dismiss(id);
    }, 5000);
  }, [dismiss]);

  const success = useCallback((title: string, description?: string) => {
    toast({ variant: "success", title, description });
  }, [toast]);

  const error = useCallback((title: string, description?: string) => {
    toast({ variant: "error", title, description });
  }, [toast]);

  const warning = useCallback((title: string, description?: string) => {
    toast({ variant: "warning", title, description });
  }, [toast]);

  const info = useCallback((title: string, description?: string) => {
    toast({ variant: "info", title, description });
  }, [toast]);

  return (
    <ToastContext.Provider
      value={{ toasts, toast, success, error, warning, info, dismiss, dismissAll }}
    >
      {children}
      <div className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col-reverse md:max-w-[420px]">
        {toasts.map((t) => (
          <Toast
            key={t.id}
            variant={t.variant}
            title={t.title}
            description={t.description}
            onClose={() => dismiss(t.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
