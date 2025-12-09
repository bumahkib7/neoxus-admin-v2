import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { X, AlertTriangle, Trash2, Info, CheckCircle } from "lucide-react";
import { Button } from "./button";

// Overlay backdrop
const AlertDialogOverlay = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
AlertDialogOverlay.displayName = "AlertDialogOverlay";

// Dialog content variants
const alertDialogContentVariants = cva(
  [
    "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
    "w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl",
    "duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out",
    "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
    "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
    "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
    "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
  ],
  {
    variants: {
      variant: {
        default: "",
        destructive: "",
        success: "",
        info: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// Icon container variants
const iconVariants = cva(
  "mx-auto flex h-14 w-14 items-center justify-center rounded-full",
  {
    variants: {
      variant: {
        default: "bg-muted text-muted-foreground",
        destructive: "bg-destructive/10 text-destructive",
        success: "bg-green-500/10 text-green-500",
        info: "bg-blue-500/10 text-blue-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface AlertDialogProps extends VariantProps<typeof alertDialogContentVariants> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  isLoading = false,
  variant = "default",
  icon,
}: AlertDialogProps) {
  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  // Handle escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onCancel?.();
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [open, onCancel, onOpenChange]);

  if (!open) return null;

  const defaultIcon = () => {
    switch (variant) {
      case "destructive":
        return <Trash2 className="h-7 w-7" />;
      case "success":
        return <CheckCircle className="h-7 w-7" />;
      case "info":
        return <Info className="h-7 w-7" />;
      default:
        return <AlertTriangle className="h-7 w-7" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <AlertDialogOverlay
        data-state={open ? "open" : "closed"}
        onClick={handleCancel}
      />

      {/* Dialog */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        data-state={open ? "open" : "closed"}
        className={cn(alertDialogContentVariants({ variant }))}
      >
        {/* Close button */}
        <button
          onClick={handleCancel}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        {/* Icon */}
        <div className={cn(iconVariants({ variant }))}>
          {icon || defaultIcon()}
        </div>

        {/* Title */}
        <h2
          id="alert-dialog-title"
          className="mt-5 text-center text-lg font-semibold"
        >
          {title}
        </h2>

        {/* Description */}
        {description && (
          <p
            id="alert-dialog-description"
            className="mt-2 text-center text-sm text-muted-foreground"
          >
            {description}
          </p>
        )}

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            className="flex-1"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </span>
            ) : (
              confirmLabel
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Convenience hook for managing alert dialog state
export function useAlertDialog() {
  const [open, setOpen] = React.useState(false);
  const [config, setConfig] = React.useState<Omit<AlertDialogProps, "open" | "onOpenChange"> | null>(null);

  const showDialog = React.useCallback((dialogConfig: Omit<AlertDialogProps, "open" | "onOpenChange">) => {
    setConfig(dialogConfig);
    setOpen(true);
  }, []);

  const hideDialog = React.useCallback(() => {
    setOpen(false);
    setConfig(null);
  }, []);

  const DialogComponent = React.useCallback(() => {
    if (!config) return null;
    return (
      <AlertDialog
        {...config}
        open={open}
        onOpenChange={setOpen}
      />
    );
  }, [config, open]);

  return {
    open,
    showDialog,
    hideDialog,
    AlertDialogComponent: DialogComponent,
  };
}

// Simple confirmation hook for delete operations
export function useConfirmDelete() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [itemName, setItemName] = React.useState<string>("");

  const confirmDelete = React.useCallback((id: string, name?: string) => {
    setPendingId(id);
    setItemName(name || "this item");
    setIsOpen(true);
  }, []);

  const handleCancel = React.useCallback(() => {
    setIsOpen(false);
    setPendingId(null);
    setItemName("");
  }, []);

  return {
    isOpen,
    pendingId,
    itemName,
    confirmDelete,
    handleCancel,
    setIsOpen,
  };
}
