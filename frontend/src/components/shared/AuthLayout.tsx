import React, { ReactNode } from 'react';
import { Logo } from './Logo';
import { Ticket } from './Ticket';

interface AuthLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}

// Signing in is the box office: the form sits on a ticket with an "Admit one" stub on top.
export const AuthLayout: React.FC<AuthLayoutProps> = ({ title, description, children, footer }) => (
  <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
    <div className="mb-8">
      <Logo />
    </div>
    <div className="w-full max-w-md">
      <Ticket
        stubPosition="top"
        interactive={false}
        className="bg-card"
        stub={
          <div className="label-caps flex w-full items-center justify-between text-accent">
            <span>Admit one</span>
            <span className="text-muted">Box office</span>
          </div>
        }
      >
        <div className="p-1 md:p-3">
          <h1 className="text-5xl">{title}</h1>
          <p className="mt-2 mb-6 text-sm text-muted">{description}</p>
          {children}
          <p className="mt-6 text-center text-sm text-muted">{footer}</p>
        </div>
      </Ticket>
    </div>
  </main>
);
