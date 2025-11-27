import { Badge } from "@/components/ui/badge";
import { TaskStatus, type TaskStatusType } from "@shared/schema";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: TaskStatusType;
  className?: string;
}

const statusConfig: Record<TaskStatusType, { label: string; className: string }> = {
  [TaskStatus.PENDING]: {
    label: "Pending",
    className: "bg-muted text-muted-foreground border-muted-border",
  },
  [TaskStatus.IN_PROGRESS]: {
    label: "In Progress",
    className: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  },
  [TaskStatus.COMPLETED]: {
    label: "Completed",
    className: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant="outline"
      className={cn("font-normal", config.className, className)}
      data-testid={`badge-status-${status.toLowerCase().replace(" ", "-")}`}
    >
      {config.label}
    </Badge>
  );
}
