import { ClipboardList, Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: "tasks" | "employees" | "search";
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const icons = {
  tasks: ClipboardList,
  employees: Users,
  search: Search,
};

export function EmptyState({ icon = "tasks", title, description, action }: EmptyStateProps) {
  const Icon = icons[icon];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2" data-testid="text-empty-title">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6" data-testid="text-empty-description">
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick} data-testid="button-empty-action">
          {action.label}
        </Button>
      )}
    </div>
  );
}
