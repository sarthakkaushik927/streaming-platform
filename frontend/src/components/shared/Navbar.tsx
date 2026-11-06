import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useThemeStore } from '../../store/useThemeStore';
import { Sun, Moon, Menu, LogOut, LogIn, UserPlus, X } from 'lucide-react';

interface NavbarProps {
  variant?: 'default' | 'onDark' | 'compact';
}

export const Navbar: React.FC<NavbarProps> = ({ variant = 'default' }) => {
  const { user, logout } = useAuth();
  const theme = useThemeStore(state => state.theme);
  const toggleTheme = useThemeStore(state => state.toggleTheme);
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Explore', path: '/explore' },
    
  ];

  // ── compact variant: for room header row ──
  if (variant === 'compact') {
    return (
      <header className="bg-surface/95 backdrop-blur-md border-2 border-black/20 dark:border-primary/50 shadow-xl h-14 rounded-full flex items-center justify-between px-5 gap-4 relative">
        <Link to="/" className="font-display-lg text-[18px] text-on-surface tracking-tight hover:opacity-80 transition-opacity flex items-center gap-2">
          <img src="/favicon.svg" alt="SyncStream" className="w-6 h-6 rounded-md shadow-sm" />
          <span className="hidden sm:inline font-bold">SyncStream</span>
        </Link>

        <nav className="flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-1.5 rounded-full font-label-mono text-xs transition-all duration-200 ${
                  isActive
                    ? 'bg-surface-container-high text-on-surface font-bold border border-outline/50 shadow-sm'
                    : 'text-on-surface-variant font-medium hover:text-on-surface hover:bg-surface-container-low'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          <Link
            to="/hire-me"
            className={`px-3 py-1.5 rounded-full font-label-mono text-xs font-bold transition-all duration-200 ${
              location.pathname === '/hire-me'
                ? 'bg-primary text-on-primary shadow-md'
                : 'bg-primary text-on-primary hover:brightness-110 shadow-sm'
            }`}
          >
            Hire Me
          </Link>
        </nav>

        <button 
          onClick={toggleTheme}
          className="p-2 hover:bg-surface-container-low rounded-full transition-colors text-on-surface-variant hover:text-on-surface flex items-center justify-center border border-transparent hover:border-outline/50"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-primary" /> : <Moon className="w-4 h-4" />}
        </button>
      </header>
    );
  }

  // ── onDark variant: pill-nav on black frame for landing hero ──
  if (variant === 'onDark') {
    return (
      <nav className="flex items-center justify-between w-full">
        {/* Logo */}
        <Link to="/" className="font-display-lg text-[22px] tracking-tight text-cream-on-frame flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <img src="/favicon.svg" alt="SyncStream" className="w-7 h-7 rounded-lg shadow-sm" />
          SYNCSTREAM
        </Link>

        {/* Center pill with nav links */}
        <div className="hidden md:flex items-center bg-(--cream-on-frame) rounded-full px-1.5 py-1 border-2 border-black/20 dark:border-primary/40 shadow-md">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-1.5 rounded-full font-label-mono text-[11px] transition-all duration-200 ${
                  isActive
                    ? 'bg-(--frame) text-(--cream-on-frame) font-bold'
                    : 'text-(--frame)/70 hover:text-(--frame) font-medium'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          <Link
            to="/hire-me"
            className="px-4 py-1.5 rounded-full font-label-mono text-[11px] font-bold bg-primary text-on-primary hover:brightness-110 transition-all shadow-sm"
          >
            Hire Me
          </Link>
        </div>

        {/* Right side: theme toggle + CTA */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-cream-on-frame flex items-center justify-center"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {user ? (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/account" className="font-label-mono text-[11px] text-cream-on-frame/70 hover:text-cream-on-frame transition-colors px-3 py-1.5 rounded-full border border-white/10">
                @{user.username}
              </Link>
              <button onClick={handleLogout} className="font-label-mono text-[11px] text-cream-on-frame/50 hover:text-cream-on-frame transition-colors px-3 py-1.5 flex items-center gap-1.5">
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>
          ) : (
            <Link to="/register" className="hidden md:inline-flex">
              <span className="bg-primary text-on-primary font-label-mono text-[11px] font-bold px-5 py-2 rounded-full hover:brightness-105 transition-all">
                Launch app
              </span>
            </Link>
          )}

          <button 
            className="md:hidden p-2 text-cream-on-frame hover:bg-white/5 rounded-lg"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu for onDark */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 mt-2 mx-4 bg-(--frame) border border-white/10 rounded-2xl p-4 flex flex-col gap-2 shadow-2xl z-50">
            {navLinks.map((link) => (
              <Link 
                key={link.path}
                to={link.path} 
                className={`p-3 rounded-xl font-label-mono text-sm ${
                  location.pathname === link.path ? 'bg-white/10 text-cream-on-frame font-bold' : 'text-cream-on-frame/60 hover:text-cream-on-frame hover:bg-white/5'
                }`} 
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/hire-me"
              className="p-3 rounded-xl font-label-mono text-sm font-bold bg-primary text-on-primary text-center hover:brightness-110 transition-all"
              onClick={() => setIsMenuOpen(false)}
            >
              Hire Me
            </Link>
            {user ? (
              <button 
                className="p-3 text-left text-error hover:bg-white/5 rounded-xl font-label-mono text-sm mt-2 flex items-center gap-2" 
                onClick={() => { handleLogout(); setIsMenuOpen(false); }}
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            ) : (
              <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                <Link to="/login" className="p-3 text-cream-on-frame/60 hover:text-cream-on-frame hover:bg-white/5 rounded-xl font-label-mono text-sm flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                  <LogIn className="w-4 h-4" /> Sign In
                </Link>
                <Link to="/register" className="p-3 text-on-primary bg-primary rounded-xl font-bold font-label-mono text-sm flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                  <UserPlus className="w-4 h-4" /> Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    );
  }

  // ── Default variant: floating capsule top bar for all other pages ──
  return (
    <div className="sticky top-4 z-50 px-4 w-full flex justify-center pointer-events-none mb-6">
      <header className="pointer-events-auto bg-surface/95 backdrop-blur-md border-2 border-black/20 dark:border-primary/50 shadow-xl h-14 rounded-full flex items-center justify-between px-4 sm:px-6 w-full max-w-xl lg:max-w-2xl relative">
        <div className="flex items-center gap-8">
          <Link to="/" className="font-display-lg text-[20px] text-on-surface tracking-tight hover:opacity-80 transition-opacity flex items-center gap-2">
          <img src="/favicon.svg" alt="SyncStream" className="w-6 h-6 rounded-md shadow-sm" />
          <span className="hidden sm:inline">SyncStream</span>
        </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-full font-label-mono text-xs transition-all duration-200 ${
                    isActive
                      ? 'bg-surface-container-high text-on-surface font-bold border border-outline/50 shadow-sm'
                      : 'text-on-surface-variant font-medium hover:text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            <Link
              to="/hire-me"
              className={`px-3 py-1.5 rounded-full font-label-mono text-xs font-bold transition-all duration-200 ${
                location.pathname === '/hire-me'
                  ? 'bg-primary text-on-primary shadow-md'
                  : 'bg-primary text-on-primary hover:brightness-110 shadow-sm'
              }`}
            >
              Hire Me
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={toggleTheme}
            className="p-2 hover:bg-surface-container-low rounded-full transition-colors text-on-surface-variant hover:text-on-surface flex items-center justify-center border border-transparent hover:border-outline/50"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-primary" /> : <Moon className="w-4 h-4" />}
          </button>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/account" className="font-label-mono text-xs text-on-surface font-semibold bg-surface-container-low hover:bg-surface-container-high transition-colors px-3 py-1.5 rounded-full border border-outline/50 flex items-center gap-1.5 shadow-sm">
                  @{user.username}
                </Link>
                <button onClick={handleLogout} className="p-2 hover:bg-error/10 text-on-surface-variant hover:text-error rounded-full transition-colors flex items-center justify-center" title="Logout">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="font-label-mono text-xs font-bold text-on-surface px-4 py-1.5 rounded-full hover:bg-surface-container-low transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="font-label-mono text-xs font-bold text-on-primary bg-primary px-4 py-1.5 rounded-full shadow-md hover:brightness-105 transition-all">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          <button 
            className="md:hidden p-2 text-on-surface hover:bg-surface-container-low rounded-full border border-transparent hover:border-outline/50 transition-colors flex items-center justify-center"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        
        {/* Mobile Menu Dropdown anchored to the capsule */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-surface/95 backdrop-blur-xl border border-outline p-2 rounded-3xl flex flex-col gap-1 shadow-2xl origin-top animate-in fade-in slide-in-from-top-2">
            {navLinks.map((link) => (
              <Link 
                key={link.path}
                to={link.path} 
                className={`px-4 py-3 rounded-2xl font-label-mono text-sm transition-colors ${
                  location.pathname === link.path ? 'bg-surface-container-high text-on-surface font-bold shadow-sm border border-outline/30' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                }`} 
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/hire-me"
              className="px-4 py-3 rounded-2xl font-label-mono text-sm font-bold bg-primary text-on-primary text-center shadow-md hover:brightness-105 transition-all"
              onClick={() => setIsMenuOpen(false)}
            >
              Hire Me
            </Link>
            {user ? (
              <button 
                className="px-4 py-3 mt-2 text-left text-error hover:bg-error/5 rounded-2xl font-label-mono text-sm flex items-center gap-2 transition-colors border border-transparent hover:border-error/20" 
                onClick={() => { handleLogout(); setIsMenuOpen(false); }}
              >
                <LogOut className="w-4 h-4" /> Logout @{user.username}
              </button>
            ) : (
              <div className="flex flex-col gap-1 mt-2 pt-2 border-t border-outline/30">
                <Link to="/login" className="px-4 py-3 text-on-surface hover:bg-surface-container-low rounded-2xl font-label-mono text-sm flex items-center gap-2 transition-colors" onClick={() => setIsMenuOpen(false)}>
                  <LogIn className="w-4 h-4 text-on-surface-variant" /> Sign In
                </Link>
                <Link to="/register" className="px-4 py-3 text-on-primary bg-primary shadow-md rounded-2xl font-bold font-label-mono text-sm flex items-center gap-2 hover:brightness-105 transition-all" onClick={() => setIsMenuOpen(false)}>
                  <UserPlus className="w-4 h-4" /> Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </header>
    </div>
  );
};
