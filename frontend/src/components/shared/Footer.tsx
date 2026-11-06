import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full pb-6 px-4 md:px-6 mt-10">
      <div className="bg-frame text-cream-on-frame rounded-4xl overflow-hidden border border-white/10 shadow-xl relative">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-primary/10 blur-[100px] pointer-events-none" />

        <div className="px-8 md:px-16 pt-16 pb-12 flex flex-col lg:flex-row justify-between gap-16 relative z-10">
          
          <div className="max-w-sm">
            <Link to="/" className="text-cream-on-frame font-display-lg text-2xl flex items-center gap-3 mb-6 hover:opacity-80 transition-opacity">
              <span className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold text-sm shadow-[0_0_15px_var(--color-primary)]">V</span>
              <span className="tracking-tight text-transparent bg-clip-text bg-linear-to-r from-amber-400 via-orange-500 to-amber-500">SYNCSTREAM</span>
            </Link>
            <p className="font-label-mono text-sm text-cream-on-frame/50 leading-relaxed mb-8">
              Real-time cinematic synchronization for watch parties. Experience flawless frame-perfect playback with your friends.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-primary text-on-primary font-label-mono text-xs font-bold px-6 py-3 rounded-full hover:brightness-105 transition-all shadow-lg hover:shadow-primary/30"
            >
              Get Started Free
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-12 md:gap-24">
            <div className="space-y-6">
              <h4 className="font-label-mono text-xs font-bold text-primary uppercase tracking-widest">Platform</h4>
              <ul className="space-y-4 font-body-md text-sm">
                <li><Link className="text-cream-on-frame/70 hover:text-white transition-colors" to="/explore">Explore Rooms</Link></li>
                <li><Link className="text-cream-on-frame/70 hover:text-white transition-colors" to="/dashboard">Dashboard</Link></li>
              </ul>
            </div>
            
            <div className="space-y-6">
              <h4 className="font-label-mono text-xs font-bold text-primary uppercase tracking-widest">Connect</h4>
              <ul className="space-y-4 font-body-md text-sm">
                <li><Link className="text-cream-on-frame/70 hover:text-white transition-colors" to="/hire-me">Hire Me</Link></li>
                <li><a className="text-cream-on-frame/70 hover:text-white transition-colors" href="#">Twitter (X)</a></li>
                <li><a className="text-cream-on-frame/70 hover:text-white transition-colors" href="#">Discord</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Giant wordmark */}
        <div className="px-4 pb-8 flex justify-center relative z-10 overflow-hidden">
          <h2
            className="font-display-lg font-black tracking-[-0.04em] select-none leading-none text-center bg-clip-text text-transparent bg-linear-to-r from-amber-400/30 via-orange-500/30 to-amber-500/30 animate-shimmer-text"
            style={{ fontSize: 'clamp(4.5rem, 20vw, 18rem)' }}
          >
            SYNCSTREAM
          </h2>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 px-8 md:px-16 py-6 flex flex-col sm:flex-row justify-between items-center gap-4 relative z-10 bg-black/20">
          <p className="font-label-mono text-xs text-cream-on-frame/40">
            © 2026 SyncStream Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6 font-label-mono text-xs">
            <a className="text-cream-on-frame/40 hover:text-cream-on-frame transition-colors" href="#">Privacy Policy</a>
            <a className="text-cream-on-frame/40 hover:text-cream-on-frame transition-colors" href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
