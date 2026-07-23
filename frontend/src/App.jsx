import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

import ProtectedRoute from "./components/ProtectedRoute";

import DashboardLayout from "./layouts/DashboardLayout";

import DashboardOverview from "./pages/DashboardOverview";
import ReportPollutionPage from "./pages/ReportPollutionPage";
import PredictionPage from "./pages/PredictionPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import RiverMapPage from "./pages/RiverMapPage";
import ReportsPage from "./pages/ReportsPage";
import NotificationsPage from "./pages/NotificationsPage";
import AuthorityPage from "./pages/AuthorityPage";

export default function App() {
  return (
    <Routes>
      {/* Redirect Root */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard Home */}
        <Route index element={<DashboardOverview />} />

        {/* Navigation Pages */}
        <Route path="report" element={<ReportPollutionPage />} />
        <Route path="prediction" element={<PredictionPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="map" element={<RiverMapPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="authority" element={<AuthorityPage />} />
      </Route>

      {/* Unknown Route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}