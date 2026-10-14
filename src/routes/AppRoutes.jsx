import { Routes, Route, Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import MainLayout from "../layouts/MainLayout";

import SplashScreen from "../pages/SplashScreen";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Notes from "../pages/Notes";
import Events from "../pages/Events";
import Projects from "../pages/Projects";
import FindTeammates from "../pages/FindTeammates";
import ProjectTeamDashboard from "../pages/ProjectTeamDashboard";
import LostFound from "../pages/LostFound";
import Chat from "../pages/Chat";
import Profile from "../pages/Profile";
import Announcements from "../pages/Announcements";
import AIStudyAssistant from "../pages/AIStudyAssistant";
import Placements from "../pages/Placements";
import Applications from "../pages/Applications";

import AdminDashboard from "../pages/AdminDashboard";

// Protected Route
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" replace />;
};

// Admin Route
const AdminRoute = ({ children }) => {
  const { isAdmin } = useAuth();
  return isAdmin ? children : <Navigate to="/dashboard" replace />;
};

// Public Route
const PublicRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? (
    <Navigate to="/dashboard" replace />
  ) : (
    children
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Splash */}
      <Route path="/" element={<SplashScreen />} />

      {/* Auth */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/notes" element={<Notes />} />

        <Route path="/projects" element={<Projects />} />

        <Route path="/projects/:id" element={<ProjectTeamDashboard />} />

        <Route path="/teammates" element={<FindTeammates />} />

        <Route path="/my-groups" element={<ProjectTeamDashboard />} />

        <Route path="/events" element={<Events />} />

        <Route path="/applications" element={<Applications />} />

        <Route path="/lost-found" element={<LostFound />} />

        <Route path="/chat" element={<Chat />} />

        <Route path="/announcements" element={<Announcements />} />

        <Route path="/profile" element={<Profile />} />

        <Route path="/ai-assistant" element={<AIStudyAssistant />} />

        <Route path="/placements" element={<Placements />} />
      </Route>

      {/* Admin Route */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;