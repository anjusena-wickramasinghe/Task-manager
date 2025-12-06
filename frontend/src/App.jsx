import React from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom"

// Auth pages
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";

// Admin components
import Dashboard from "./pages/admin/Dashboard";
import ManageTasks from "./pages/admin/ManageTasks";
import ManageUsers from "./pages/admin/ManageUsers";
import CreateTask from "./pages/admin/CreateTask";

// User components
import UserDashboard from "./pages/user/UserDashboard";
import MyTasks from "./pages/user/MyTasks";
import TaskDetails from "./pages/user/TaskDetails";

// Protected Route
import PrivateRoute from "./routes/PrivateRoute";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Admin Protected Routes */}
        <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/tasks" element={<ManageTasks />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/createTask" element={<CreateTask />} />
        </Route>

        {/* User Protected Routes */}
        <Route element={<PrivateRoute allowedRoles={["user"]} />}>
          <Route path="/user/dashboard" element={<UserDashboard />} />
          <Route path="/user/tasks" element={<MyTasks />} />
          <Route path="/user/task-details/:id" element={<TaskDetails />} />
        </Route>

      </Routes>
    </BrowserRouter>
  )
}

export default App;
