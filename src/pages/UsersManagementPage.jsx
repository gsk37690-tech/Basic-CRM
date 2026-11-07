import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext.jsx';
const API_BASE = `${import.meta.env.VITE_API_URL || ''}/api`.replace(/\/+$/, '');
import { useAuth } from '../context/AuthContext.jsx';
import { ShieldAlert, Mail, Check } from 'lucide-react';

export const UsersManagementPage = () => {
  const { teamUsers, fetchTeamUsers } = useCrm();
  const { user, token } = useAuth();
  const [updatingId, setUpdatingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const isAdmin = user?.role === 'Admin';

  const handleRoleChange = async (userId, newRole) => {
    try {
      setUpdatingId(userId);
      const res = await fetch(`${API_BASE}/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Role successfully changed to ${newRole}`);
        setTimeout(() => setSuccessMsg(null), 3000);
        await fetchTeamUsers();
      }
    } catch (err) {
      console.error('Role update error:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const roleDefinitions = [
    {
      role: 'Admin',
      description: 'Full system privileges: user provisioning, role adjustments, deleting records, system reset, and audit.',
      badge: 'bg-[#f43f5e]/15 text-[#ff4b6e] border-[#f43f5e]/30',
    },
    {
      role: 'Sales Manager',
      description: 'Management oversight: lead assignments, team pipeline distribution, deleting leads/deals, and performance reports.',
      badge: 'bg-zinc-800 text-zinc-200 border-zinc-700',
    },
    {
      role: 'Sales Executive',
      description: 'Operational sales execution: lead capturing, logging calls/notes, scheduling follow-ups, and closing deals.',
      badge: 'bg-[#181c26] text-zinc-300 border-[#272d3d]',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="border-b border-[#1f2432] pb-4">
        <h1 className="text-xl font-bold text-white tracking-tight">Team Staff & Role Access Control</h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Role-based access matrix enforcing permissions across Admin, Sales Manager, and Sales Executive.
        </p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 p-3 bg-[#0f1d16] border border-[#1d3d2c] text-emerald-400 text-xs rounded">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Role Definitions Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {roleDefinitions.map(def => (
          <div key={def.role} className="bg-[#12151e] border border-[#1f2432] rounded-lg p-4 shadow-sm space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-100">{def.role}</span>
              <span className={`px-2 py-0.5 rounded text-2xs font-semibold border ${def.badge}`}>
                {def.role}
              </span>
            </div>
            <p className="text-zinc-400 text-2xs leading-relaxed">{def.description}</p>
          </div>
        ))}
      </div>

      {/* Team Users Table */}
      <div className="bg-[#12151e] border border-[#1f2432] rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#1f2432] flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Team Accounts ({teamUsers.length})</h2>
          {!isAdmin && (
            <div className="flex items-center gap-1.5 text-2xs text-[#ff758f] bg-[#241117] px-2.5 py-1 rounded border border-[#4d1d29]">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Role modification restricted to Admin account</span>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e1017] border-b border-[#1f2432] text-zinc-400 font-semibold uppercase tracking-wider text-2xs">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4 text-right">Role Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181c26]">
              {teamUsers.map(member => (
                <tr key={member.id} className="hover:bg-[#161a25] transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-zinc-100">{member.name}</div>
                    <div className="text-2xs text-zinc-500 font-mono">ID: {member.id}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 text-zinc-300">
                      <Mail className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{member.email}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-zinc-300">
                    {member.phone || '—'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-2xs font-semibold bg-[#181c26] text-zinc-200 border border-[#272d3d]">
                      {member.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {isAdmin ? (
                      <select
                        disabled={updatingId === member.id}
                        value={member.role}
                        onChange={e => handleRoleChange(member.id, e.target.value)}
                        className="p-1.5 border border-[#232838] rounded text-xs bg-[#0e1017] text-zinc-100 focus:border-[#f43f5e] focus:outline-none transition-colors"
                      >
                        <option value="Admin" className="bg-[#12151e] text-zinc-100">Admin</option>
                        <option value="Sales Manager" className="bg-[#12151e] text-zinc-100">Sales Manager</option>
                        <option value="Sales Executive" className="bg-[#12151e] text-zinc-100">Sales Executive</option>
                      </select>
                    ) : (
                      <span className="text-2xs text-zinc-500 italic">View Only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
