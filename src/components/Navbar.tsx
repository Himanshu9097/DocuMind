import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../core/supabase';
import type { User } from '@supabase/supabase-js';
import { Robot, UserCircle, Sun, Moon, Brain } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="w-full h-16 md:h-20 bg-canvas/80 backdrop-blur-xl border-b border-hairline-soft sticky top-0 z-50 transition-colors">
      <div className="max-w-[1600px] mx-auto h-full px-4 md:px-6 flex items-center justify-between">
        
        <Link to="/" className="flex items-center gap-2 md:gap-3 group shrink-0">
          <div className="w-9 h-9 md:w-10 md:h-10 bg-primary-soft rounded-[12px] md:rounded-[14px] flex items-center justify-center group-hover:scale-105 transition-transform border border-primary/10">
            <Brain weight="duotone" className="text-primary" size={24} />
          </div>
          <span className="text-[18px] md:text-[20px] font-bold text-ink-deep tracking-tight hidden sm:block">DocuMind</span>
        </Link>
        
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <button 
            onClick={toggleTheme}
            className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-surface-soft text-charcoal hover:text-ink-deep hover:bg-hairline-soft transition-all"
          >
            {isDark ? <Sun weight="bold" size={18} /> : <Moon weight="bold" size={18} />}
          </button>
          {user ? (
            <>
              {location.pathname !== '/dashboard' && (
                <Link to="/dashboard" className="hidden md:inline-block text-[14px] font-bold text-ink-deep hover:text-primary transition-colors px-4 py-2">
                  Dashboard
                </Link>
              )}
              <Link to="/profile" className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full bg-surface-soft hover:bg-hairline-soft transition-colors text-charcoal">
                <UserCircle weight="duotone" size={22} />
              </Link>
              <button 
                onClick={handleLogout}
                className="text-[13px] md:text-[14px] font-bold bg-surface-soft text-ink-deep border border-hairline-soft px-3 py-1.5 md:px-4 md:py-2 rounded-full hover:bg-hairline hover:border-slate transition-all ml-1"
              >
                Log out
              </button>
            </>
          ) : (
            <Link 
              to="/login"
              className="text-[13px] md:text-[14px] font-bold bg-ink-deep text-canvas px-5 py-2 md:px-6 md:py-2.5 rounded-full hover:bg-charcoal hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Log in
            </Link>
          )}
        </div>
        
      </div>
    </nav>
  );
}
