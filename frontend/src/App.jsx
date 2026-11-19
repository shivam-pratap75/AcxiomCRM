
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './routes/ProtectedRoute';
import Customers from './pages/Customers';
import Leads from './pages/Leads';
import FollowUps from './pages/FollowUps';
import Opportunities from './pages/Opportunities';
import Activities from './pages/Activities';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Dashboard />} />

            <Route path="customers" element={<Customers />} />
            <Route path="leads" element={<Leads />} />
            <Route path="followups" element={<FollowUps />} />
            <Route path="opportunities" element={<Opportunities />} />
            <Route path="activities" element={<Activities />} />
            <Route path="/users" element={<div>User Management Module</div>} />
            <Route path="/audit-logs" element={<div>Audit Logs Module</div>} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
