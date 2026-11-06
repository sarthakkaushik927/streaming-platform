import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { LogOut, Menu, Plus, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { CreateRoomModal } from '../dashboard/CreateRoomModal';
import { Button } from './Button';
import { IconButton } from './IconButton';
import { LinkButton } from './LinkButton';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { EASE_OUT } from './motionPresets';

const NAV_LINKS = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Explore', path: '/explore' },
  { name: 'Hire me', path: '/hire-me' },
];

const SHRINK_AFTER_PX = 24;

// Desktop link. The active one sits on a yellow ticket tab that slides over when you change page.
const DesktopLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `relative inline-flex min-h-10 items-center rounded-sm px-3.5 text-sm font-semibold tracking-[0.12em] uppercase transition-colors ${
        isActive ? 'text-marquee-ink' : 'text-ink hover:bg-subtle hover:text-accent'
      }`
    }
  >
    {({ isActive }) => (
      <>
        {isActive && (
          <motion.span
            layoutId="nav-active-tab"
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            className="absolute inset-0 rounded-sm bg-marquee shadow-[3px_3px_0_var(--curtain)]"
          />
        )}
        <span className="relative">{children}</span>
      </>
    )}
  </NavLink>
);

const menuList = { hidden: {}, shown: { transition: { staggerChildren: 0.06, delayChildren: 0.12 } } };
const menuItem = { hidden: { opacity: 0, y: 30 }, shown: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT } } };

// Phones get a red curtain that drops over the screen with big poster-style links.
const MobileMenu: React.FC<{ isOpen: boolean; onClose: () => void; account: React.ReactNode }> = ({ isOpen, onClose, account }) => {
  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          initial={{ clipPath: 'inset(0 0 100% 0)' }}
          animate={{ clipPath: 'inset(0 0 0% 0)' }}
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.45, ease: EASE_OUT }}
          className="curtain fixed inset-0 z-60 flex flex-col text-curtain-ink md:hidden"
        >
          <div aria-hidden="true" className="marquee-bulbs" />
          <div className="page-x flex h-16 items-center justify-between">
            <span className="label-caps">Menu</span>
            <IconButton label="Close menu" onClick={onClose} className="text-curtain-ink hover:bg-black/20 hover:text-curtain-ink">
              <X className="size-6" />
            </IconButton>
          </div>

          <motion.nav aria-label="Mobile" variants={menuList} initial="hidden" animate="shown" className="page-x flex flex-1 flex-col justify-center gap-2">
            {NAV_LINKS.map((link) => (
              <motion.div key={link.path} variants={menuItem}>
                <NavLink
                  to={link.path}
                  onClick={onClose}
                  className={({ isActive }) => `block py-1 font-display text-6xl leading-none ${isActive ? 'text-marquee' : 'text-curtain-ink'}`}
                >
                  {link.name}
                </NavLink>
              </motion.div>
            ))}
          </motion.nav>

          <div className="page-x flex flex-wrap items-center gap-3 border-t border-curtain-ink/25 py-5">{account}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/*
  One navbar for the whole app, rendered by the router so it stays put while pages change.
  It is fixed and the router reserves its full height, so shrinking on scroll never moves the page.
*/
export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (y) => setIsCompact(y > SHRINK_AFTER_PX));

  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    closeMenu();
    logout();
    navigate('/');
  };

  const openCreateRoom = () => {
    closeMenu();
    setIsCreateOpen(true);
  };

  // onCurtain styles the same actions for the red mobile menu.
  const renderAccount = (onCurtain: boolean) =>
    user ? (
      <>
        <Button variant={onCurtain ? 'marquee' : 'primary'} onClick={openCreateRoom} icon={<Plus className="size-4" />}>
          New room
        </Button>
        {onCurtain ? (
          <NavLink to="/account" onClick={closeMenu} className="label-caps inline-flex min-h-11 items-center px-2 text-curtain-ink">
            @{user.username}
          </NavLink>
        ) : (
          <DesktopLink to="/account">@{user.username}</DesktopLink>
        )}
        <IconButton label="Logout" onClick={handleLogout} className={onCurtain ? 'text-curtain-ink hover:bg-black/20 hover:text-curtain-ink' : ''}>
          <LogOut className="size-4" />
        </IconButton>
      </>
    ) : (
      <>
        <LinkButton to="/login" variant={onCurtain ? 'curtain-outline' : 'ghost'} onClick={closeMenu}>
          Sign in
        </LinkButton>
        <LinkButton to="/register" variant={onCurtain ? 'marquee' : 'primary'} onClick={closeMenu}>
          Get started
        </LinkButton>
      </>
    );

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 border-b border-line bg-canvas transition-shadow duration-300 ${
          isCompact ? 'shadow-[0_10px_30px_rgba(0,0,0,0.35)]' : ''
        }`}
      >
        <motion.div
          aria-hidden="true"
          initial={false}
          animate={{ height: isCompact ? 0 : 10, opacity: isCompact ? 0 : 1 }}
          transition={{ duration: 0.25 }}
          className="marquee-bulbs overflow-hidden"
        />
        <div className={`page-x flex items-center justify-between gap-4 transition-[height] duration-300 ${isCompact ? 'h-13' : 'h-16'}`}>
          <div className="flex items-center gap-6">
            <Logo />
            <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
              {NAV_LINKS.map((link) => (
                <DesktopLink key={link.path} to={link.path}>
                  {link.name}
                </DesktopLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <div className="hidden items-center gap-2 md:flex">{renderAccount(false)}</div>
            <IconButton label="Open menu" className="md:hidden" aria-expanded={isMenuOpen} onClick={() => setIsMenuOpen(true)}>
              <Menu className="size-5" />
            </IconButton>
          </div>
        </div>
      </header>

      <MobileMenu isOpen={isMenuOpen} onClose={closeMenu} account={renderAccount(true)} />
      <CreateRoomModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </>
  );
};
