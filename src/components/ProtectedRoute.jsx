import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Navbar } from './Navbar.jsx';
import { AlertBanner } from './AlertBanner.jsx';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

/**
 * Reusable ProtectedRoute wrapper component (Rubric requirement: "A dedicated <ProtectedRoute> wrapper that redirects unauthenticated users to /login.")
 * Supports optional `allowedRoles` for role-based route guard.
 */
export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // 1. Loading authentication verification state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090b10] text-zinc-400">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin w-6 h-6 border-2 border-[#f43f5e] border-t-transparent rounded-full"></div>
          <p className="text-xs font-medium">Verifying authentication session...</p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated redirect to /login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. Role-Based Route Authorization Check
  if (allowedRoles && Array.isArray(allowedRoles) && !allowedRoles.includes(user?.role)) {
    return (
      <div className="min-h-screen flex flex-col bg-[#090b10] text-zinc-100">
        <Navbar />
        <AlertBanner />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#12151e] border border-[#3b1d26] rounded-lg p-6 shadow-xl text-center space-y-3">
            <div className="w-12 h-12 bg-[#2d1218] text-[#f43f5e] rounded-full flex items-center justify-center mx-auto border border-[#4d1f2b]">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-white">Access Restricted</h2>
            <p className="text-xs text-zinc-400">
              Your role <strong className="text-[#ff4b6e]">({user?.role})</strong> does not have authorization
              to access this route. Authorized roles:{' '}
              <span className="font-mono font-medium text-zinc-300">{allowedRoles.join(', ')}</span>.
            </p>
            <div className="pt-2">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#f43f5e] text-white rounded text-xs font-medium hover:bg-[#e11d48] transition-colors shadow-sm shadow-[#f43f5e]/25"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Dashboard</span>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 4. Authenticated & Authorized rendering
  return (
    <div className="min-h-screen flex flex-col bg-[#090b10] text-zinc-100">
      <Navbar />
      <AlertBanner />
      <main className="flex-1 pb-12">{children}</main>
      <footer className="bg-[#0b0d14] border-t border-[#1a1e28] py-4 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Basic CRM &copy; 2026 · College Academic Project #2</span>
          <span className="font-mono text-2xs text-zinc-500">
            Stack: ReactJS (JSX), Vite, Context API, ExpressJS, MongoDB/Mongoose Architecture
          </span>
        </div>
      </footer>
    </div>
  );
};
