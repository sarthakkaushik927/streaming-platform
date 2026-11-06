import React from 'react';
import { LinkButton } from '../components/shared/LinkButton';

export const NotFoundPage: React.FC = () => (
  <main className="flex min-h-[calc(100svh-var(--nav-h))] flex-col items-center justify-center gap-5 px-4 text-center">
    <p aria-hidden="true" className="font-display text-[10rem] leading-none text-accent md:text-[14rem]">404</p>
    <h1 className="text-5xl">Page not found</h1>
    <p className="text-base text-muted">That link doesn't go anywhere.</p>
    <LinkButton to="/">Go to the home page</LinkButton>
  </main>
);
