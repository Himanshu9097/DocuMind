import React, { useState } from 'react';
import { Robot, CircleNotch, Brain } from '@phosphor-icons/react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../core/supabase';
import { motion } from 'framer-motion';

export default function Auth() {
  const location = useLocation();
  const isLogin = location.pathname === '/login';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        }
      });
      if (error) throw error;
    } catch (err: any) {
      alert(`Google Login Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = '/dashboard';
      } else {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/dashboard` } });
        if (error) throw error;
        alert('Check your email for the confirmation link!');
      }
    } catch (err: any) {
      alert(`Authentication Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-soft rounded-full blur-[100px] opacity-50 z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#f4f4f5] rounded-full blur-[100px] opacity-50 z-0"></div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="relative z-10 mb-8"
      >
        <Link to="/" className="flex items-center justify-center w-16 h-16 bg-primary-soft rounded-2xl shadow-sm border border-primary/10">
          <Brain weight="duotone" className="text-primary" size={32} />
        </Link>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
        className="w-full max-w-[440px] bg-canvas/80 backdrop-blur-xl rounded-[2.5rem] border border-hairline-soft p-10 shadow-diffusion relative z-10"
      >
        <div className="flex flex-col items-center mb-8 text-center">
          <h2 className="text-[32px] font-bold text-ink-deep tracking-tight mb-2">
            {isLogin ? 'Welcome back' : 'Get started'}
          </h2>
          <p className="text-charcoal text-[16px] font-medium">
            {isLogin 
              ? 'Log in to continue chatting.' 
              : 'Sign up to chat with your documents.'}
          </p>
        </div>
        
        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full mb-6 bg-white border border-hairline hover:border-slate text-ink-deep font-bold py-4 px-4 rounded-full flex items-center justify-center gap-3 transition-all hover:shadow-sm hover:scale-[1.02] active:scale-[0.98] text-[15px]"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>

        <div className="relative flex items-center py-5 mb-4">
          <div className="flex-grow border-t border-hairline-soft"></div>
          <span className="flex-shrink-0 mx-4 text-slate text-[13px] font-semibold uppercase tracking-wider">Or email</span>
          <div className="flex-grow border-t border-hairline-soft"></div>
        </div>

        <form className="space-y-5" onSubmit={handleEmailAuth}>
          <div>
            <label className="block text-[14px] font-semibold text-ink-deep mb-2">Email address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-soft border border-hairline-soft rounded-2xl px-5 py-4 text-[16px] text-ink-deep font-medium placeholder-slate focus:outline-none focus:border-primary focus:bg-canvas focus:ring-4 focus:ring-primary/10 transition-all" 
              placeholder="you@example.com" 
            />
          </div>
          <div>
            <label className="block text-[14px] font-semibold text-ink-deep mb-2">Password</label>
            <input 
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-soft border border-hairline-soft rounded-2xl px-5 py-4 text-[16px] text-ink-deep font-medium placeholder-slate focus:outline-none focus:border-primary focus:bg-canvas focus:ring-4 focus:ring-primary/10 transition-all" 
              placeholder="••••••••" 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-ink-deep hover:bg-charcoal text-canvas font-semibold py-4 px-4 rounded-full transition-all mt-4 hover:scale-[1.02] active:scale-[0.98] shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? <CircleNotch weight="bold" className="animate-spin" size={20} /> : (isLogin ? 'Log in' : 'Create account')}
          </button>
        </form>

        <div className="mt-8 text-center text-[14px] font-medium text-charcoal">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <Link to={isLogin ? '/signup' : '/login'} className="text-primary hover:text-primary-deep font-bold hover:underline transition-all">
            {isLogin ? 'Sign up' : 'Log in'}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
