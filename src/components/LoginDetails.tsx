import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { LoginLog } from '../types';
import { Card, Pill } from './UI';
import { Users, Clock, Calendar, Mail, Shield, Search } from 'lucide-react';
import { motion } from 'motion/react';

export const LoginDetails: React.FC = () => {
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(
      collection(db, 'login_logs'),
      orderBy('lastActive', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newLogs = snapshot.docs.map(doc => doc.data() as LoginLog);
      setLogs(newLogs);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching login logs:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-serif font-bold text-gold">Login Details</h1>
        <p className="text-text-muted">Track user access and session activity across the platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 flex items-center gap-4 bg-bg2/50">
          <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center text-info">
            <Users size={24} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-text-dim">Active Sessions</p>
            <h3 className="text-2xl font-bold">{logs.filter(l => {
              const lastActive = new Date(l.lastActive).getTime();
              const now = new Date().getTime();
              return (now - lastActive) < 300000; // Active in last 5 mins
            }).length}</h3>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4 bg-bg2/50">
          <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-text-dim">Avg. Session Duration</p>
            <h3 className="text-2xl font-bold">
              {logs.length > 0 
                ? Math.round(logs.reduce((acc, curr) => acc + curr.duration, 0) / logs.length) 
                : 0} min
            </h3>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4 bg-bg2/50">
          <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center text-success">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-text-dim">Total Logins (Recent)</p>
            <h3 className="text-2xl font-bold">{logs.length}</h3>
          </div>
        </Card>
      </div>

      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-gold transition-colors" size={18} />
        <input 
          type="text" 
          placeholder="Filter by email or role..." 
          className="w-full bg-bg2 border border-border rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-gold transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card className="p-0 overflow-hidden border-border/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-bg2 text-text-muted text-[10px] uppercase tracking-widest font-bold">
                <th className="p-4 border-b border-border">User Email</th>
                <th className="p-4 border-b border-border">Role</th>
                <th className="p-4 border-b border-border">Login Time</th>
                <th className="p-4 border-b border-border">Last Active</th>
                <th className="p-4 border-b border-border">Duration</th>
                <th className="p-4 border-b border-border">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredLogs.map((log) => {
                const isActive = (new Date().getTime() - new Date(log.lastActive).getTime()) < 300000;
                return (
                  <tr key={log.id} className="hover:bg-bg3 transition-colors border-b border-border last:border-0 group">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-text-dim" />
                        <span className="text-sm font-medium">{log.email}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Shield size={14} className="text-gold/50" />
                        <span className="text-xs">{log.role}</span>
                      </div>
                    </td>
                    <td className="p-4 text-xs text-text-muted">
                      {formatTime(log.loginTime)}
                    </td>
                    <td className="p-4 text-xs text-text-muted">
                      {formatTime(log.lastActive)}
                    </td>
                    <td className="p-4">
                      <Pill bg="rgba(196,148,40,0.1)" fg="#C49428">
                        {log.duration} min
                      </Pill>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-success animate-pulse' : 'bg-text-dim'}`} />
                        <span className={`text-[10px] font-bold uppercase ${isActive ? 'text-success' : 'text-text-dim'}`}>
                          {isActive ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!loading && filteredLogs.length === 0 && (
          <div className="p-12 text-center text-text-dim italic">No login logs found.</div>
        )}
      </Card>
    </div>
  );
};
