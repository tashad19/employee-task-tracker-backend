import { useQuery } from "@tanstack/react-query";
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DashboardSkeleton } from "@/components/loading-skeleton";
import { EmptyState } from "@/components/empty-state";
import { useAuth } from "@/lib/auth";
import { apiGet } from "@/lib/api";
import type { DashboardStats, Task, TaskWithEmployee } from "@shared/schema";

export default function DashboardPage() {
  const { isAdmin, user } = useAuth();

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard"],
    queryFn: () => apiGet("/api/dashboard"),
  });

  const { data: recentTasks } = useQuery<TaskWithEmployee[]>({
    queryKey: ["/api/tasks", "recent"],
    queryFn: () => apiGet("/api/tasks?limit=5"),
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <DashboardSkeleton />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
        <EmptyState
          icon="tasks"
          title="No data available"
          description="Start by creating employees and tasks to see your dashboard."
        />
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Tasks",
      value: stats.totalTasks,
      icon: ClipboardList,
      description: "All tasks in the system",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Completed",
      value: stats.completedTasks,
      icon: CheckCircle2,
      description: `${stats.completionRate.toFixed(1)}% completion rate`,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      title: "In Progress",
      value: stats.inProgressTasks,
      icon: Clock,
      description: "Currently being worked on",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "Pending",
      value: stats.pendingTasks,
      icon: AlertCircle,
      description: "Waiting to be started",
      color: "text-muted-foreground",
      bgColor: "bg-muted",
    },
  ];

  if (isAdmin) {
    statCards.push({
      title: "Employees",
      value: stats.totalEmployees,
      icon: Users,
      description: "Team members",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    });
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" data-testid="text-page-title">
          {isAdmin ? "Dashboard" : "My Tasks"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isAdmin
            ? "Overview of all tasks and employees"
            : `Welcome back, ${user?.username}`}
        </p>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 ${isAdmin ? "lg:grid-cols-5" : "lg:grid-cols-4"} gap-4`}>
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-md ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div
                className="text-3xl font-bold"
                data-testid={`stat-${stat.title.toLowerCase().replace(" ", "-")}`}
              >
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              Task Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {stats.tasksByStatus.map((item) => (
              <div key={item.status} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.status}</span>
                  <span className="font-medium">
                    {item.count} {item.count === 1 ? "task" : "tasks"}
                  </span>
                </div>
                <Progress
                  value={(item.count / Math.max(stats.totalTasks, 1)) * 100}
                  className="h-2"
                />
              </div>
            ))}
            {stats.tasksByStatus.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No tasks to display
              </p>
            )}
          </CardContent>
        </Card>

        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                Tasks by Employee
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.tasksByEmployee.slice(0, 5).map((item) => (
                <div
                  key={item.employeeId}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">
                        {item.employeeName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </span>
                    </div>
                    <span className="text-sm font-medium">{item.employeeName}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {item.taskCount} {item.taskCount === 1 ? "task" : "tasks"}
                  </span>
                </div>
              ))}
              {stats.tasksByEmployee.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No employees with tasks
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {!isAdmin && recentTasks && recentTasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-muted-foreground" />
                Recent Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentTasks.map((task) => (
                <div
                  key={task._id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                >
                  <span className="text-sm font-medium truncate max-w-[200px]">
                    {task.title}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      task.status === "Completed"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : task.status === "In Progress"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
