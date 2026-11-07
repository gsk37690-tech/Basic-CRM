import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { CrmProvider } from './context/CrmContext.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';

import { DashboardPage } from './pages/DashboardPage.jsx';
import { LeadsPage } from './pages/LeadsPage.jsx';
import { LeadDetailPage } from './pages/LeadDetailPage.jsx';
import { DealsPipelinePage } from './pages/DealsPipelinePage.jsx';
import { ContactsPage } from './pages/ContactsPage.jsx';
import { FollowUpsPage } from './pages/FollowUpsPage.jsx';
import { UsersManagementPage } from './pages/UsersManagementPage.jsx';
import { SubmissionHubPage } from './pages/SubmissionHubPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CrmProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected CRM Workflows */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leads"
              element={
                <ProtectedRoute>
                  <LeadsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leads/:id"
              element={
                <ProtectedRoute>
                  <LeadDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/deals"
              element={
                <ProtectedRoute>
                  <DealsPipelinePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contacts"
              element={
                <ProtectedRoute>
                  <ContactsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/follow-ups"
              element={
                <ProtectedRoute>
                  <FollowUpsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/team"
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Sales Manager']}>
                  <UsersManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/submission-hub"
              element={
                <ProtectedRoute>
                  <SubmissionHubPage />
                </ProtectedRoute>
              }
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CrmProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
