import React from 'react';
import { Link } from 'react-router-dom';
import { useCrm } from '../context/CrmContext.jsx';
import {
  Users2,
  TrendingUp,
  DollarSign,
  CalendarCheck2,
  PhoneCall,
  CheckCircle,
  PlusCircle,
  FileCode2,
  ExternalLink,
} from 'lucide-react';

export const DashboardPage = () => {
  const { dashboardStats, activities } = useCrm();

  if (!dashboardStats) {
    return (
      <div className="p-8 text-center text-slate-500">
        <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full mb-2"></div>
        <p className="text-sm">Loading CRM dashboard metrics...</p>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Total Inbound Leads',
      value: dashboardStats.totalLeads,
      subtitle: `${dashboardStats.hotLeads} Hot Leads`,
      icon: Users2,
      badgeColor: 'bg-[#f43f5e]/15 text-[#ff4b6e] border border-[#f43f5e]/30',
      trend: '+14% this month',
    },
    {
      title: 'Lead Conversion Rate',
      value: `${dashboardStats.conversionRate}%`,
      subtitle: `${dashboardStats.convertedLeads} Converted to Customers`,
      icon: CheckCircle,
      badgeColor: 'bg-[#f43f5e]/15 text-[#ff4b6e] border border-[#f43f5e]/30',
      trend: '+4.2% vs target',
    },
    {
      title: 'Pipeline Active Value',
      value: `$${dashboardStats.pipelineValue.toLocaleString()}`,
      subtitle: `${dashboardStats.totalDeals} Open Opportunities`,
      icon: TrendingUp,
      badgeColor: 'bg-[#1c2130] text-zinc-300 border border-[#2c344a]',
      trend: '+18% velocity',
    },
    {
      title: 'Won Revenue',
      value: `$${dashboardStats.totalRevenue.toLocaleString()}`,
      subtitle: 'Closed Won Contracts',
      icon: DollarSign,
      badgeColor: 'bg-[#f43f5e]/20 text-[#ff4b6e] border border-[#f43f5e]/40',
      trend: '+26% QoQ',
    },
    {
      title: 'Pending Follow-Ups',
      value: dashboardStats.pendingFollowUps,
      subtitle: 'Calls & meetings scheduled',
      icon: CalendarCheck2,
      badgeColor: 'bg-[#1c2130] text-zinc-300 border border-[#2c344a]',
      trend: 'Active queue',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#1b1f2b] pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">CRM Executive Summary Dashboard</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time pipeline analytics, lead conversion tracking, and sales team metrics.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/leads"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f43f5e] text-white rounded text-xs font-semibold hover:bg-[#e11d48] shadow-sm shadow-[#f43f5e]/30 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Capture New Lead</span>
          </Link>
          <Link
            to="/follow-ups"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141722] border border-[#24293a] text-zinc-300 rounded text-xs font-medium hover:bg-[#1d2232] hover:text-white transition-colors"
          >
            <CalendarCheck2 className="w-3.5 h-3.5 text-[#ff4b6e]" />
            <span>Schedule Follow-Up</span>
          </Link>
          <Link
            to="/submission-hub"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141722] border border-[#24293a] text-zinc-300 rounded text-xs font-medium hover:bg-[#1d2232] hover:text-white transition-colors"
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>ER Diagram & Docs</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Strip with Sparkline curve reminiscent of screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-[#12151e] border border-[#1f2432] rounded-lg p-4 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-[#2f374c] transition-colors"
            >
              <div className="flex items-center justify-between z-10">
                <span className="text-xs font-medium text-zinc-400">{kpi.title}</span>
                <div className={`p-1.5 rounded ${kpi.badgeColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 z-10">
                <div className="text-2xl font-bold text-white tabular-nums tracking-tight">
                  {kpi.value}
                </div>
                <div className="flex items-center justify-between mt-1 text-2xs">
                  <span className="text-zinc-400">{kpi.subtitle}</span>
                  <span className="text-[#ff4b6e] font-mono font-medium">{kpi.trend}</span>
                </div>
              </div>

              {/* Subtle coral glow curve across bottom of card like reference image */}
              <div className="absolute -bottom-1 left-0 right-0 h-6 opacity-30 pointer-events-none">
                <svg viewBox="0 0 100 24" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                  <path
                    d={`M 0,${18 + (idx % 3) * 2} Q 25,${8 - (idx % 2) * 4} 50,${14 + (idx % 2) * 3} T 100,${6 + (idx % 3) * 3}`}
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Pipeline Breakdown & Lead Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Stage Breakdown */}
        <div className="lg:col-span-2 bg-[#12151e] border border-[#1f2432] rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#1b1f2b]">
            <div>
              <h2 className="text-sm font-bold text-white">Sales Pipeline Stage Funnel</h2>
              <p className="text-xs text-zinc-400">Distribution of revenue opportunities by sales stage</p>
            </div>
            <Link to="/deals" className="text-xs text-[#ff4b6e] hover:underline flex items-center gap-1 font-medium">
              <span>View Pipeline</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="mt-4 space-y-3.5">
            {Object.entries(dashboardStats.stageCounts).map(([stage, info]) => {
              const maxVal = Math.max(
                ...Object.values(dashboardStats.stageCounts).map(s => s.value),
                1
              );
              const percent = Math.min(100, Math.round((info.value / maxVal) * 100));

              let barColor = 'bg-[#f43f5e]';
              if (stage === 'Closed Won') barColor = 'bg-[#ff3b5c]';
              if (stage === 'Closed Lost') barColor = 'bg-zinc-600';
              if (stage === 'Negotiation') barColor = 'bg-[#fb7185]';

              return (
                <div key={stage} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-zinc-300">
                      {stage} <span className="text-zinc-500">({info.count} deals)</span>
                    </span>
                    <span className="font-semibold text-white tabular-nums">
                      ${info.value.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-[#181c27] rounded-full h-2 overflow-hidden border border-[#222736]">
                    <div
                      className={`h-2 rounded-full ${barColor} transition-all duration-300`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lead Sources Breakdown */}
        <div className="bg-[#12151e] border border-[#1f2432] rounded-lg p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-[#1b1f2b]">
              <h2 className="text-sm font-bold text-white">Leads by Inbound Channel</h2>
              <p className="text-xs text-zinc-400">Origin source of captured leads</p>
            </div>

            <div className="mt-4 space-y-2.5">
              {Object.entries(dashboardStats.sourceCounts).map(([source, count]) => {
                const total = dashboardStats.totalLeads || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={source} className="flex items-center justify-between text-xs py-1.5 border-b border-[#181c28]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#f43f5e]"></span>
                      <span className="text-zinc-300">{source}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white tabular-nums">{count}</span>
                      <span className="text-zinc-500 font-mono text-2xs">({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-[#1b1f2b] bg-[#0e1017] p-3 rounded text-xs text-zinc-400 border border-[#191d29]">
            <span className="font-semibold text-zinc-200">Academic Tip:</span> All leads can be filtered and sorted by channel in the Leads table.
          </div>
        </div>
      </div>

      {/* Secondary Grid: Team Performance & Recent Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Performance Table */}
        <div className="bg-[#12151e] border border-[#1f2432] rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#1b1f2b]">
            <div>
              <h2 className="text-sm font-bold text-white">Sales Representatives Performance</h2>
              <p className="text-xs text-zinc-400">Assigned leads, won opportunities, and closed revenue</p>
            </div>
            <Link to="/team" className="text-xs text-[#ff4b6e] hover:underline font-medium">
              Manage Team
            </Link>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1f2432] text-zinc-400 font-medium">
                  <th className="py-2.5">Representative</th>
                  <th className="py-2.5">Role</th>
                  <th className="py-2.5 text-right">Assigned Leads</th>
                  <th className="py-2.5 text-right">Won Deals</th>
                  <th className="py-2.5 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#181c28]">
                {dashboardStats.executiveStats.map(exec => (
                  <tr key={exec.userId} className="hover:bg-[#161a25] transition-colors">
                    <td className="py-2.5 font-medium text-white">{exec.userName}</td>
                    <td className="py-2.5 text-zinc-400">{exec.role}</td>
                    <td className="py-2.5 text-right tabular-nums font-medium text-zinc-300">
                      {exec.leadCount}
                    </td>
                    <td className="py-2.5 text-right tabular-nums font-semibold text-[#ff4b6e]">
                      {exec.wonDeals}
                    </td>
                    <td className="py-2.5 text-right tabular-nums font-semibold text-white">
                      ${exec.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity Log */}
        <div className="bg-[#12151e] border border-[#1f2432] rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#1b1f2b]">
            <div>
              <h2 className="text-sm font-bold text-white">Recent Customer Activities</h2>
              <p className="text-xs text-zinc-400">Live feed of logged calls, emails, and notes</p>
            </div>
            <span className="text-xs text-zinc-500 font-mono">
              {activities.length} logged
            </span>
          </div>

          <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {activities.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4 text-center">No recent activities logged</p>
            ) : (
              activities.slice(0, 5).map(act => (
                <div key={act.id} className="flex items-start gap-3 p-2.5 rounded bg-[#0e1017] border border-[#1a1e2a] text-xs">
                  <div className="p-1.5 rounded bg-[#f43f5e]/15 text-[#ff4b6e] border border-[#f43f5e]/30 mt-0.5">
                    <PhoneCall className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-zinc-200">{act.summary}</span>
                      <span className="text-2xs text-zinc-500 font-mono">
                        {new Date(act.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-zinc-400 mt-0.5">{act.details}</p>
                    <div className="text-2xs text-zinc-500 mt-1">
                      Logged by {act.performedByName || 'Staff'} · Type: {act.type}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
