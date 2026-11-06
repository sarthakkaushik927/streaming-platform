import React from 'react';
import { Link } from 'react-router-dom';

export const Logo: React.FC = () => (
  <Link to="/" aria-label="SyncStream home" className="group inline-flex items-center gap-2 text-ink">
    <img src="/favicon.svg" alt="" className="size-8 transition-transform group-hover:-rotate-6" />
    <span aria-hidden="true" className="font-display text-2xl leading-none tracking-wide">
      SYNC<span className="text-accent">STREAM</span>
    </span>
  </Link>
);
