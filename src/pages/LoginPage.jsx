import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { LogIn, AlertCircle, Shield, UserPlus } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Authenticate user via JWT-protected endpoint
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const errors = {};

    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email format';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);
    const res = await login(email.trim(), password);
    setIsSubmitting(false);

    if (res.success) {
      navigate('/');
    } else {
      setErrorMsg(res.message || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-[#090b10] flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full bg-[#12151e] rounded-xl shadow-2xl border border-[#1f2432] p-8 space-y-6">
        <div className="text-center">
          <div className="inline-flex p-3 rounded-xl bg-[#f43f5e]/15 text-[#ff4b6e] border border-[#f43f5e]/30 mb-3 shadow-sm shadow-[#f43f5e]/10">
            <LogIn className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Sign In to CRM</h1>
          <p className="text-xs text-zinc-400 mt-1">
            JWT-authenticated access with role-based authorization
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-[#241117] border border-[#4d1d29] text-[#ff758f] text-xs rounded flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#ff4b6e]" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Standard Controlled Login Form with JWT Token Verification */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-zinc-300 mb-1">
              Email Address <span className="text-[#ff4b6e]">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: '' }));
              }}
              placeholder="e.g. yourname@collegecrm.edu"
              className={`w-full p-2.5 bg-[#0e1017] border rounded text-zinc-100 placeholder-zinc-500 focus:border-[#f43f5e] focus:outline-none transition-colors ${
                fieldErrors.email ? 'border-[#f43f5e] bg-[#241117]' : 'border-[#232838]'
              }`}
            />
            {fieldErrors.email && (
              <p className="text-[#ff4b6e] text-2xs mt-1 font-medium">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block font-medium text-zinc-300 mb-1">
              Password <span className="text-[#ff4b6e]">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={e => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: '' }));
              }}
              placeholder="••••••••"
              className={`w-full p-2.5 bg-[#0e1017] border rounded text-zinc-100 placeholder-zinc-500 focus:border-[#f43f5e] focus:outline-none transition-colors ${
                fieldErrors.password ? 'border-[#f43f5e] bg-[#241117]' : 'border-[#232838]'
              }`}
            />
            {fieldErrors.password && (
              <p className="text-[#ff4b6e] text-2xs mt-1 font-medium">{fieldErrors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-[#f43f5e] hover:bg-[#e11d48] text-white rounded font-medium transition-all shadow-sm shadow-[#f43f5e]/25 disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <Shield className="w-4 h-4" />
            <span>{isSubmitting ? 'Verifying & Signing In...' : 'Sign In with JWT'}</span>
          </button>
        </form>

        <div className="pt-3 border-t border-[#1f2432] text-center text-xs text-zinc-400 space-y-2.5">
          <p>Don't have an account yet?</p>
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 border border-[#232838] bg-[#0e1017] hover:bg-[#161a25] rounded font-medium text-zinc-300 hover:text-white transition-colors text-xs"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#ff4b6e]" />
            <span>Register a New User</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
