import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { KeyRound, Lock, Mail, User } from 'lucide-react';
import { AuthLayout } from '../components/shared/AuthLayout';
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
    <AuthLayout
      title="Create your account"
      description={otpSent ? 'Enter the verification code sent to your email' : 'Sign up to host your own watch parties'}
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" state={location.state} className="font-medium text-accent hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleRegister} className="space-y-4">
        <Input
          label="Username"
          icon={<User />}
          type="text"
          placeholder="johndoe"
          value={username}
          error={fieldErrors.username}
          onChange={(e) => {
            setUsername(e.target.value);
            setFieldErrors((prev) => ({ ...prev, username: undefined }));
          }}
        />

        <div className="space-y-1.5">
          <Input
            label="Email address"
            icon={<Mail />}
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
            <button type="button" onClick={handleChangeEmail} className="text-sm font-medium text-accent hover:underline">
              Change email
            </button>
          )}
        </div>

        <Input
          label="Password"
          icon={<Lock />}
          type="password"
          placeholder="••••••••"
          value={password}
          error={fieldErrors.password}
          hint="At least 8 characters"
          onChange={(e) => {
            setPassword(e.target.value);
            setFieldErrors((prev) => ({ ...prev, password: undefined }));
          }}
        />

        {otpSent && (
          <div className="space-y-1.5">
            <Input
              label="Verification code (OTP)"
              icon={<KeyRound />}
              type="text"
              inputMode="numeric"
              placeholder="123456"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.trim())}
            />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Didn't receive a code?</span>
              <button
                type="button"
                onClick={() => handleSendOtp()}
                disabled={countdown > 0 || isSendingOtp}
                className="font-medium text-accent hover:underline disabled:opacity-50"
              >
                {countdown > 0 ? `Resend in ${countdown}s` : isSendingOtp ? 'Sending...' : 'Resend Code'}
              </button>
            </div>
          </div>
        )}

        {!otpSent ? (
          <Button onClick={() => handleSendOtp()} fullWidth disabled={isSendingOtp}>
            {isSendingOtp ? 'Sending verification code...' : 'Send Verification Code'}
          </Button>
        ) : (
          <Button type="submit" fullWidth disabled={isLoading || otp.length !== 6}>
            {isLoading ? 'Creating account...' : 'Complete Sign up'}
          </Button>
        )}
      </form>
    </AuthLayout>
  );
};
