import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-lg border p-4 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full",
  {
    variants: {
      variant: {
        default: "border-border bg-card text-foreground",
        success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
        error: "border-red-500/30 bg-red-500/10 text-red-500",
        warning: "border-amber-500/30 bg-amber-500/10 text-amber-500",
        info: "border-blue-500/30 bg-blue-500/10 text-blue-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const iconMap = {
  default: null,
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

export interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  title?: string;
  description?: string;
  onClose?: () => void;
}

export function Toast({
  className,
  variant = "default",
  title,
  description,
  onClose,
  ...props
}: ToastProps) {
  const Icon = iconMap[variant || "default"];

  return (
    <div
      className={cn(toastVariants({ variant }), className)}
      {...props}
    >
      <div className="flex items-start gap-3">
        {Icon && <Icon className="h-5 w-5 shrink-0 mt-0.5" />}
        <div className="grid gap-1">
          {title && (
            <div className="text-sm font-semibold">{title}</div>
          )}
          {description && (
            <div className="text-sm opacity-90">{description}</div>
          )}
        </div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-2 top-2 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
