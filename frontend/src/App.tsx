import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import './i18n';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { PrimaryDemoModal } from './components/PrimaryDemoModal';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { ScamChecker } from './pages/ScamChecker';
import { ClaimChecker } from './pages/ClaimChecker';
import { PhoneChecker } from './pages/PhoneChecker';
import { AccountChecker } from './pages/AccountChecker';
import { TransactionAnalysis } from './pages/TransactionAnalysis';
import { FraudNetwork } from './pages/FraudNetwork';
import { FraudRings } from './pages/FraudRings';
import { Reports } from './pages/Reports';
import { Alerts } from './pages/Alerts';
import { AnalystDashboard } from './pages/AnalystDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminAnnouncements } from './pages/AdminAnnouncements';
import { AdminUsers } from './pages/AdminUsers';
import { Privacy } from './pages/Privacy';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

// Protected Route Guard strictly enforcing backend-authenticated roles
interface ProtectedRouteProps {
  allowedRoles: string[];
  currentUser: any;
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, currentUser, children }) => {
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const role = currentUser.role || 'USER';
  if (!allowedRoles.includes(role)) {
    // Redirect unauthorized attempts safely to their role's authorized dashboard
    if (role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (role === 'ANALYST') return <Navigate to="/analyst" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppContent() {
  const location = useLocation();
  const [demoOpen, setDemoOpen] = useState(false);

  // Initialize current user from localStorage or fallback
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem('arthraksha_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    // Default demo user is a normal investor USER
    return {
      id: 3,
      name: 'Ramesh Sharma',
      email: 'investor@arthraksha.in',
      phone: '+919876543210',
      role: 'USER',
      language: 'en'
    };
  });

  const handleLogout = () => {
    localStorage.removeItem('arthraksha_token');
    localStorage.removeItem('arthraksha_user');
    setCurrentUser(null);
  };

  const isLanding = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        onOpenDemo={() => setDemoOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <div className="flex flex-1">
        {/* Only show sidebar on non-landing, non-auth pages */}
        {!isLanding && !isAuthPage && <Sidebar currentUser={currentUser} />}

        <main className={`flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full ${isLanding ? 'py-4' : ''}`}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing onOpenDemo={() => setDemoOpen(true)} />} />
            <Route
              path="/login"
              element={
                <Login
                  onLoginSuccess={(user) => {
                    setCurrentUser(user);
                  }}
                />
              }
            />
            <Route
              path="/register"
              element={
                <Register
                  onLoginSuccess={(user) => {
                    setCurrentUser(user);
                  }}
                />
              }
            />
            <Route path="/privacy" element={<Privacy />} />

            {/* Standard User & Common Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['USER', 'ANALYST', 'ADMIN']} currentUser={currentUser}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/scam-checker"
              element={
                <ProtectedRoute allowedRoles={['USER', 'ANALYST', 'ADMIN']} currentUser={currentUser}>
                  <ScamChecker />
                </ProtectedRoute>
              }
            />
            <Route
              path="/claim-checker"
              element={
                <ProtectedRoute allowedRoles={['USER', 'ANALYST', 'ADMIN']} currentUser={currentUser}>
                  <ClaimChecker />
                </ProtectedRoute>
              }
            />
            <Route
              path="/phone-checker"
              element={
                <ProtectedRoute allowedRoles={['USER', 'ANALYST', 'ADMIN']} currentUser={currentUser}>
                  <PhoneChecker />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account-checker"
              element={
                <ProtectedRoute allowedRoles={['USER', 'ANALYST', 'ADMIN']} currentUser={currentUser}>
                  <AccountChecker />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transaction-analysis"
              element={
                <ProtectedRoute allowedRoles={['USER', 'ANALYST', 'ADMIN']} currentUser={currentUser}>
                  <TransactionAnalysis />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRoles={['USER', 'ANALYST', 'ADMIN']} currentUser={currentUser}>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/alerts"
              element={
                <ProtectedRoute allowedRoles={['USER', 'ANALYST', 'ADMIN']} currentUser={currentUser}>
                  <Alerts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute allowedRoles={['USER', 'ANALYST', 'ADMIN']} currentUser={currentUser}>
                  <Settings currentUser={currentUser} onUserUpdate={setCurrentUser} />
                </ProtectedRoute>
              }
            />

            {/* Analyst & Admin Investigation Routes */}
            <Route
              path="/analyst"
              element={
                <ProtectedRoute allowedRoles={['ANALYST', 'ADMIN']} currentUser={currentUser}>
                  <AnalystDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/fraud-network"
              element={
                <ProtectedRoute allowedRoles={['ANALYST', 'ADMIN']} currentUser={currentUser}>
                  <FraudNetwork />
                </ProtectedRoute>
              }
            />
            <Route
              path="/fraud-rings"
              element={
                <ProtectedRoute allowedRoles={['ANALYST', 'ADMIN']} currentUser={currentUser}>
                  <FraudRings />
                </ProtectedRoute>
              }
            />

            {/* Admin-Only Management & Control Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']} currentUser={currentUser}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/announcements"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']} currentUser={currentUser}>
                  <AdminAnnouncements />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']} currentUser={currentUser}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analysts"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']} currentUser={currentUser}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']} currentUser={currentUser}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/notifications"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']} currentUser={currentUser}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/audit-logs"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']} currentUser={currentUser}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* SANGYAN Track A 15-Step Evaluator Demo Modal */}
      <PrimaryDemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
