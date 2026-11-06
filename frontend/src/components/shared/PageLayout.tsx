import React, { ReactNode } from 'react';
import { Footer } from './Footer';

interface PageLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

// The frame around every signed-in and public page, so pages only describe their own content. The router adds the navbar.
export const PageLayout: React.FC<PageLayoutProps> = ({ children, showFooter = false }) => (
  <div className="flex min-h-[calc(100svh-var(--nav-h))] flex-col">
    <main className="page-x flex-1 py-8 md:py-10">{children}</main>
    {showFooter && <Footer />}
  </div>
);
