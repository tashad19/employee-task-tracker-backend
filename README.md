# Employee Task Tracker

A full-stack web application for managing employee tasks with role-based access control. Admin users can create, read, update, and delete employees and tasks, while regular users can view only their assigned tasks and update task statuses.

## Features

- **User Authentication**: JWT-based authentication with role-based access control
- **Two User Roles**:
  - **Admin**: Full CRUD operations on employees and tasks, view all dashboard metrics
  - **Regular User**: View only assigned tasks, update task status, see personal task dashboard
- **Employee Management**: Create, update, and delete employees (admin only)
- **Task Management**: Create, assign, and track task status (admin), update own task status (users)
- **Dashboard**: Real-time metrics showing total tasks, completion rate, and status breakdown
- **Task Filtering**: Filter tasks by status and employee (admin), search by title and description
- **Local Storage Persistence**: Task data persists across page refreshes
- **Responsive UI**: Modern, Material Design-inspired interface with dark mode support

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling with dark mode support
- **Shadcn UI** for component library
- **React Query (TanStack Query)** for server state management
- **React Hook Form** with Zod validation
- **Wouter** for lightweight routing

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **TypeScript** for type safety

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- MongoDB instance (local or Atlas)
- Git

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd employee-task-tracker
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/employee-task-tracker

# JWT Secret for token signing (use a strong random string)
JWT_SECRET=your-super-secret-jwt-key-here-change-this

# Session Secret
SESSION_SECRET=your-session-secret-here-change-this

# Port (optional, defaults to 5000)
PORT=5000

# Environment
NODE_ENV=development
```

**Important**: Replace the placeholder values with your actual credentials. Generate strong random strings for JWT_SECRET and SESSION_SECRET.

### 4. MongoDB Setup

#### Option A: Local MongoDB
```bash
# Start MongoDB locally (if installed)
mongod
```

#### Option B: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster and database
3. Get your connection string and set it as `MONGODB_URI`

## Running the Application

### Development Mode

```bash
npm run dev
```

This will start:
- **Backend API** on `http://localhost:5000`
- **Frontend** on `http://localhost:5000` (served by Vite)
- **Hot module reloading** for fast development

The app will automatically open in your browser. If not, navigate to `http://localhost:5000`.

### Production Build

```bash
npm run build
```

```bash
npm run start
```

## Usage Guide

### 1. Initial Setup

#### Create Admin Account
1. Go to the registration page
2. Enter username, email, password
3. Select "Administrator" as role
4. Register

#### Create Employees (Admin Only)
1. Log in as admin
2. Navigate to "Employees" section
3. Click "Add Employee"
4. Fill in employee details and save

#### Create Tasks (Admin Only)
1. Navigate to "Tasks" section
2. Click "Add Task"
3. Enter task details, assign to employee, set due date
4. Save

### 2. Regular User Workflow

#### Register as Regular User
1. Go to registration page
2. Enter username, email, password
3. Select "Regular User" as role
4. Register (an Employee record is automatically created)

#### View Assigned Tasks
1. Log in as regular user
2. Go to "Tasks" section
3. You'll only see tasks assigned to you
4. Click status dropdown to update task progress

#### Track Progress
1. Go to "Dashboard"
2. View your personal task statistics
3. See breakdown of task statuses

## Project Structure

```
employee-task-tracker/
├── server/                    # Backend Express server
│   ├── models/               # Mongoose schemas
│   │   ├── User.ts
│   │   ├── Employee.ts
│   │   └── Task.ts
│   ├── middleware/           # Authentication & authorization
│   │   └── auth.ts
│   ├── db/                   # Database connection
│   │   └── connection.ts
│   ├── routes.ts             # API routes
│   ├── index.ts              # Server entry point
│   └── vite.ts               # Vite configuration
├── client/                    # Frontend React app
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable components
│   │   ├── lib/              # Utilities & helpers
│   │   ├── hooks/            # Custom React hooks
│   │   ├── App.tsx           # Main app component
│   │   └── index.css         # Global styles
│   └── index.html
├── shared/                    # Shared types & schemas
│   └── schema.ts             # Zod schemas & TypeScript types
├── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires token)

### Employees (Admin Only)
- `GET /api/employees` - List all employees
- `GET /api/employees/:id` - Get single employee
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Tasks
- `GET /api/tasks` - List tasks (filtered by user role)
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create task (admin only)
- `PUT /api/tasks/:id` - Update task (admins: full update, users: status only)
- `DELETE /api/tasks/:id` - Delete task (admin only)

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics (role-specific)

## Authentication

The app uses JWT (JSON Web Tokens) for authentication:

1. User registers/logs in → receives JWT token
2. Token stored in browser localStorage
3. Token sent with each API request in Authorization header: `Bearer <token>`
4. Backend validates token and identifies user
5. Tasks filtered based on user role and employeeId

## Security Features

- Passwords hashed with bcryptjs (10 salt rounds)
- JWT tokens expire after 7 days
- Role-based access control on both frontend and backend
- Regular users can only access/modify their own tasks
- Employee emails are unique
- Input validation with Zod schemas

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGODB_URI` environment variable
- Verify network access (if using Atlas)

### Port Already in Use
```bash
# Change PORT in .env or use different port
PORT=3001 npm run dev
```

### Clearing Data
To reset the database:
```bash
# Delete all collections in MongoDB
# Or create a new database
```

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## Performance Notes

- Frontend uses React Query for efficient data fetching and caching
- Dashboard metrics calculated in real-time
- Local storage provides instant UI updates during optimistic mutations
- Pagination supported on tasks endpoint

## Future Enhancements

- Email notifications for task assignments
- Password reset functionality
- Advanced filtering and sorting options
- Task history and audit logs
- Export functionality (CSV/PDF)
- Performance metrics and analytics
- Mobile app

## License

This project is open source and available under the MIT License.

## Support

For issues or questions, please open an issue on the project repository.
