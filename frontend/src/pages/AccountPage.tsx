import React from 'react';
import { Navbar } from '../components/shared/Navbar';
import { Footer } from '../components/shared/Footer';
import { GlassCard } from '../components/shared/GlassCard';
import { Button } from '../components/shared/Button';
import { useAuth } from '../hooks/useAuth';
import { User, Mail, ShieldCheck, Calendar, Key, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AccountPage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-frame p-2 md:p-4 flex flex-col font-body-md">
      <div className="flex-1 bg-background text-on-surface rounded-[32px] overflow-hidden flex flex-col shadow-2xl relative">
      <Navbar />

      <main className="flex-1 max-w-full px-6 lg:px-16 2xl:px-24 py-12 w-full">
        {/* Header */}
        <div className="mb-10 text-center md:text-left flex flex-col md:flex-row justify-between md:items-end gap-6">
          <div>
            <span className="font-label-caps text-[11px] text-primary uppercase tracking-[0.15em]">Account Profile</span>
            <h1 className="font-display-lg text-4xl text-on-surface mt-1 tracking-tight">User Account Details</h1>
            <p className="font-body-md text-on-surface-variant">
              Manage your personal credentials, session security, and watch party host rights.
            </p>
          </div>

          <Link to="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        {/* Profile Card */}
        <GlassCard withLuminousBorder className="p-8 mb-10 space-y-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-outline-variant">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-3xl shadow-xl border-2 border-surface">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>

            <div className="text-center sm:text-left space-y-1">
              <div className="flex items-center gap-3 justify-center sm:justify-start">
                <h2 className="font-headline-sm text-2xl text-on-surface font-bold">@{user?.username || 'User'}</h2>
                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary font-label-caps text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-primary/20">
                  <ShieldCheck className="w-3 h-3" /> VERIFIED HOST
                </span>
              </div>
              <p className="font-body-md text-sm text-on-surface-variant flex items-center gap-2 justify-center sm:justify-start">
                <Mail className="w-4 h-4 text-primary" /> {user?.emailAddress || user?.email || 'user@example.com'}
              </p>
            </div>
          </div>

          {/* Account Info Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-surface-container-low rounded-2xl border border-outline space-y-1">
              <p className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-primary" /> USERNAME
              </p>
              <p className="font-label-mono text-sm text-on-surface font-bold">{user?.username || 'Not set'}</p>
            </div>

            <div className="p-4 bg-surface-container-low rounded-2xl border border-outline space-y-1">
              <p className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-primary" /> EMAIL ADDRESS
              </p>
              <p className="font-label-mono text-sm text-on-surface font-bold">{user?.emailAddress || user?.email || 'user@example.com'}</p>
            </div>

            <div className="p-4 bg-surface-container-low rounded-2xl border border-outline space-y-1">
              <p className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-primary" /> ACCOUNT ID (UUID)
              </p>
              <p className="font-label-mono text-xs text-on-surface-variant font-bold truncate">{user?.id || 'u-1001'}</p>
            </div>

            <div className="p-4 bg-surface-container-low rounded-2xl border border-outline space-y-1">
              <p className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" /> ACCOUNT STATUS
              </p>
              <p className="font-label-mono text-xs text-tertiary font-bold flex items-center gap-1.5 mt-0.5">
                <CheckCircle className="w-3.5 h-3.5" /> ACTIVE SESSION
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-outline-variant flex justify-end">
            <Button variant="danger" onClick={logout}>Sign Out</Button>
          </div>
        </GlassCard>
      </main>

      </div>
    </div>
  );
};
