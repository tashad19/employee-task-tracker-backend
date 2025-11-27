import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Filter,
  Pencil,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/status-badge";
import { TaskDialog } from "@/components/task-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { TableSkeleton } from "@/components/loading-skeleton";
import { EmptyState } from "@/components/empty-state";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { apiGet, apiDelete, apiPut } from "@/lib/api";
import { TaskStatus, type Task, type Employee, type TaskWithEmployee, type TaskStatusType } from "@shared/schema";
import { Redirect } from "wouter";

const LOCAL_STORAGE_KEY = "task_tracker_tasks";

export default function TasksPage() {
  const { isAdmin, user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const { data: tasks, isLoading: tasksLoading } = useQuery<TaskWithEmployee[]>({
    queryKey: ["/api/tasks"],
    queryFn: () => apiGet("/api/tasks"),
  });

  const { data: employees } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
    queryFn: () => apiGet("/api/employees"),
  });

  useEffect(() => {
    if (tasks) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/api/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({ title: "Task deleted", description: "The task has been deleted successfully." });
      setTaskToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete task",
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatusType }) =>
      apiPut(`/api/tasks/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({ title: "Status updated", description: "Task status has been updated." });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive",
      });
    },
  });

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];

    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      const matchesEmployee =
        employeeFilter === "all" || task.employeeId === employeeFilter;

      return matchesSearch && matchesStatus && matchesEmployee;
    });
  }, [tasks, searchQuery, statusFilter, employeeFilter]);

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedTask(null);
    setIsTaskDialogOpen(true);
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees?.find((e) => e._id === employeeId);
    return employee?.name || "Unknown";
  };

  if (tasksLoading) {
    return (
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Tasks</h1>
            <p className="text-muted-foreground mt-1">Manage and track all tasks</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-0">
            <TableSkeleton rows={5} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">
            Tasks
          </h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin ? "Manage and track all tasks" : "View your assigned tasks"}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={handleCreate} data-testid="button-add-task">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-tasks"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]" data-testid="select-filter-status">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value={TaskStatus.PENDING}>Pending</SelectItem>
              <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
              <SelectItem value={TaskStatus.COMPLETED}>Completed</SelectItem>
            </SelectContent>
          </Select>
          {isAdmin && (
            <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
              <SelectTrigger className="w-[160px]" data-testid="select-filter-employee">
                <SelectValue placeholder="Employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                {employees?.map((emp) => (
                  <SelectItem key={emp._id} value={emp._id}>
                    {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={searchQuery || statusFilter !== "all" || employeeFilter !== "all" ? "search" : "tasks"}
          title={
            searchQuery || statusFilter !== "all" || employeeFilter !== "all"
              ? "No tasks found"
              : "No tasks yet"
          }
          description={
            searchQuery || statusFilter !== "all" || employeeFilter !== "all"
              ? "Try adjusting your filters or search query."
              : isAdmin
              ? "Get started by creating your first task."
              : "No tasks have been assigned to you yet."
          }
          action={
            isAdmin && !searchQuery && statusFilter === "all" && employeeFilter === "all"
              ? { label: "Add Task", onClick: handleCreate }
              : undefined
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  {isAdmin && <TableHead className="w-[80px]">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow key={task._id} data-testid={`row-task-${task._id}`}>
                    <TableCell>
                      <div>
                        <div className="font-medium" data-testid={`text-task-title-${task._id}`}>
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {task.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {getEmployeeName(task.employeeId)
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </span>
                        </div>
                        <span className="text-sm">{getEmployeeName(task.employeeId)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {(isAdmin || task.employeeId === user?.employeeId) ? (
                        <Select
                          value={task.status}
                          onValueChange={(value: TaskStatusType) =>
                            updateStatusMutation.mutate({ id: task._id, status: value })
                          }
                        >
                          <SelectTrigger
                            className="w-[130px] h-8"
                            data-testid={`select-status-${task._id}`}
                          >
                            <StatusBadge status={task.status} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={TaskStatus.PENDING}>Pending</SelectItem>
                            <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
                            <SelectItem value={TaskStatus.COMPLETED}>Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <StatusBadge status={task.status} />
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString()
                        : "No due date"}
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              data-testid={`button-task-menu-${task._id}`}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEdit(task)}
                              data-testid={`button-edit-task-${task._id}`}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setTaskToDelete(task)}
                              data-testid={`button-delete-task-${task._id}`}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <TaskDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        task={selectedTask}
      />

      <ConfirmDialog
        open={!!taskToDelete}
        onOpenChange={() => setTaskToDelete(null)}
        title="Delete Task"
        description={`Are you sure you want to delete "${taskToDelete?.title}"? This action cannot be undone.`}
        onConfirm={() => taskToDelete && deleteMutation.mutate(taskToDelete._id)}
        confirmLabel="Delete"
        isDestructive
      />
    </div>
  );
}
