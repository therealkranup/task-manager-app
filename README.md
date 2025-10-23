# Task Manager App

A full-stack task management application built with React, Express, SQLite, and Supabase authentication.

## Features

- ✅ User authentication (signup/login/logout) with Supabase
- ✅ Add new tasks with title and description
- ✅ Edit existing tasks
- ✅ Mark tasks as complete/incomplete
- ✅ Delete tasks
- ✅ View all tasks in an organized list
- ✅ Separate pending and completed tasks
- ✅ User-specific task isolation (users only see their own tasks)
- ✅ Responsive design with Tailwind CSS
- ✅ RESTful API backend with JWT authentication

## Project Structure

```
task-manager-app/
├── backend/                 # Express.js backend
│   ├── server.js           # Main server file with API routes
│   ├── package.json        # Backend dependencies
│   └── tasks.db           # SQLite database (created automatically)
├── frontend/               # React.js frontend
│   ├── public/
│   │   └── index.html     # HTML template
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── TaskForm.js    # Form for adding/editing tasks
│   │   │   ├── TaskItem.js    # Individual task display
│   │   │   └── TaskList.js    # List of all tasks
│   │   ├── services/
│   │   │   └── api.js     # API service functions
│   │   ├── styles/
│   │   │   └── index.css  # Tailwind CSS styles
│   │   ├── App.js         # Main React component
│   │   └── index.js       # React entry point
│   ├── package.json       # Frontend dependencies
│   ├── tailwind.config.js # Tailwind configuration
│   └── postcss.config.js  # PostCSS configuration
└── README.md              # This file
```

## Setup Instructions

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn
- Supabase account (free at [supabase.com](https://supabase.com))

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API in your Supabase dashboard
3. Copy your Project URL and anon/public key
4. Update the `.env` files with your Supabase credentials:
   - Backend: `/backend/.env`
   - Frontend: `/frontend/.env.local`

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the backend server:
   ```bash
   npm start
   ```
   
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will run on `http://localhost:3000`

## API Endpoints

- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get a specific task
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
- `GET /api/health` - Health check

## Usage

1. Start both the backend and frontend servers
2. Open your browser and go to `http://localhost:3000`
3. Add tasks using the form at the top
4. Click the checkbox to mark tasks as complete
5. Use the Edit button to modify tasks
6. Use the Delete button to remove tasks

## Technologies Used

### Backend
- **Express.js** - Web framework for Node.js
- **SQLite3** - Lightweight database
- **Supabase** - Authentication and user management
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** - JavaScript library for building user interfaces
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests
- **Supabase** - Client-side authentication

## Development

The app uses a simple SQLite database that's created automatically when you first run the backend. The database file (`tasks.db`) will be created in the backend directory.

For production deployment, you might want to:
- Use a more robust database like PostgreSQL
- Add authentication and user management
- Implement data validation
- Add error handling and logging
- Use environment variables for configuration
