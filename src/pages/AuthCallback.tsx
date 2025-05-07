import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const AuthCallback = () => {
  const [message, setMessage] = useState('Processing authentication...');
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash from the URL
        const hash = window.location.hash;
        
        // Check if we have a hash (for OAuth providers)
        if (hash) {
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            throw error;
          }
          
          if (data?.session) {
            setMessage('Authentication successful! Redirecting...');
            setTimeout(() => navigate('/dashboard'), 2000);
          } else {
            throw new Error('No session found');
          }
        } else {
          // For email confirmations
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            throw error;
          }
          
          if (data?.session) {
            setMessage('Email confirmed! Redirecting...');
            setTimeout(() => navigate('/dashboard'), 2000);
          } else {
            // If no session, redirect to sign in
            setMessage('Please sign in to continue');
            setTimeout(() => navigate('/sign-in'), 2000);
          }
        }
      } catch (error) {
        console.error('Error during auth callback:', error);
        setMessage('Authentication failed. Please try again.');
        setTimeout(() => navigate('/sign-in'), 3000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-dreamland-background flex flex-col justify-center items-center p-4">
      <div className="text-center animate-fade-in">
        <h1 className="text-3xl font-bold text-dreamland-accent mb-4">DreamLand Group</h1>
        <div className="bg-dreamland-surface p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dreamland-primary mx-auto"></div>
          </div>
          <p className="text-lg">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
