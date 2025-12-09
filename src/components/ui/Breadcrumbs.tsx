import { useLocation, Link } from "react-router";
import { ChevronRight, Home } from "lucide-react";

export const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-sm text-muted-foreground">
      <Link
        to="/"
        className="flex items-center hover:text-(--color-foreground) transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      {pathnames.length > 0 && (
        <ChevronRight className="mx-2 h-4 w-4 text-(--color-border)" />
      )}
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;

        return (
          <div key={name} className="flex items-center">
            {isLast ? (
              <span className="font-medium text-(--color-foreground) capitalize">
                {name.replace(/-/g, " ")}
              </span>
            ) : (
              <Link
                to={routeTo}
                className="hover:text-(--color-foreground) transition-colors capitalize"
              >
                {name.replace(/-/g, " ")}
              </Link>
            )}
            {!isLast && (
              <ChevronRight className="mx-2 h-4 w-4 text-(--color-border)" />
            )}
          </div>
        );
      })}
    </nav>
  );
};
