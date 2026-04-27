import React, { useState } from 'react';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Role, User } from '../types';
import { Card, Btn, GoldLine } from './UI';
import { RoleIcon } from './Icons';
import { ROLE_CONFIG } from '../constants';
import { motion } from 'motion/react';
import { Mail, Lock, User as UserIcon, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
  theme: 'dark' | 'light';
}

export const Auth: React.FC<AuthProps> = ({ onLogin, theme }) => {
  const [mode, setMode] = useState<'select' | 'login' | 'signup' | 'forgot'>('select');
  const [role, setRole] = useState<Role | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('Password reset email sent! Please check your inbox.');
      setTimeout(() => setMode('login'), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === 'signup' && role) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser: User = {
          uid: userCredential.user.uid,
          email,
          role,
          name,
        };
        try {
          await setDoc(doc(db, 'users', newUser.uid), newUser);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${newUser.uid}`);
        }
        onLogin(newUser);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        let userDoc;
        try {
          userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${userCredential.user.uid}`);
        }
        
        if (userDoc?.exists()) {
          onLogin(userDoc.data() as User);
        } else {
          setError('User profile not found in database. If you just signed up, please try again or contact support.');
        }
      }
    } catch (err: any) {
      console.error('Auth Error:', err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password login is not enabled in Firebase. Please enable it in the Firebase Console under Authentication > Sign-in method.');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        if (isClient) {
          setError('Invalid credentials. Clients must use the account created by their lawyer. If you are testing, please log in as a Lawyer first and use the "Create Client ID" tool to set up this account.');
        } else {
          setError('Invalid email or password. If you haven\'t created an account yet, please click "Sign Up" below.');
        }
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please click "Sign In" below instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(err.message || 'An unexpected error occurred during authentication.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isClient = role === 'Client';

  if (mode === 'select') {
    return (
      <div className="flex flex-col gap-12 w-full max-w-6xl">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center text-bg text-4xl shadow-[0_0_30px_rgba(196,148,40,0.3)]">
            ⚖️
          </div>
          <h1 className="text-6xl font-serif font-bold tracking-tight text-gold">NyayaSetu</h1>
          <p className="text-xl text-text-muted max-w-md">AI-Powered Indian Legal Platform. Select your role to enter the workspace.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {(Object.keys(ROLE_CONFIG) as Role[]).map((r) => (
            <div key={r} className="group hover:border-gold/50 cursor-pointer transition-all hover:-translate-y-1">
              <Card 
                className="flex flex-col items-center text-center gap-4 p-6 bg-bg2/50 backdrop-blur-sm h-full"
              >
                <div 
                  onClick={() => {
                    setRole(r);
                    setMode('login');
                  }}
                  className="w-full h-full flex flex-col items-center gap-4"
                >
                  <div className="w-14 h-14 rounded-full bg-bg3 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-bg transition-all duration-300">
                    <RoleIcon role={r} className="w-7 h-7" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-bold text-lg">{r}</h3>
                    <p className="text-[10px] text-text-dim uppercase font-bold tracking-widest leading-tight">
                      {ROLE_CONFIG[r].subLabel}
                    </p>
                  </div>
                  <GoldLine />
                  <p className="text-[10px] text-text-muted italic leading-relaxed">
                    {ROLE_CONFIG[r].access}
                  </p>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md"
    >
      <Card className="p-8 flex flex-col gap-6 bg-bg2/80 backdrop-blur-md border-gold/20">
        <button 
          onClick={() => {
            setMode('select');
            setRole(null);
            setError(null);
          }}
          className="flex items-center gap-2 text-xs text-text-dim hover:text-gold transition-colors w-fit"
        >
          <ArrowLeft size={14} /> Back to Roles
        </button>

        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-12 h-12 rounded-full bg-bg3 flex items-center justify-center text-gold">
            <RoleIcon role={role!} className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-serif font-bold">{role} Portal</h2>
          <p className="text-xs text-text-muted">
            {mode === 'login' ? (isClient ? 'Access your case file' : 'Sign in to your workspace') : 
             mode === 'signup' ? 'Create your professional profile' : 
             'Reset your password'}
          </p>
        </div>

        {isClient && mode === 'login' && (
          <div className="p-4 bg-gold/5 border border-gold/20 rounded-xl flex flex-col gap-2">
            <div className="flex items-center gap-2 text-gold">
              <AlertCircle size={14} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Client Access Protocol</span>
            </div>
            <p className="text-[10px] text-text-muted leading-relaxed">
              Clients must use the secure credentials provided by their legal counsel. 
              If you haven't received yours, please contact your lawyer.
            </p>
            <div className="pt-2 border-t border-gold/10 flex justify-between items-center">
              <span className="text-[9px] text-text-dim italic">Demo Account:</span>
              <button 
                onClick={() => {
                  setEmail('client@demo.com');
                  setPassword('Client123!');
                }}
                className="text-[9px] font-bold text-gold hover:underline"
              >
                Use client@demo.com
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg flex items-center gap-3 text-xs text-danger">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-success/10 border border-success/20 rounded-lg flex items-center gap-3 text-xs text-success">
            <CheckCircle size={16} />
            {success}
          </div>
        )}

        {mode === 'forgot' ? (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-text-dim ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={16} />
                <input 
                  required
                  type="email" 
                  placeholder="email@example.com"
                  className="w-full bg-bg border border-border rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-gold transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <Btn type="submit" disabled={loading} className="mt-2 w-full">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Btn>
            <button 
              type="button"
              onClick={() => setMode('login')}
              className="text-xs text-text-dim hover:text-gold transition-colors text-center"
            >
              Back to Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleAuth} className="flex flex-col gap-4">
            {mode === 'signup' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-text-dim ml-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={16} />
                  <input 
                    required
                    type="text" 
                    placeholder="Adv. John Doe"
                    className="w-full bg-bg border border-border rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-gold transition-all"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-text-dim ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={16} />
                <input 
                  required
                  type="email" 
                  placeholder="email@example.com"
                  className="w-full bg-bg border border-border rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-gold transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] uppercase font-bold text-text-dim">Password</label>
                {mode === 'login' && (
                  <button 
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[10px] font-bold text-gold hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={16} />
                <input 
                  required
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-bg border border-border rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-gold transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <Btn type="submit" disabled={loading} className="mt-2 w-full">
              {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </Btn>
          </form>
        )}

        <div className="text-center">
          {mode !== 'forgot' && !isClient && (
            <button 
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-xs text-text-dim hover:text-gold transition-colors"
            >
              {mode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          )}
          {isClient && mode === 'signup' && (
            <button 
              onClick={() => setMode('login')}
              className="text-xs text-text-dim hover:text-gold transition-colors"
            >
              Back to Client Login
            </button>
          )}
        </div>

        {role === 'Client' && mode === 'login' && (
          <p className="text-[10px] text-text-dim text-center italic">
            Clients typically use the credentials provided by their legal counsel.
          </p>
        )}
      </Card>
    </motion.div>
  );
};
