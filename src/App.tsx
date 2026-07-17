import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ClientBooking } from './pages/ClientBooking';
import { AdminDashboard } from './pages/AdminDashboard';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';

import type { ReactNode } from 'react';
import { TurnosProvider, useTurnosContext } from './context/TurnosContext';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useTurnosContext();
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Tenant Booking Route directly mounts ClientBooking

function App() {
  return (
    <TurnosProvider>
      <BrowserRouter>
        <Routes>
          {/* Public SaaS Landing Page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Admin Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          {/* Dynamic Client Booking Route (Must be at the bottom to prevent overriding /login) */}
          <Route path="/:tenantId" element={<ClientBooking />} />
        </Routes>
      </BrowserRouter>
    </TurnosProvider>
  );
}

export default App;
