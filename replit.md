# Employee Task Tracker

## Overview

The Employee Task Tracker is an internal productivity application for managing employees and their assigned tasks. The system supports role-based access control with admin and regular user roles. Admins have full CRUD capabilities for employees and tasks, while regular users have restricted access to view and update their own tasks.

The application follows a Material Design aesthetic with Linear-inspired productivity patterns, emphasizing clarity, efficiency, and comfortable information density for internal team use.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Technology Stack

**Frontend:**
- React 18 with TypeScript for type safety
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and caching
- React Hook Form with Zod for form validation
- Shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for styling with custom design tokens

**Backend:**
- Express.js REST API server
- MongoDB with Mongoose ODM for data persistence
- JWT-based authentication with bcrypt for password hashing
- Session management for authenticated requests

**Build & Development:**
- ESBuild for optimized server-side bundling
- TypeScript across the entire stack
- Hot module replacement (HMR) in development via Vite

### Application Architecture

**Monorepo Structure:**
The application uses a monorepo layout with three main directories:
- `client/` - React frontend application
- `server/` - Express backend API
- `shared/` - Common TypeScript types and Zod schemas used by both client and server

**Authentication Flow:**
- JWT tokens stored in localStorage with a 7-day expiration
- Authorization header (`Bearer <token>`) sent with each authenticated request
- Middleware functions (`authenticate`, `optionalAuth`, `requireAdmin`) protect routes based on user roles
- Password hashing with bcryptjs before storage

**Data Models:**
Three primary MongoDB collections managed by Mongoose:
- **Users** - Authentication credentials, role (admin/user), optional employee reference
- **Employees** - Name, role/position, email address
- **Tasks** - Title, description, status (Pending/In Progress/Completed), employee assignment, optional due date

**State Management:**
- TanStack Query handles all server state with automatic caching and invalidation
- Query keys follow RESTful patterns (e.g., `["/api/tasks"]`, `["/api/employees"]`)
- Mutations trigger query invalidation to keep UI synchronized with server state
- Local component state (useState) for UI-only concerns like dialog visibility

**Component Architecture:**
- Shadcn/ui provides accessible, customizable base components
- Custom composite components built on top (StatusBadge, TaskDialog, EmployeeDialog)
- Layout components include AppSidebar for navigation and role-based menu items
- Theme system supports light/dark modes with system preference detection

**API Design:**
RESTful API endpoints under `/api` prefix:
- `/api/auth/*` - Authentication (register, login)
- `/api/dashboard` - Aggregated statistics for dashboard view
- `/api/employees/*` - Employee CRUD operations (admin only for create/update/delete)
- `/api/tasks/*` - Task CRUD operations with filtering and employee assignment

**Role-Based Access Control:**
- Admin users see all navigation items, can manage employees and all tasks
- Regular users see limited navigation, can only view/update tasks assigned to their linked employee
- UI adapts based on `isAdmin` flag from auth context
- Backend middleware enforces permissions at the API layer

**Styling System:**
- Tailwind utility classes with custom CSS variables for theming
- Design tokens defined in `index.css` for light/dark mode consistency
- Inter font family via Google Fonts for typography
- Custom spacing scale (2, 4, 6, 8) for consistent layout rhythm
- Shadow and elevation utilities for depth hierarchy

**Error Handling:**
- Form validation errors displayed inline via React Hook Form
- API errors caught and displayed via toast notifications
- Loading states shown with skeleton components during data fetches
- Empty states guide users when no data exists

## External Dependencies

**Database:**
- MongoDB Atlas or compatible MongoDB instance
- Connection string via `MONGODB_URI` environment variable
- Mongoose for schema definition and data validation

**Authentication:**
- JWT tokens generated with `jsonwebtoken` library
- `JWT_SECRET` environment variable for token signing
- Bcrypt.js for password hashing (10 rounds)

**UI Component Libraries:**
- Radix UI primitives for accessible components
- Lucide React for icon system
- cmdk for command palette patterns
- Vaul for drawer components

**Development Tools:**
- Replit-specific plugins for cartographer and dev banner (development only)
- TypeScript compiler for type checking
- Vite dev server with HMR and runtime error overlay

**Note:** The application was originally scaffolded with Drizzle ORM configuration (`drizzle.config.ts`) pointing to PostgreSQL, but the actual implementation uses MongoDB with Mongoose instead. The Drizzle config file is unused and can be safely ignored.