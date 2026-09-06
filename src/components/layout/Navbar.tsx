import React, { useState, useEffect } from 'react';
import { useLanguage, LANGUAGES, LANGUAGE_DETAILS } from '../../lib/LanguageContext';
import { useLocation } from '../../lib/hooks/useLocation';
import { MapPin, Globe, Mic, ShieldAlert, Radio, LogIn, LogOut, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';
import { initAuth, googleSignIn, logout } from '../../lib/firebase';
import { User } from 'firebase/auth';

export function Navbar({ onReport, onPortal }: { onReport: () => void, onPortal: () => void }) {
  const { language, setLanguage, t } = useLanguage();
  const { location, fetchLocation } = useLocation();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (u) => setUser(u),
      () => setUser(null)
    );
    return () => unsubscribe();
  }, []);

  const handleAuth = async () => {
    if (user) {
      await logout();
      setUser(null);
    } else {
      try {
        const result = await googleSignIn();
        if (result) setUser(result.user);
      } catch (err) {
        console.error("Login failed", err);
      }
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0A0A0C]/90 backdrop-blur-md border-b border-white/10 shadow-lg">
      <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-2xl tracking-widest text-white leading-none">
                Infra.ai
              </h1>
              <span className="w-2.5 h-2.5 rounded-full bg-neon-green shadow-[0_0_15px_rgba(0,255,135,0.8)] animate-pulse"></span>
            </div>
            <span className="text-[10px] uppercase tracking-[0.2em] opacity-80 font-bold text-neon-green mt-1">
              {t('By Team THEKEDAAR')}
            </span>
          </div>
        </div>

        {/* Location & Language */}
        <div className="hidden md:flex items-center gap-4 lg:gap-6">
          <button 
            onClick={fetchLocation}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#121216] border border-white/10 text-xs font-medium text-slate-300 hover:border-neon-green/50 transition-colors group"
          >
            {location.loading ? (
              <Radio className="w-4 h-4 text-neon-green animate-spin" />
            ) : (
              <MapPin className="w-4 h-4 text-neon-green group-hover:animate-bounce" />
            )}
            <span>
              {location.city}, {location.state} ({location.lat.toFixed(4)}° N, {location.lng.toFixed(4)}° E)
            </span>
          </button>

          {/* Selected element: language selector */}
          <div className="relative flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#13131a] border border-cyan-400/30 text-xs font-semibold text-slate-200 shadow-[0_0_15px_rgba(0,229,255,0.1)] hover:border-cyan-400/60 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20 transition-all">
            <Globe className="w-4 h-4 text-neon-cyan shrink-0 animate-pulse" />
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              aria-label="Select Language"
              className="bg-transparent outline-none text-white appearance-none cursor-pointer pr-5 font-medium text-xs tracking-wide hover:text-neon-cyan transition-colors"
            >
              {LANGUAGE_DETAILS.map(lang => (
                <option 
                  key={lang.id} 
                  value={lang.id} 
                  className="bg-[#0e0e14] text-slate-100 py-1.5 px-2 font-sans"
                >
                  {lang.native !== lang.label ? `${lang.native} (${lang.label})` : lang.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-cyan-400/80 pointer-events-none absolute right-3" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {user ? (
            <button 
              onClick={handleAuth}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#121216] border border-white/10 hover:bg-white/5 text-white text-xs font-bold transition-colors"
            >
              <img src={user.photoURL || ''} alt="avatar" className="w-4 h-4 rounded-full" />
              <span className="hidden lg:inline">{user.displayName}</span>
            </button>
          ) : (
            <button onClick={handleAuth} className="gsi-material-button bg-white text-black rounded-lg px-3.5 py-2 flex items-center gap-2.5 text-xs font-bold hover:bg-gray-100 transition-colors shadow-sm">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4" style={{ display: 'block' }}>
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
              <span>{t('Sign in with Google')}</span>
            </button>
          )}

          <button 
            onClick={onReport}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-lg bg-alert-red hover:bg-alert-red/90 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(255,59,48,0.6)] hover:scale-105 active:scale-95 ring-2 ring-white/20 animate-pulse-subtle"
          >
            <Mic className="w-4 h-4" /> {t('Report Issue')}
          </button>
          
          <button 
            onClick={onPortal}
            className="hidden sm:flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-lg bg-[#121216] border border-neon-green/30 hover:border-neon-green/80 text-neon-green text-xs font-bold uppercase tracking-wider transition-all"
          >
            <ShieldAlert className="w-4 h-4" /> {t('Admin Portal')}
          </button>
        </div>
        
      </div>
    </nav>
  );
}
