import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiPost, apiPut } from "@/lib/api";
import type { Employee, InsertEmployee } from "@shared/schema";

const employeeFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.string().min(2, "Role must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

type EmployeeFormData = z.infer<typeof employeeFormSchema>;

interface EmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
}

export function EmployeeDialog({ open, onOpenChange, employee }: EmployeeDialogProps) {
  const { toast } = useToast();
  const isEditing = !!employee;

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      name: "",
      role: "",
      email: "",
    },
  });

  useEffect(() => {
    if (employee) {
      form.reset({
        name: employee.name,
        role: employee.role,
        email: employee.email,
      });
    } else {
      form.reset({
        name: "",
        role: "",
        email: "",
      });
    }
  }, [employee, form, open]);

  const createMutation = useMutation({
    mutationFn: (data: InsertEmployee) => apiPost<Employee>("/api/employees", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({ title: "Employee created", description: "The employee has been added successfully." });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create employee",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: InsertEmployee) => apiPut<Employee>(`/api/employees/${employee?._id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({ title: "Employee updated", description: "The employee has been updated successfully." });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update employee",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EmployeeFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Employee" : "Add New Employee"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the employee details below."
              : "Fill in the details to add a new team member."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter employee name"
                      data-testid="input-employee-name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Role</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Frontend Developer"
                      data-testid="input-employee-role"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="employee@company.com"
                      data-testid="input-employee-email"
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
              <Button type="submit" disabled={isLoading} data-testid="button-submit-employee">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? "Updating..." : "Adding..."}
                  </>
                ) : isEditing ? (
                  "Update Employee"
                ) : (
                  "Add Employee"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
