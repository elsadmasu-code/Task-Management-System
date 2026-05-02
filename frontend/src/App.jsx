import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Layout from "./components/layout/Layout";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Dashboard from "./pages/Dashboard";
import ProjectPage from "./pages/ProjectPage";
import WorkspacePage from "./pages/WorkspacePage";
import KanbanBoard from "./pages/KanbanBoard";
import CalendarView from "./pages/CalendarView";
import ChatPage from "./pages/ChatPage";
import Settings from "./pages/Settings";
import NotificationsPage from "./pages/NotificationsPage";
import ActivityPage from "./pages/ActivityPage";
import { useSocket } from "./hooks/useSocket";

// Protected route wrapper
const PrivateRoute = ({ children }) => {
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public route wrapper (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

// Socket initialiser (runs inside authenticated context)
const SocketInit = () => {
  useSocket();
  return null;
};

const App = () => {
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);

  return (
    <>
      {isAuthenticated && <SocketInit />}
      <Routes>
        {/* Public */}
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

        {/* Protected — wrapped in Layout */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <PrivateRoute>
              <Layout>
                <ProjectPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/workspaces"
          element={
            <PrivateRoute>
              <Layout>
                <WorkspacePage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/projects/:projectId"
          element={
            <PrivateRoute>
              <Layout>
                <KanbanBoard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <PrivateRoute>
              <Layout>
                <CalendarView />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <Layout>
                <ChatPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <PrivateRoute>
              <Layout>
                <NotificationsPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/activity"
          element={
            <PrivateRoute>
              <Layout>
                <ActivityPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Layout>
                <Settings />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* Catch-all */}
        <Route
          path="*"
          element={
            <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
          }
        />
      </Routes>
    </>
  );
};

export default App;
