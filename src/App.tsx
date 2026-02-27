import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import LandingPage from './pages/LandingPage';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Payroll from './pages/Payroll';
import Attendance from './pages/Attendance';
import Chat from './pages/Chat';
import AIAssistant from './pages/AIAssistant';
import Tasks from './pages/Tasks';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="min-h-screen bg-emerald-950 flex items-center justify-center text-emerald-500">Loading Workspace...</div>;
  if (!user) return <Navigate to="/" />;
  
  return <DashboardLayout>{children}</DashboardLayout>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/app/ai" element={
            <ProtectedRoute>
              <AIAssistant />
            </ProtectedRoute>
          } />
          <Route path="/app/tasks" element={
            <ProtectedRoute>
              <Tasks />
            </ProtectedRoute>
          } />
          <Route path="/app/employees" element={
            <ProtectedRoute>
              <Employees />
            </ProtectedRoute>
          } />
          <Route path="/app/payroll" element={
            <ProtectedRoute>
              <Payroll />
            </ProtectedRoute>
          } />
          <Route path="/app/attendance" element={
            <ProtectedRoute>
              <Attendance />
            </ProtectedRoute>
          } />
          <Route path="/app/chat" element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } />
          {/* Placeholders for other routes */}
          <Route path="/app/*" element={
            <ProtectedRoute>
              <div className="text-emerald-500/50 flex items-center justify-center h-64 border-2 border-dashed border-emerald-900 rounded-xl">
                Module Under Construction
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
