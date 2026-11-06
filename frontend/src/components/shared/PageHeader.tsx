import React, { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, actions }) => (
  <header className="mb-10 flex flex-col justify-between gap-6 border-b border-line pb-8 md:flex-row md:items-end">
    <div className="min-w-0">
      <h1 className="text-5xl wrap-break-word md:text-7xl">{title}</h1>
      {description && <p className="mt-3 max-w-2xl text-base text-muted">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
  </header>
);
