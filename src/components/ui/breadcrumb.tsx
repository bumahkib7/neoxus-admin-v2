import { Link } from "react-router";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb = ({ items, className }: BreadcrumbProps) => {
  return (
    <nav className={cn("flex items-center gap-2 text-sm", className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center gap-2">
            {item.href && !isLast ? (
              <Link
                to={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={cn(isLast ? "text-foreground font-medium" : "text-muted-foreground")}>
                {item.label}
              </span>
            )}
            {!isLast && (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </div>
        );
      })}
    </nav>
  );
};
