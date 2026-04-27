import React from 'react';
import { Role, Case, Hearing } from '../types';
import { CASES, HEARINGS } from '../constants';
import { Card, StatWidget, GoldLine } from './UI';
import { Calendar, Clock, MapPin, FileText, TrendingUp } from 'lucide-react';

interface DashboardProps {
  role: Role;
}

export const Dashboard: React.FC<DashboardProps> = ({ role }) => {
  const stats = {
    Client: [
      { label: 'Active Cases', value: 1, subtitle: 'Ongoing legal matters', color: 'gold' },
      { label: 'Next Hearing', value: '15 Apr', subtitle: 'Supreme Court of India', color: 'warn' },
      { label: 'Documents', value: 12, subtitle: 'Uploaded & verified', color: 'info' }
    ],
    Lawyer: [
      { label: 'Total Cases', value: 12, subtitle: 'Active & closed', color: 'gold' },
      { label: 'Win Rate', value: '86%', subtitle: 'Successful judgments', color: 'success' },
      { label: 'Hearings', value: 4, subtitle: 'Scheduled this month', color: 'warn' },
      { label: 'Clients', value: 8, subtitle: 'Active representation', color: 'info' }
    ],
    Judge: [
      { label: 'Bench Cases', value: 42, subtitle: 'Pending adjudication', color: 'gold' },
      { label: 'Disposal Rate', value: '92%', subtitle: 'Monthly average', color: 'success' },
      { label: 'Next Bench', value: '2:30 PM', subtitle: 'Courtroom 4', color: 'warn' },
      { label: 'Judgment Due', value: 5, subtitle: 'Within 7 days', color: 'danger' }
    ],
    Court: [
      { label: 'Total Benches', value: 12, subtitle: 'Active courtrooms', color: 'gold' },
      { label: 'Daily Cases', value: 156, subtitle: 'Scheduled today', color: 'info' },
      { label: 'Filing Queue', value: 24, subtitle: 'Awaiting registration', color: 'warn' },
      { label: 'Disposed Today', value: 18, subtitle: 'Final judgments', color: 'success' }
    ],
    Clerk: [
      { label: 'Filing Queue', value: 15, subtitle: 'Awaiting registration', color: 'warn' },
      { label: 'Daily Logs', value: 124, subtitle: 'Entries today', color: 'info' },
      { label: 'Pending Docs', value: 45, subtitle: 'Verification required', color: 'danger' }
    ],
    Builder: [
      { label: 'Total Users', value: '1.2k', subtitle: 'Active platform users', color: 'gold' },
      { label: 'API Calls', value: '45k', subtitle: 'Last 24 hours', color: 'info' },
      { label: 'System Health', value: '99.9%', subtitle: 'Uptime status', color: 'success' }
    ]
  };

  const currentStats = stats[role] || stats.Lawyer;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-serif font-bold text-gold">Welcome back, {role}</h1>
        <p className="text-text-muted">Here's an overview of your legal workspace today.</p>
      </div>

      <div className={`grid gap-6 ${currentStats.length <= 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
        {currentStats.map((stat, idx) => (
          <StatWidget key={idx} {...stat} />
        ))}
      </div>

      {role === 'Client' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 flex flex-col gap-4">
            <h3 className="text-lg font-serif font-bold">Case Status Overview</h3>
            <div className="flex flex-col gap-4">
              {[
                { label: 'Hearing', count: 1, color: '#C49428' },
                { label: 'Filed', count: 2, color: '#63B3ED' },
                { label: 'Judgment Pending', count: 1, color: '#B794F4' },
                { label: 'Closed', count: 1, color: '#48BB78' }
              ].map((s) => (
                <div key={s.label} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted">{s.label}</span>
                    <span className="font-bold">{s.count}</span>
                  </div>
                  <div className="h-1.5 w-full bg-bg2 rounded-full overflow-hidden">
                    <div className="h-full bg-gold" style={{ width: `${(s.count / 5) * 100}%`, backgroundColor: s.color }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card className="flex flex-col gap-4 items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center text-gold mb-2">
              <TrendingUp size={32} />
            </div>
            <h4 className="font-serif font-bold">Legal Progress</h4>
            <p className="text-xs text-text-muted">Your cases are moving 15% faster than last month due to AI-assisted filing.</p>
          </Card>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-serif font-bold">Upcoming Hearings</h2>
          <button className="text-sm text-gold hover:underline">View all</button>
        </div>
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg2 text-text-muted text-[10px] uppercase tracking-widest font-bold">
                <th className="p-4 border-b border-border">Date</th>
                <th className="p-4 border-b border-border">Case ID</th>
                <th className="p-4 border-b border-border">Court</th>
                <th className="p-4 border-b border-border">Time</th>
                <th className="p-4 border-b border-border">Type</th>
              </tr>
            </thead>
            <tbody>
              {HEARINGS.map((h, idx) => {
                const displayCourt = (role === 'Client' || role === 'Judge') ? 'Supreme Court of India' : h.court;
                return (
                  <tr key={idx} className="hover:bg-bg3 transition-colors border-b border-border last:border-0 group">
                    <td className="p-4 text-sm font-medium flex items-center gap-2">
                      <Calendar size={14} className="text-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                      {h.date}
                    </td>
                    <td className="p-4 text-sm font-mono text-info">{h.caseId}</td>
                    <td className="p-4 text-sm text-text-muted">{displayCourt}</td>
                    <td className="p-4 text-sm flex items-center gap-2">
                      <Clock size={14} className="text-warn" />
                      {h.time}
                    </td>
                    <td className="p-4 text-sm">
                      <span className="px-2 py-0.5 rounded bg-bg2 text-text-muted text-[10px] uppercase font-bold border border-border">
                        {h.type}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
};
