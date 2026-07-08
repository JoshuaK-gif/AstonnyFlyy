import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import logo from "@/assets/logo.png";

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [lockedUntil, setLockedUntil] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, redirect to dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  // Handle countdown timer
  React.useEffect(() => {
    if (!lockedUntil) return;

    const updateTimer = () => {
      const remainingMs = lockedUntil - Date.now();
      if (remainingMs <= 0) {
        setLockedUntil(null);
        setCountdown(0);
      } else {
        setCountdown(Math.ceil(remainingMs / 1000));
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || lockedUntil) return;

    try {
      setLoading(true);
      await login(password);
      toast.success('Access Granted', {
        description: 'Welcome to the AstonnyFlyy control panel.'
      });
      navigate('/admin');
    } catch (error) {
      if (error.status === 429) {
        // Handle rate limit/lockout
        if (error.lockedUntil) {
          setLockedUntil(error.lockedUntil);
          toast.error('System Locked', {
            description: error.message || 'Too many failed attempts. System locked.'
          });
        } else {
          toast.error('Too Many Attempts', {
            description: error.message || 'Please wait before trying again.'
          });
        }
      } else {
        // Handle normal failure
        const remaining = error.attemptsRemaining;
        const remainingText = remaining !== undefined ? ` (${remaining} attempts remaining)` : '';
        toast.error('Access Denied', {
          description: `Invalid administrative password.${remainingText}`
        });
      }
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isLocked = !!lockedUntil;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 font-body selection:bg-accent selection:text-primary">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-accent/10 blur-[120px]" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      </div>

      <div className="relative w-full max-w-md">
        <Link to="/" className="absolute -top-16 left-0 flex items-center gap-2 text-slate-500 hover:text-white transition-colors group">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-xs font-black uppercase tracking-widest">Back to Store</span>
        </Link>

        <div className="rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-8 md:p-12 shadow-2xl">
          <div className="mb-10 text-center">
            <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full shadow-lg transition-colors ${isLocked ? 'bg-red-500/20 shadow-red-500/20' : 'bg-white/10 shadow-white/10'}`}>
              <img src={logo} alt="AstonnyFlyy Logo" className="h-14 w-14 rounded-full object-cover" />
            </div>
            <h1 className="font-display text-4xl font-black uppercase tracking-tighter text-white">
              CONTROL<br /><span className={isLocked ? 'text-red-500' : 'text-accent'}>CENTRE</span>
            </h1>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.3em] text-slate-500">
              Restricted Administrative Access
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                {isLocked ? 'SYSTEM LOCKED' : 'Enter Master Password'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isLocked ? "ACCESS DENIED" : "••••••••••••"}
                disabled={isLocked || loading}
                className={`w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-center font-black tracking-[0.5em] text-white placeholder:text-slate-700 focus:border-accent focus:bg-white/10 focus:outline-none transition-all ${isLocked ? 'opacity-50 cursor-not-allowed border-red-500/30' : ''}`}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || !password || isLocked}
              className={`group relative w-full overflow-hidden rounded-2xl py-4 font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isLocked ? 'bg-red-500/20 text-red-500 hover:bg-red-500/20' : 'bg-white text-black hover:bg-accent disabled:hover:bg-white'}`}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLocked ? `LOCKED: ${formatTime(countdown)}` : loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'FLYY IN'}
              </span>
            </button>
          </form>

          <div className="mt-10 text-center flex flex-col items-center gap-4">
            <img src={logo} alt="AstonnyFlyy Logo" className="h-10 w-10 rounded-full object-cover opacity-50" />
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
              Authorized Personnel Only
            </p>
            <div className="flex justify-center gap-1">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-1 w-4 rounded-full bg-white/5" />
              ))}
            </div>
          </div>
        </div>
        
        <p className="mt-8 text-center text-[10px] font-bold text-slate-700 uppercase tracking-widest">
          AstonnyFlyy &copy; 2026 &bull; Security Protocol v2.4
        </p>
      </div>
    </div>
  );
}
