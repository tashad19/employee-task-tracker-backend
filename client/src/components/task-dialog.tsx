import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiGet, apiPost, apiPut } from "@/lib/api";
import { TaskStatus, type Employee, type Task, type InsertTask } from "@shared/schema";

const taskFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  status: z.enum([TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED]),
  employeeId: z.string().min(1, "Please select an employee"),
  dueDate: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskFormSchema>;

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
}

export function TaskDialog({ open, onOpenChange, task }: TaskDialogProps) {
  const { toast } = useToast();
  const isEditing = !!task;

  const { data: employees } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
    queryFn: () => apiGet("/api/employees"),
    enabled: open,
  });

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      status: TaskStatus.PENDING,
      employeeId: "",
      dueDate: "",
    },
  });

  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description || "",
        status: task.status,
        employeeId: task.employeeId,
        dueDate: task.dueDate || "",
      });
    } else {
      form.reset({
        title: "",
        description: "",
        status: TaskStatus.PENDING,
        employeeId: "",
        dueDate: "",
      });
    }
  }, [task, form, open]);

  const createMutation = useMutation({
    mutationFn: (data: InsertTask) => apiPost<Task>("/api/tasks", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({ title: "Task created", description: "The task has been created successfully." });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create task",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: InsertTask) => apiPut<Task>(`/api/tasks/${task?._id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({ title: "Task updated", description: "The task has been updated successfully." });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update task",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TaskFormData) => {
    const taskData: InsertTask = {
      ...data,
      description: data.description || undefined,
      dueDate: data.dueDate || undefined,
    };

    if (isEditing) {
      updateMutation.mutate(taskData);
    } else {
      createMutation.mutate(taskData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Task" : "Create New Task"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the task details below."
              : "Fill in the details to create a new task."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter task title"
                      data-testid="input-task-title"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter task description (optional)"
                      data-testid="input-task-description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned To</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-employee">
                        <SelectValue placeholder="Select an employee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees?.map((emp) => (
                        <SelectItem
                          key={emp._id}
                          value={emp._id}
                          data-testid={`select-item-employee-${emp._id}`}
                        >
                          {emp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={TaskStatus.PENDING}>Pending</SelectItem>
                      <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
                      <SelectItem value={TaskStatus.COMPLETED}>Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      data-testid="input-task-due-date"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} data-testid="button-submit-task">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : isEditing ? (
                  "Update Task"
                ) : (
                  "Create Task"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
