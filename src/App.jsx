import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ScanProvider } from "./context/ScanContext";
import ProtectedRoute from "./routes/ProtectedRoute";

// Public imports
import LandingPage from "./pages/public/LandingPage";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";

// Layout Imports
import DashboardLayout from "./components/layout/DashboardLayout";

// Shared Imports
import CaseDetail from "./pages/shared/CaseDetail";

// Patient Imports
import PatientDashboard from "./pages/patient/PatientDashboard";
import NewScan from "./pages/patient/NewScan";
import PatientReports from "./pages/patient/PatientReports";

// Doctor Imports
import DoctorDashboard from "./pages/doctor/DoctorDashboard";

// Admin Imports
import AdminDashboard from "./pages/admin/AdminDashboard";
import SystemActivity from "./pages/admin/SystemActivity";
import UserManagement from "./pages/admin/UserManagement";

export default function App() {
  return (
    <AuthProvider>
      <ScanProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Patient Routes */}
            <Route element={<ProtectedRoute allowedRoles={["patient"]} />}>
              <Route path="/patient" element={<DashboardLayout><PatientDashboard /></DashboardLayout>} />
              <Route path="/patient/scan" element={<DashboardLayout><NewScan /></DashboardLayout>} />
              <Route path="/patient/reports" element={<DashboardLayout><PatientReports /></DashboardLayout>} />
              <Route path="/patient/case/:id" element={<DashboardLayout><CaseDetail /></DashboardLayout>} />
            </Route>

            {/* Doctor Routes */}
            <Route element={<ProtectedRoute allowedRoles={["doctor"]} />}>        
              <Route path="/doctor" element={<DashboardLayout><DoctorDashboard /></DashboardLayout>} />
              <Route path="/doctor/case/:id" element={<DashboardLayout><CaseDetail /></DashboardLayout>} />
            </Route>
            
            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>       
              <Route path="/admin" element={<DashboardLayout><AdminDashboard /></DashboardLayout>} />
              <Route path="/admin/activity" element={<DashboardLayout><SystemActivity /></DashboardLayout>} />
              <Route path="/admin/users" element={<DashboardLayout><UserManagement /></DashboardLayout>} />
              <Route path="/admin/case/:id" element={<DashboardLayout><CaseDetail /></DashboardLayout>} />
            </Route>
            {/* Wildcard Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ScanProvider>
    </AuthProvider>
  );
}
