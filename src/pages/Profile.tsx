import React, { useEffect, useState } from 'react';
import { IKContext, IKUpload } from 'imagekitio-react';
import { supabase } from '../core/supabase';
import type { User } from '@supabase/supabase-js';
import { Camera, Envelope, UserCircle, CircleNotch, ArrowLeft } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Note: Ensure VITE_IMAGEKIT_URL_ENDPOINT and VITE_IMAGEKIT_PUBLIC_KEY are available or fallback to known good values
const urlEndpoint = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/mntcbqrcm';
const publicKey = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY || 'public_B6kGBU9zDSzamz9FfU4JPuS+yYI=';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5006';

const authenticator = async () => {
  try {
    const response = await fetch(`${API_URL}/api/imagekit/auth`);
    if (!response.ok) {
      throw new Error(`Authentication error: ${response.statusText}`);
    }
    const data = await response.json();
    return { signature: data.signature, expire: data.expire, token: data.token };
  } catch (error: any) {
    throw new Error(`Authentication request failed: ${error.message}`);
  }
};

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const handleUploadStart = () => {
    setUploading(true);
  };

  const handleUploadSuccess = async (res: any) => {
    setUploading(false);
    const newAvatarUrl = res.url;
    
    // Update Supabase Auth metadata
    const { data, error } = await supabase.auth.updateUser({
      data: { avatar_url: newAvatarUrl }
    });
    
    if (error) {
      alert('Error updating profile picture: ' + error.message);
    } else {
      setUser(data.user);
    }
  };

  const handleUploadError = (err: any) => {
    setUploading(false);
    alert('Upload failed: ' + err.message);
  };

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas">
        <CircleNotch weight="bold" className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  const avatarUrl = user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.email || 'User')}&backgroundColor=e2e8f0,cbd5e1,94a3b8`;
  const fullName = user.user_metadata?.full_name || 'User';

  return (
    <div className="min-h-screen bg-canvas py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[800px] mx-auto">
        
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link to="/dashboard" className="inline-flex items-center text-charcoal hover:text-ink-deep mb-8 font-semibold transition-colors bg-surface-soft px-4 py-2 rounded-full border border-hairline-soft hover:shadow-sm">
            <ArrowLeft weight="bold" size={16} className="mr-2" /> Back to Dashboard
          </Link>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
          className="bg-white rounded-[2.5rem] shadow-diffusion border border-hairline-soft overflow-hidden"
        >
          {/* Abstract Header Pattern */}
          <div className="h-40 bg-gradient-to-br from-primary-soft to-surface-soft relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
             <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/40 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2"></div>
          </div>
          
          <div className="px-10 pb-10 relative">
            <div className="flex justify-between items-end mb-10">
              <div className="relative -mt-20">
                <div className="w-40 h-40 bg-white rounded-[2rem] p-2 shadow-md border border-hairline-soft">
                  <img 
                    src={avatarUrl} 
                    alt="Profile" 
                    className="w-full h-full rounded-[1.5rem] object-cover"
                  />
                </div>
                
                <div className="absolute -bottom-2 -right-2">
                  <IKContext 
                    publicKey={publicKey} 
                    urlEndpoint={urlEndpoint} 
                    authenticator={authenticator}
                  >
                    <label className="flex items-center justify-center w-12 h-12 bg-ink-deep text-white rounded-2xl cursor-pointer hover:bg-charcoal transition-all shadow-md border-[3px] border-white hover:scale-105 active:scale-95">
                      {uploading ? <CircleNotch weight="bold" size={20} className="animate-spin" /> : <Camera weight="fill" size={20} />}
                      <IKUpload
                        fileName="profile_picture.png"
                        tags={["profile_picture"]}
                        useUniqueFileName={true}
                        folder="/profiles"
                        style={{ display: 'none' }}
                        onUploadStart={handleUploadStart}
                        onError={handleUploadError}
                        onSuccess={handleUploadSuccess}
                        accept="image/*"
                      />
                    </label>
                  </IKContext>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h1 className="text-[40px] font-bold text-ink-deep tracking-tight mb-2 leading-none">{fullName}</h1>
                <p className="text-charcoal flex items-center font-medium">
                  <Envelope weight="duotone" size={18} className="mr-2 text-primary" /> {user.email}
                </p>
              </div>
              
              <div className="bg-surface-soft p-8 rounded-[2rem] border border-hairline-soft">
                <h3 className="font-semibold text-ink-deep mb-6 flex items-center text-[18px]">
                  <UserCircle weight="duotone" size={24} className="mr-3 text-primary" /> Profile Details
                </h3>
                <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 text-[15px]">
                  <div>
                    <dt className="text-slate font-semibold mb-1 uppercase tracking-wider text-[12px]">Account Provider</dt>
                    <dd className="text-ink-deep font-medium capitalize">{user.app_metadata.provider}</dd>
                  </div>
                  <div>
                    <dt className="text-slate font-semibold mb-1 uppercase tracking-wider text-[12px]">Joined On</dt>
                    <dd className="text-ink-deep font-medium">{new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</dd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
