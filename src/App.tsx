import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import RagPage from './rag/pages/RagPage';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import { supabase } from './core/supabase';
import { Toaster } from 'react-hot-toast';

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-canvas overflow-x-hidden">
      <Toaster position="top-center" reverseOrder={false} />
      <Navbar />
      <div className="flex-grow flex flex-col">
        {children}
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-canvas">Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout><Landing /></AppLayout>} />
        <Route path="/login" element={<Auth />} />
        <Route path="/signup" element={<Auth />} />
        
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <AppLayout>
                <Profile />
              </AppLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <AppLayout>
                <RagPage />
              </AppLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route path="*" element={<AppLayout><Landing /></AppLayout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
