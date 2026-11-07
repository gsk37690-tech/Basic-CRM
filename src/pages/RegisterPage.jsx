import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { UserPlus, AlertCircle } from 'lucide-react';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Sales Executive');

  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const errors = {};

    if (!name.trim()) {
      errors.name = 'Full name is required';
    }

    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please provide a valid email format';
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
    const res = await register(name.trim(), email.trim(), password, role, phone);
    setIsSubmitting(false);

    if (res.success) {
      navigate('/');
    } else {
      setErrorMsg(res.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#090b10] flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full bg-[#12151e] rounded-xl shadow-2xl border border-[#1f2432] p-8 space-y-6">
        <div className="text-center">
          <div className="inline-flex p-3 rounded-xl bg-[#f43f5e]/15 text-[#ff4b6e] border border-[#f43f5e]/30 mb-3 shadow-sm shadow-[#f43f5e]/10">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Create Staff Account</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Register a new User with role-based permissions in the MERN database
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-[#241117] border border-[#4d1d29] text-[#ff758f] text-xs rounded flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#ff4b6e]" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-medium text-zinc-300 mb-1">
              Full Name <span className="text-[#ff4b6e]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => {
                setName(e.target.value);
                if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: '' }));
              }}
              placeholder="e.g. Pam Beesly"
              className={`w-full p-2.5 bg-[#0e1017] border rounded text-zinc-100 placeholder-zinc-500 focus:border-[#f43f5e] focus:outline-none transition-colors ${
                fieldErrors.name ? 'border-[#f43f5e] bg-[#241117]' : 'border-[#232838]'
              }`}
            />
            {fieldErrors.name && (
              <p className="text-[#ff4b6e] text-2xs mt-1 font-medium">{fieldErrors.name}</p>
            )}
          </div>

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
              placeholder="pam@collegecrm.edu"
              className={`w-full p-2.5 bg-[#0e1017] border rounded text-zinc-100 placeholder-zinc-500 focus:border-[#f43f5e] focus:outline-none transition-colors ${
                fieldErrors.email ? 'border-[#f43f5e] bg-[#241117]' : 'border-[#232838]'
              }`}
            />
            {fieldErrors.email && (
              <p className="text-[#ff4b6e] text-2xs mt-1 font-medium">{fieldErrors.email}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-300 mb-1">
                Password <span className="text-[#ff4b6e]">*</span> (min 6)
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

            <div>
              <label className="block font-medium text-zinc-300 mb-1">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+1 555-0129"
                className="w-full p-2.5 bg-[#0e1017] border border-[#232838] rounded text-zinc-100 placeholder-zinc-500 focus:border-[#f43f5e] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-zinc-300 mb-1">User Role</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full p-2.5 bg-[#0e1017] border border-[#232838] rounded text-zinc-100 text-xs focus:border-[#f43f5e] focus:outline-none transition-colors"
            >
              <option value="Sales Executive" className="bg-[#12151e] text-zinc-100">Sales Executive (Standard Sales User)</option>
              <option value="Sales Manager" className="bg-[#12151e] text-zinc-100">Sales Manager (Lead Assignment & Deletions)</option>
              <option value="Admin" className="bg-[#12151e] text-zinc-100">Admin (Full System Privileges)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-[#f43f5e] hover:bg-[#e11d48] text-white rounded font-medium transition-all shadow-sm shadow-[#f43f5e]/25 disabled:opacity-50"
          >
            {isSubmitting ? 'Registering...' : 'Complete Registration'}
          </button>
        </form>

        <div className="text-center text-xs text-zinc-400">
          Already registered?{' '}
          <Link to="/login" className="text-[#ff4b6e] hover:text-[#f43f5e] hover:underline font-medium">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};
