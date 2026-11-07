import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCrm } from '../context/CrmContext.jsx';
import {
  LayoutDashboard,
  Users2,
  TrendingUp,
  Contact,
  CalendarCheck2,
  Shield,
  FileCode2,
  LogOut,
  RotateCcw,
  Menu,
  X,
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { resetDemoData } = useCrm();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const allNavItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Leads', path: '/leads', icon: Users2 },
    { name: 'Deals Pipeline', path: '/deals', icon: TrendingUp },
    { name: 'Contacts', path: '/contacts', icon: Contact },
    { name: 'Follow-Ups', path: '/follow-ups', icon: CalendarCheck2 },
    { name: 'Team & Roles', path: '/team', icon: Shield, allowedRoles: ['Admin', 'Sales Manager'] },
    { name: 'Submission Hub', path: '/submission-hub', icon: FileCode2 },
  ];

  // Role-Based Navigation: conditionally filter items based on active user role
  const navItems = allNavItems.filter(
    item => !item.allowedRoles || item.allowedRoles.includes(user?.role)
  );

  let roleColor = 'bg-[#181c26] text-zinc-300 border-[#272d3d]';
  if (user?.role === 'Admin') roleColor = 'bg-[#f43f5e]/20 text-[#ff4b6e] border-[#f43f5e]/40';
  if (user?.role === 'Sales Manager') roleColor = 'bg-[#1e222e] text-zinc-200 border-[#2e3547]';
  if (user?.role === 'Sales Executive') roleColor = 'bg-[#1e222e] text-zinc-300 border-[#2e3547]';

  return (
    <header className="bg-[#0c0e15] border-b border-[#1b1f2b] sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15">
          {/* Brand & Nav items */}
          <div className="flex items-center gap-6">
            <NavLink to="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#f43f5e] to-[#ff6b87] flex items-center justify-center text-white font-bold text-xs shadow-sm shadow-[#f43f5e]/30">
                CRM
              </div>
              <span className="text-sm font-bold text-white tracking-tight">
                Basic CRM
              </span>
              <span className="text-2xs bg-[#151822] border border-[#232734] text-zinc-400 px-1.5 py-0.5 rounded font-mono">
                JWT Auth
              </span>
            </NavLink>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(item => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-[#f43f5e]/15 text-[#ff4b6e] font-semibold border border-[#f43f5e]/30 shadow-xs'
                          : 'text-zinc-400 hover:text-white hover:bg-[#151824]'
                      }`
                    }
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-3">
            {/* Authenticated User & Role Badge */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col items-end text-right">
                <span className="text-xs font-semibold text-zinc-200">{user?.name}</span>
                <span className="text-2xs text-zinc-500 font-mono">{user?.email}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-2xs font-semibold border ${roleColor}`}>
                {user?.role}
              </span>
            </div>

            <span className="text-zinc-700 hidden sm:inline">|</span>

            {/* Reset Demo DB Helper */}
            <button
              onClick={() => {
                if (window.confirm('Reset demo database to fresh sample records?')) {
                  resetDemoData();
                }
              }}
              className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-[#161a25] transition-colors"
              title="Reset Demo Records"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded border border-[#272d3e] bg-[#141722] text-xs font-medium text-zinc-300 hover:bg-[#1e2334] hover:text-white transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 md:hidden text-zinc-400 hover:text-white hover:bg-[#161a25] rounded transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#1b1f2b] bg-[#0c0e15] px-4 py-3 space-y-1 shadow-xl">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#f43f5e]/15 text-[#ff4b6e] font-semibold border border-[#f43f5e]/30'
                      : 'text-zinc-400 hover:text-white hover:bg-[#151824]'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}

          <div className="pt-2 mt-2 border-t border-[#1a1e2a] flex items-center justify-between">
            <div className="text-2xs text-zinc-400">
              <span className="font-semibold text-zinc-200">{user?.name}</span> ({user?.role})
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#171a26] text-2xs font-medium text-zinc-300 hover:bg-[#202535] hover:text-white border border-[#282f42]"
            >
              <LogOut className="w-3 h-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
