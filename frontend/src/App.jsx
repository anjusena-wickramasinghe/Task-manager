// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Auth pages
import Login from "./pages/admin/auth/login.jsx";
import SignUp from "./pages/admin/auth/signup.jsx";

// Admin components
import Dashboard from "./pages/admin/dashboard.jsx";
import ManageTasks from "./pages/admin/managetasks.jsx";
import ManageUsers from "./pages/admin/manageusers.jsx";
import CreateTask from "./pages/admin/createtask.jsx";

// User components
import UserDashboard from "./pages/user/userdashboard.jsx";
import MyTasks from "./pages/user/mytasks.jsx";
import TaskDetails from "./pages/user/taskdetails.jsx";

// Protected Route
import PrivateRoute from "./routes/PrivateRoute.jsx";

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
  );
};

export default App;
