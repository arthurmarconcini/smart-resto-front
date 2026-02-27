import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SearchX } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  title = "Nenhum resultado encontrado",
  description = "Ajuste os filtros ou tente uma nova busca.",
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center min-h-[300px]", className)}>
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/30 mb-4 shadow-sm">
        {icon || <SearchX className="h-10 w-10 text-muted-foreground/60" />}
      </div>
      <h3 className="text-xl font-semibold text-foreground tracking-tight">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
