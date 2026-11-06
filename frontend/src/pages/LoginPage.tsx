import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/shared/GlassCard';
import { Input } from '../components/shared/Input';
import { Button } from '../components/shared/Button';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { getErrorMessage } from '../utils/error';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const redirectTo = (location.state as { from?: { pathname?: string; search?: string } } | null)?.from;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    
    setIsLoading(true);
    try {
      await login({ emailAddress: email, password });
      showToast('Welcome back!', 'success');
      navigate(`${redirectTo?.pathname || '/dashboard'}${redirectTo?.search || ''}`, { replace: true });
    } catch (err) {
      showToast(getErrorMessage(err, 'Invalid credentials'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-frame p-2 md:p-4 flex flex-col font-body-md">
      <div className="flex-1 bg-background text-on-surface rounded-4xl overflow-hidden relative flex flex-col justify-center items-center shadow-2xl">
      <div className="fixed inset-0 dot-grid opacity-30 pointer-events-none" />
      
      <main className="relative z-10 w-full max-w-120 px-6">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-3">
            <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary font-bold text-lg">V</span>
            <span className="font-display-lg text-[28px] text-on-surface tracking-tight">SyncStream</span>
          </Link>
          <p className="font-label-mono text-[11px] text-on-surface-variant uppercase tracking-widest">Real-time Cinematic Synchronization</p>
        </div>

        <GlassCard className="p-8 md:p-10">
          <div className="mb-8">
            <h2 className="font-headline-sm text-xl text-on-surface mb-1 font-semibold">Welcome back</h2>
            <p className="font-body-md text-on-surface-variant text-sm">Enter your credentials to access your room</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <Input 
              label="EMAIL ADDRESS"
              icon="alternate_email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            
            <Input 
              label="PASSWORD"
              icon="lock"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button type="submit" fullWidth disabled={isLoading} icon={<span className="material-symbols-outlined">arrow_forward</span>}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
          
          <div className="mt-8 text-center">
             <p className="font-body-md text-on-surface-variant text-sm">
                 Don't have an account? 
                 <Link to="/register" state={location.state} className="text-primary font-bold hover:underline transition-colors ml-1">Sign up</Link>
             </p>
          </div>
        </GlassCard>
      </main>
      </div>
    </div>
  );
};
