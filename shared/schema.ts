import { z } from "zod";

export const TaskStatus = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
} as const;

export type TaskStatusType = (typeof TaskStatus)[keyof typeof TaskStatus];

export const UserRole = {
  ADMIN: "admin",
  USER: "user",
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

export const userSchema = z.object({
  _id: z.string(),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum([UserRole.ADMIN, UserRole.USER]),
  employeeId: z.string().optional(),
});

export const insertUserSchema = userSchema.omit({ _id: true });
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;
export type SafeUser = Omit<User, "password">;

export const employeeSchema = z.object({
  _id: z.string(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.string().min(2, "Role must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

export const insertEmployeeSchema = employeeSchema.omit({ _id: true });

export type Employee = z.infer<typeof employeeSchema>;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;

export const taskSchema = z.object({
  _id: z.string(),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  status: z.enum([TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED]),
  employeeId: z.string(),
  dueDate: z.string().optional(),
});

export const insertTaskSchema = taskSchema.omit({ _id: true });
export const updateTaskSchema = taskSchema.partial().omit({ _id: true });

export type Task = z.infer<typeof taskSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;

export interface TaskWithEmployee extends Task {
  employee?: Employee;
}

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completionRate: number;
  totalEmployees: number;
  tasksByStatus: {
    status: TaskStatusType;
    count: number;
  }[];
  tasksByEmployee: {
    employeeId: string;
    employeeName: string;
    taskCount: number;
  }[];
}

export interface AuthResponse {
  user: SafeUser;
  token: string;
}
