import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  MoreVertical,
  Mail,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmployeeDialog } from "@/components/employee-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { CardsSkeleton } from "@/components/loading-skeleton";
import { EmptyState } from "@/components/empty-state";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiGet, apiDelete } from "@/lib/api";
import type { Employee, Task } from "@shared/schema";

export default function EmployeesPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  const { data: employees, isLoading } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
    queryFn: () => apiGet("/api/employees"),
  });

  const { data: tasks } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    queryFn: () => apiGet("/api/tasks"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/api/employees/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Employee deleted",
        description: "The employee has been removed successfully.",
      });
      setEmployeeToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete employee",
        variant: "destructive",
      });
    },
  });

  const filteredEmployees = useMemo(() => {
    if (!employees) return [];

    return employees.filter(
      (employee) =>
        employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [employees, searchQuery]);

  const getTaskCount = (employeeId: string) => {
    return tasks?.filter((task) => task.employeeId === employeeId).length || 0;
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-orange-500",
      "bg-pink-500",
      "bg-teal-500",
      "bg-indigo-500",
      "bg-rose-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedEmployee(null);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Employees</h1>
            <p className="text-muted-foreground mt-1">Manage your team members</p>
          </div>
        </div>
        <CardsSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">
            Employees
          </h1>
          <p className="text-muted-foreground mt-1">Manage your team members</p>
        </div>
        <Button onClick={handleCreate} data-testid="button-add-employee">
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search employees..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          data-testid="input-search-employees"
        />
      </div>

      {filteredEmployees.length === 0 ? (
        <EmptyState
          icon={searchQuery ? "search" : "employees"}
          title={searchQuery ? "No employees found" : "No employees yet"}
          description={
            searchQuery
              ? "Try adjusting your search query."
              : "Get started by adding your first team member."
          }
          action={
            !searchQuery ? { label: "Add Employee", onClick: handleCreate } : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((employee) => (
            <Card
              key={employee._id}
              className="hover-elevate"
              data-testid={`card-employee-${employee._id}`}
            >
              <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
                <div className="flex items-center gap-3">
                  <Avatar className={`h-12 w-12 ${getAvatarColor(employee.name)}`}>
                    <AvatarFallback className="text-white font-medium">
                      {getInitials(employee.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h3
                      className="font-medium truncate"
                      data-testid={`text-employee-name-${employee._id}`}
                    >
                      {employee.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{employee.role}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      data-testid={`button-employee-menu-${employee._id}`}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleEdit(employee)}
                      data-testid={`button-edit-employee-${employee._id}`}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setEmployeeToDelete(employee)}
                      data-testid={`button-delete-employee-${employee._id}`}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{employee.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="secondary" className="text-xs">
                      {getTaskCount(employee._id)}{" "}
                      {getTaskCount(employee._id) === 1 ? "task" : "tasks"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <EmployeeDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        employee={selectedEmployee}
      />

      <ConfirmDialog
        open={!!employeeToDelete}
        onOpenChange={() => setEmployeeToDelete(null)}
        title="Delete Employee"
        description={`Are you sure you want to delete "${employeeToDelete?.name}"? All their assigned tasks will also be deleted. This action cannot be undone.`}
        onConfirm={() =>
          employeeToDelete && deleteMutation.mutate(employeeToDelete._id)
        }
        confirmLabel="Delete"
        isDestructive
      />
    </div>
  );
}
