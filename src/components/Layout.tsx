import React, { useState } from 'react';
import { Role, Notification } from '../types';
import { ROLE_CONFIG, NOTIFICATIONS } from '../constants';
import { RoleIcon } from './Icons';
import { Pill, Btn } from './UI';
import { Bell, LogOut, Menu, X, ChevronRight, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
  role: Role;
  onLogout: () => void;
  currentView: string;
  onViewChange: (view: string) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, role, onLogout, currentView, onViewChange, theme, onToggleTheme }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(NOTIFICATIONS[role]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = {
    Client: ['Dashboard', 'Calendar', 'AI Summarizer', 'AI Chatbox'],
    Judge: ['Dashboard', 'Case Repository', 'Lawyer vs Defence', 'Case Graph', 'AI Summarizer', 'AI Chatbox', 'Calendar'],
    Lawyer: ['Dashboard', 'Case Repository', 'Case Graph', 'AI Summarizer', 'AI Chatbox', 'Legal Templates', 'Translator', 'Calendar'],
    Court: ['Dashboard', 'Case Repository', 'Case Graph', 'AI Summarizer', 'AI Chatbox', 'Legal Templates', 'Translator', 'Calendar'],
    Builder: ['Dashboard', 'Login Details', 'Case Repository', 'Case Graph', 'AI Summarizer', 'AI Chatbox', 'Legal Templates', 'Translator', 'Calendar']
  };

  const currentNavItems = navItems[role] || navItems.Lawyer;

  const toggleRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col">
      {/* Navbar */}
      <nav className="h-[58px] border-b border-border bg-bg/80 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-bg2 rounded-lg lg:hidden">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center text-bg font-bold text-lg">
              ⚖️
            </div>
            <span className="font-serif text-xl font-bold tracking-tight text-gold">NyayaSetu</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={onToggleTheme}
            className="p-2 hover:bg-bg2 rounded-full text-text-muted hover:text-gold transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <Pill bg="rgba(196,148,40,0.12)" fg="#C49428">
            {role.toUpperCase()}
          </Pill>
          
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-bg2 rounded-full relative transition-colors"
            >
              <Bell size={20} className="text-text-muted hover:text-gold" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-danger text-[10px] flex items-center justify-center rounded-full text-white font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-12 right-0 w-[360px] bg-card border border-border rounded-xl shadow-2xl z-[500] overflow-hidden"
                >
                  <div className="p-4 border-b border-border flex justify-between items-center bg-bg2">
                    <h3 className="font-bold">Notifications</h3>
                    <button onClick={() => setShowNotifications(false)}><X size={16} /></button>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length > 0 ? notifications.map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => toggleRead(n.id)}
                        className={`p-4 border-b border-border last:border-0 cursor-pointer hover:bg-bg2 transition-colors flex gap-3 ${!n.read ? 'bg-gold/5' : ''}`}
                      >
                        <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${n.read ? 'bg-text-dim' : `bg-${n.type}`}`} />
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-sm">{n.title}</span>
                            <span className="text-[10px] text-text-dim">{n.time}</span>
                          </div>
                          <p className="text-xs text-text-muted leading-relaxed">{n.msg}</p>
                        </div>
                      </div>
                    )) : (
                      <div className="p-8 text-center text-text-dim text-sm italic">No notifications</div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={onLogout}
            className="p-2 hover:bg-danger/10 hover:text-danger rounded-full transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside 
          className={`
            ${isSidebarOpen ? 'w-[210px]' : 'w-0'} 
            border-r border-border bg-bg2 transition-all duration-300 overflow-hidden sticky top-[58px] h-[calc(100vh-58px)]
            hidden lg:block
          `}
        >
          <div className="p-4 flex flex-col gap-2">
            {currentNavItems.map(item => (
              <button
                key={item}
                onClick={() => {
                  onViewChange(item);
                  setShowNotifications(false);
                }}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group
                  ${currentView === item 
                    ? 'bg-gold/10 text-gold border-l-4 border-gold' 
                    : 'text-text-muted hover:bg-bg3 hover:text-text'}
                `}
              >
                <ChevronRight size={14} className={`${currentView === item ? 'opacity-100' : 'opacity-0'} transition-opacity`} />
                {item}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8 max-h-[calc(100vh-58px)]">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};
