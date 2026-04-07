import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

// Public imports
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";

// Layout Imports
import DashboardLayout from "./components/layout/DashboardLayout";

// Patient Imports
import PatientDashboard from "./pages/patient/PatientDashboard";
import NewScan from "./pages/patient/NewScan";

// Doctor Imports
import DoctorDashboard from "./pages/doctor/DoctorDashboard";

// Admin Imports
import AdminDashboard from "./pages/admin/AdminDashboard";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Patient Routes */}
          <Route element={<ProtectedRoute allowedRoles={["patient"]} />}>
            <Route path="/patient" element={<DashboardLayout><PatientDashboard /></DashboardLayout>} />
            <Route path="/patient/scan" element={<DashboardLayout><NewScan /></DashboardLayout>} />
          </Route>

          {/* Doctor Routes */}
          <Route element={<ProtectedRoute allowedRoles={["doctor"]} />}>        
            <Route path="/doctor" element={<DashboardLayout><DoctorDashboard /></DashboardLayout>} />
          </Route>
          
          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>        
            <Route path="/admin" element={<DashboardLayout><AdminDashboard /></DashboardLayout>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
