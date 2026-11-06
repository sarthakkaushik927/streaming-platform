import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';

const FOOTER_LINKS = [
  { name: 'Explore rooms', path: '/explore' },
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Hire me', path: '/hire-me' },
];

export const Footer: React.FC = () => (
  <footer className="border-t border-line">
    <div className="page-x flex flex-col justify-between gap-6 py-8 md:flex-row md:items-center">
      <div className="space-y-2">
        <Logo />
        <p className="label-caps text-muted">Real-time YouTube watch parties</p>
      </div>
      <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
        {FOOTER_LINKS.map((link) => (
          <Link key={link.path} to={link.path} className="label-caps py-2 text-muted transition-colors hover:text-accent">
            {link.name}
          </Link>
        ))}
      </nav>
    </div>
  </footer>
);
