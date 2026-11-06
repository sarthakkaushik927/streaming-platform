import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import { AuthLayout } from '../components/shared/AuthLayout';
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
    <AuthLayout
      title="Welcome back"
      description="Sign in to create rooms and join watch parties"
      footer={
        <>
          Don't have an account?{' '}
          <Link to="/register" state={location.state} className="font-medium text-accent hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleLogin} className="space-y-4">
        <Input label="Email address" icon={<Mail />} type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Password" icon={<Lock />} type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button type="submit" fullWidth disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
    </AuthLayout>
  );
};
