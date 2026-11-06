import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/shared/GlassCard';
import { Input } from '../components/shared/Input';
import { Button } from '../components/shared/Button';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { getErrorMessage } from '../utils/error';

interface FieldErrors {
  username?: string;
  email?: string;
  password?: string;
}

// Matches the rules the server enforces at signup.
const validateAccountFields = (username: string, email: string, password: string): FieldErrors => {
  const errors: FieldErrors = {};
  if (username.length < 3 || username.length > 30) {
    errors.username = 'Username must be 3 to 30 characters.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }
  return errors;
};

export const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const { register, sendOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  // Handle countdown timer for Resend OTP
  React.useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Shows problems under each field. Returns true when everything is valid.
  const validateFields = () => {
    const nextErrors = validateAccountFields(username, email, password);
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChangeEmail = () => {
    setOtpSent(false);
    setOtp('');
    setCountdown(0);
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateFields()) return;

    setIsSendingOtp(true);
    try {
      await sendOtp(email);
      setOtpSent(true);
      setCountdown(60);
      showToast('Verification code sent to your email!', 'success');
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to send verification code'), 'error');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFields()) return;
    if (!otpSent) {
      handleSendOtp();
      return;
    }
    if (!otp || otp.length !== 6) {
      showToast('Please enter the 6-digit verification code', 'error');
      return;
    }
    
    setIsLoading(true);
    try {
      await register({ username, emailAddress: email, password, otp });
      showToast('Account created & verified! Please sign in.', 'success');
      navigate('/login', { replace: true, state: location.state });
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to create account'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-frame p-2 md:p-4 flex flex-col font-body-md">
      <div className="flex-1 bg-background text-on-surface rounded-4xl overflow-hidden relative flex flex-col justify-center items-center shadow-2xl">
      <div className="fixed inset-0 dot-grid opacity-30 pointer-events-none" />
      
      <main className="relative z-10 w-full max-w-120 px-6">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-3">
            <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary font-bold text-lg">S</span>
            <span className="font-display-lg text-[28px] text-on-surface tracking-tight">SyncStream</span>
          </Link>
          <p className="font-label-mono text-[11px] text-on-surface-variant uppercase tracking-widest">Join the Platform</p>
        </div>

        <GlassCard className="p-8 md:p-10">
          <div className="mb-8">
            <h2 className="font-headline-sm text-xl text-on-surface mb-1 font-semibold">Create Account</h2>
            <p className="font-body-md text-on-surface-variant text-sm">
              {otpSent ? 'Enter the verification code sent to your email' : 'Sign up to host your own watch parties'}
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <Input 
              label="USERNAME"
              icon="person"
              type="text"
              placeholder="johndoe"
              value={username}
              error={fieldErrors.username}
              onChange={(e) => {
                setUsername(e.target.value);
                setFieldErrors((prev) => ({ ...prev, username: undefined }));
              }}
            />
            
            <Input 
              label="EMAIL ADDRESS"
              icon="alternate_email"
              type="email"
              placeholder="name@example.com"
              value={email}
              disabled={otpSent}
              error={fieldErrors.email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }}
            />
            {otpSent && (
              <button
                type="button"
                onClick={handleChangeEmail}
                className="font-label-mono text-xs text-primary font-bold hover:underline"
              >
                Change email
              </button>
            )}

            <Input 
              label="PASSWORD"
              icon="lock"
              type="password"
              placeholder="••••••••"
              value={password}
              error={fieldErrors.password}
              onChange={(e) => {
                setPassword(e.target.value);
                setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }}
            />
            {!fieldErrors.password && (
              <p className="font-label-mono text-xs text-on-surface-variant">At least 8 characters</p>
            )}

            {otpSent && (
              <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-top-2">
                <Input 
                  label="VERIFICATION CODE (OTP)"
                  icon="key"
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.trim())}
                />
                <div className="flex justify-between items-center px-1">
                  <span className="font-label-mono text-xs text-on-surface-variant">Didn't receive code?</span>
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    disabled={countdown > 0 || isSendingOtp}
                    className="font-label-mono text-xs text-primary font-bold hover:underline disabled:opacity-50"
                  >
                    {countdown > 0 ? `Resend in ${countdown}s` : isSendingOtp ? 'Sending...' : 'Resend Code'}
                  </button>
                </div>
              </div>
            )}

            {!otpSent ? (
              <Button type="button" onClick={() => handleSendOtp()} fullWidth disabled={isSendingOtp} className="mt-4">
                {isSendingOtp ? 'Sending verification code...' : 'Send Verification Code'}
              </Button>
            ) : (
              <Button type="submit" fullWidth disabled={isLoading || otp.length !== 6} className="mt-4">
                {isLoading ? 'Creating account...' : 'Complete Sign up'}
              </Button>
            )}
          </form>
          
          <div className="mt-8 text-center">
             <p className="font-body-md text-on-surface-variant text-sm">
                 Already have an account? 
                 <Link to="/login" state={location.state} className="text-primary font-bold hover:underline transition-colors ml-1">Sign in</Link>
             </p>
          </div>
        </GlassCard>
      </main>
      </div>
    </div>
  );
};
