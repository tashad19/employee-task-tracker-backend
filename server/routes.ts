import type { Express } from "express";
import { createServer, type Server } from "http";
import { connectDB } from "./db/connection";
import { User } from "./models/User";
import { Employee } from "./models/Employee";
import { Task } from "./models/Task";
import {
  authenticate,
  optionalAuth,
  requireAdmin,
  generateToken,
  AuthRequest,
} from "./middleware/auth";
import { log } from "./index";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Connect to MongoDB
  await connectDB();

  // ==================== AUTH ROUTES ====================

  // Register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, email, password, role } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });

      if (existingUser) {
        return res.status(400).json({
          message:
            existingUser.email === email
              ? "Email already in use"
              : "Username already taken",
        });
      }

      let employeeId: any = undefined;

      // For regular users, create an Employee record
      if (role === "user" || (!role)) {
        const employee = new Employee({
          name: username,
          role: "Team Member",
          email: email,
        });
        await employee.save();
        employeeId = employee._id;
      }

      const user = new User({
        username,
        email,
        password,
        role: role || "user",
        employeeId,
      });

      await user.save();

      const token = generateToken(user._id.toString());

      res.status(201).json({
        user: user.toJSON(),
        token,
      });
    } catch (error: any) {
      log(`Registration error: ${error.message}`, "auth");
      res.status(400).json({
        message: error.message || "Registration failed",
      });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isMatch = await user.comparePassword(password);

      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = generateToken(user._id.toString());

      res.json({
        user: user.toJSON(),
        token,
      });
    } catch (error: any) {
      log(`Login error: ${error.message}`, "auth");
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Get current user
  app.get("/api/auth/me", authenticate, async (req: AuthRequest, res) => {
    try {
      res.json(req.user?.toJSON());
    } catch (error: any) {
      res.status(500).json({ message: "Failed to get user info" });
    }
  });

  // ==================== EMPLOYEE ROUTES ====================

  // Get all employees (public)
  app.get("/api/employees", async (req, res) => {
    try {
      const employees = await Employee.find().sort({ name: 1 });
      res.json(employees);
    } catch (error: any) {
      log(`Get employees error: ${error.message}`, "employees");
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  // Get single employee
  app.get("/api/employees/:id", async (req, res) => {
    try {
      const employee = await Employee.findById(req.params.id);

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      res.json(employee);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch employee" });
    }
  });

  // Create employee (admin only)
  app.post(
    "/api/employees",
    authenticate,
    requireAdmin,
    async (req: AuthRequest, res) => {
      try {
        const { name, role, email } = req.body;

        const existingEmployee = await Employee.findOne({ email });
        if (existingEmployee) {
          return res.status(400).json({ message: "Email already in use" });
        }

        const employee = new Employee({ name, role, email });
        await employee.save();

        res.status(201).json(employee);
      } catch (error: any) {
        log(`Create employee error: ${error.message}`, "employees");
        res.status(400).json({
          message: error.message || "Failed to create employee",
        });
      }
    }
  );

  // Update employee (admin only)
  app.put(
    "/api/employees/:id",
    authenticate,
    requireAdmin,
    async (req: AuthRequest, res) => {
      try {
        const { name, role, email } = req.body;

        const employee = await Employee.findById(req.params.id);

        if (!employee) {
          return res.status(404).json({ message: "Employee not found" });
        }

        // Check if email is being changed to an existing email
        if (email && email !== employee.email) {
          const existingEmployee = await Employee.findOne({ email });
          if (existingEmployee) {
            return res.status(400).json({ message: "Email already in use" });
          }
        }

        if (name) employee.name = name;
        if (role) employee.role = role;
        if (email) employee.email = email;

        await employee.save();

        res.json(employee);
      } catch (error: any) {
        res.status(400).json({
          message: error.message || "Failed to update employee",
        });
      }
    }
  );

  // Delete employee (admin only)
  app.delete(
    "/api/employees/:id",
    authenticate,
    requireAdmin,
    async (req: AuthRequest, res) => {
      try {
        const employee = await Employee.findById(req.params.id);

        if (!employee) {
          return res.status(404).json({ message: "Employee not found" });
        }

        // Delete all tasks assigned to this employee
        await Task.deleteMany({ employeeId: employee._id });

        await employee.deleteOne();

        res.json({ message: "Employee deleted successfully" });
      } catch (error: any) {
        res.status(500).json({ message: "Failed to delete employee" });
      }
    }
  );

  // ==================== TASK ROUTES ====================

  // Get all tasks (public, but filtered for regular users)
  app.get("/api/tasks", optionalAuth, async (req: AuthRequest, res) => {
    try {
      const { status, employeeId, limit } = req.query;

      let query: any = {};

      // If user is logged in and not admin, ONLY show their tasks
      if (req.user && req.user.role !== "admin" && req.user.employeeId) {
        query.employeeId = req.user.employeeId;
      } else if (req.user?.role === "admin") {
        // Only admins can filter by employee
        if (employeeId && employeeId !== "all") {
          query.employeeId = employeeId;
        }
      }

      if (status && status !== "all") {
        query.status = status;
      }

      let tasksQuery = Task.find(query)
        .populate("employeeId", "name email role")
        .sort({ createdAt: -1 });

      if (limit) {
        tasksQuery = tasksQuery.limit(parseInt(limit as string));
      }

      const tasks = await tasksQuery;

      // Format tasks with employee info
      const formattedTasks = tasks.map((task) => {
        const taskObj = task.toJSON();
        if (task.employeeId && typeof task.employeeId === "object") {
          taskObj.employee = task.employeeId;
          taskObj.employeeId = (task.employeeId as any)._id.toString();
        }
        return taskObj;
      });

      res.json(formattedTasks);
    } catch (error: any) {
      log(`Get tasks error: ${error.message}`, "tasks");
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  // Get single task
  app.get("/api/tasks/:id", async (req, res) => {
    try {
      const task = await Task.findById(req.params.id).populate(
        "employeeId",
        "name email role"
      );

      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      res.json(task);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch task" });
    }
  });

  // Create task (admin only)
  app.post(
    "/api/tasks",
    authenticate,
    requireAdmin,
    async (req: AuthRequest, res) => {
      try {
        const { title, description, status, employeeId, dueDate } = req.body;

        // Verify employee exists
        const employee = await Employee.findById(employeeId);
        if (!employee) {
          return res.status(400).json({ message: "Invalid employee ID" });
        }

        const task = new Task({
          title,
          description,
          status: status || "Pending",
          employeeId,
          dueDate: dueDate ? new Date(dueDate) : undefined,
        });

        await task.save();

        res.status(201).json(task);
      } catch (error: any) {
        log(`Create task error: ${error.message}`, "tasks");
        res.status(400).json({
          message: error.message || "Failed to create task",
        });
      }
    }
  );

  // Update task (admin for full update, users can update status for their own tasks)
  app.put(
    "/api/tasks/:id",
    authenticate,
    async (req: AuthRequest, res) => {
      try {
        const { title, description, status, employeeId, dueDate } = req.body;

        const task = await Task.findById(req.params.id);

        if (!task) {
          return res.status(404).json({ message: "Task not found" });
        }

        // Check if user is admin or if this is their task
        const isAdmin = req.user?.role === "admin";
        const isOwnTask = req.user?.employeeId?.toString() === task.employeeId.toString();

        if (!isAdmin && !isOwnTask) {
          return res.status(403).json({ message: "You can only update your own tasks" });
        }

        // Regular users can only update status
        if (!isAdmin) {
          if (status) task.status = status;
        } else {
          // Admins can update everything
          // If changing employee, verify it exists
          if (employeeId && employeeId !== task.employeeId.toString()) {
            const employee = await Employee.findById(employeeId);
            if (!employee) {
              return res.status(400).json({ message: "Invalid employee ID" });
            }
            task.employeeId = employeeId;
          }

          if (title) task.title = title;
          if (description !== undefined) task.description = description;
          if (status) task.status = status;
          if (dueDate !== undefined) {
            task.dueDate = dueDate ? new Date(dueDate) : undefined;
          }
        }

        await task.save();

        res.json(task);
      } catch (error: any) {
        res.status(400).json({
          message: error.message || "Failed to update task",
        });
      }
    }
  );

  // Delete task (admin only)
  app.delete(
    "/api/tasks/:id",
    authenticate,
    requireAdmin,
    async (req: AuthRequest, res) => {
      try {
        const task = await Task.findById(req.params.id);

        if (!task) {
          return res.status(404).json({ message: "Task not found" });
        }

        await task.deleteOne();

        res.json({ message: "Task deleted successfully" });
      } catch (error: any) {
        res.status(500).json({ message: "Failed to delete task" });
      }
    }
  );

  // ==================== DASHBOARD ROUTES ====================

  // Get dashboard stats
  app.get("/api/dashboard", optionalAuth, async (req: AuthRequest, res) => {
    try {
      let taskQuery: any = {};

      // If user is logged in and not admin, only show their stats
      if (req.user && req.user.role !== "admin" && req.user.employeeId) {
        taskQuery.employeeId = req.user.employeeId;
      }

      const [tasks, employees] = await Promise.all([
        Task.find(taskQuery),
        Employee.find(),
      ]);

      const totalTasks = tasks.length;
      const completedTasks = tasks.filter((t) => t.status === "Completed").length;
      const pendingTasks = tasks.filter((t) => t.status === "Pending").length;
      const inProgressTasks = tasks.filter((t) => t.status === "In Progress").length;
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      // Tasks by status
      const tasksByStatus = [
        { status: "Pending" as const, count: pendingTasks },
        { status: "In Progress" as const, count: inProgressTasks },
        { status: "Completed" as const, count: completedTasks },
      ];

      // Tasks by employee (only for admin)
      const tasksByEmployee: { employeeId: string; employeeName: string; taskCount: number }[] = [];

      if (!req.user || req.user.role === "admin") {
        const allTasks = await Task.find();
        const employeeTaskCounts = new Map<string, number>();

        allTasks.forEach((task) => {
          const empId = task.employeeId.toString();
          employeeTaskCounts.set(empId, (employeeTaskCounts.get(empId) || 0) + 1);
        });

        employees.forEach((emp) => {
          const count = employeeTaskCounts.get(emp._id.toString()) || 0;
          if (count > 0) {
            tasksByEmployee.push({
              employeeId: emp._id.toString(),
              employeeName: emp.name,
              taskCount: count,
            });
          }
        });

        // Sort by task count descending
        tasksByEmployee.sort((a, b) => b.taskCount - a.taskCount);
      }

      res.json({
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        completionRate,
        totalEmployees: employees.length,
        tasksByStatus,
        tasksByEmployee,
      });
    } catch (error: any) {
      log(`Dashboard error: ${error.message}`, "dashboard");
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  return httpServer;
}
