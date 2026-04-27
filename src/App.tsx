import React, { useState, useEffect } from 'react';
import { Role, User } from './types';
import { ROLE_CONFIG } from './constants';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { CaseRepository } from './components/CaseRepository';
import { CaseGraph } from './components/CaseGraph';
import { HearingCalendar } from './components/HearingCalendar';
import { LawyerVsDefence } from './components/LawyerVsDefence';
import { AISummarizer } from './components/AISummarizer';
import { AIChatbox } from './components/AIChatbox';
import { LegalTemplates } from './components/LegalTemplates';
import { Translator } from './components/Translator';
import { CourtView } from './components/CourtView';
import { LoginDetails } from './components/LoginDetails';
import { Auth } from './components/Auth';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('Dashboard');
  const [selectedCourt, setSelectedCourt] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as User);
          } else {
            console.warn('User document not found for UID:', firebaseUser.uid);
            setUser(null);
          }
        } catch (err) {
          console.error('Error fetching user document:', err);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const sessionId = `${user.uid}_${new Date().getTime()}`;
    const loginTime = new Date().toISOString();

    const createLog = async () => {
      try {
        await setDoc(doc(db, 'login_logs', sessionId), {
          id: sessionId,
          uid: user.uid,
          email: user.email,
          role: user.role,
          loginTime: loginTime,
          lastActive: loginTime,
          duration: 0
        });
      } catch (err) {
        console.error('Error creating login log:', err);
      }
    };

    createLog();

    const interval = setInterval(async () => {
      try {
        const now = new Date();
        const lastActive = now.toISOString();
        const duration = Math.floor((now.getTime() - new Date(loginTime).getTime()) / 60000);
        
        await setDoc(doc(db, 'login_logs', sessionId), {
          lastActive,
          duration
        }, { merge: true });
      } catch (err) {
        // Silent fail for updates to avoid console clutter
      }
    }, 60000); // update every minute

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setView('Dashboard');
    setSelectedCourt(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-bg text-text flex items-center justify-center p-6 relative overflow-hidden">
        {/* Theme Toggle */}
        <div className="absolute top-6 right-6 z-50">
          <button 
            onClick={toggleTheme}
            className="p-3 rounded-full bg-bg2 border border-border text-gold hover:bg-gold hover:text-bg transition-all"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* Aesthetic Background Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-info/5 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03]" 
               style={{ backgroundImage: 'radial-gradient(#C49428 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        <Auth onLogin={setUser} theme={theme} />
      </div>
    );
  }

  const renderView = () => {
    switch (view) {
      case 'Dashboard': 
        if (user.role === 'Court') {
          return <CourtView onSelectCourt={(c) => {
            setSelectedCourt(c);
            setView('Case Repository');
          }} />;
        }
        return <Dashboard role={user.role} />;
      case 'Login Details': return <LoginDetails />;
      case 'Case Repository': return <CaseRepository initialCourt={selectedCourt || undefined} currentUser={user} />;
      case 'Case Graph': return <CaseGraph />;
      case 'Calendar': return <HearingCalendar />;
      case 'Lawyer vs Defence': return <LawyerVsDefence />;
      case 'AI Summarizer': return <AISummarizer />;
      case 'AI Chatbox': return <AIChatbox role={user.role} />;
      case 'Legal Templates': return <LegalTemplates />;
      case 'Translator': return <Translator />;
      default: return <Dashboard role={user.role} />;
    }
  };

  return (
    <Layout 
      role={user.role} 
      onLogout={handleLogout} 
      currentView={view} 
      onViewChange={setView}
      theme={theme}
      onToggleTheme={toggleTheme}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}
