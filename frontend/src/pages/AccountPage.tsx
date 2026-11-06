import React from 'react';
import { PageLayout } from '../components/shared/PageLayout';
import { PageHeader } from '../components/shared/PageHeader';
import { Avatar } from '../components/shared/Avatar';
import { Button } from '../components/shared/Button';
import { Card } from '../components/shared/Card';
import { LinkButton } from '../components/shared/LinkButton';
import { useAuth } from '../hooks/useAuth';

const AccountField: React.FC<{ label: string; value: string; mono?: boolean }> = ({ label, value, mono }) => (
  <div>
    <dt className="label-caps text-muted">{label}</dt>
    <dd className={`mt-1 break-all text-ink ${mono ? 'font-mono text-sm' : 'text-base'}`}>{value}</dd>
  </div>
);

export const AccountPage: React.FC = () => {
  const { user, logout } = useAuth();
  const username = user?.username || 'User';

  return (
    <PageLayout>
      <PageHeader title="Your account" actions={<LinkButton to="/dashboard" variant="outline">Back to Dashboard</LinkButton>} />

      <Card className="max-w-2xl border-t-4 border-t-marquee p-6 md:p-8">
        <div className="flex items-center gap-4">
          <Avatar name={username} size="lg" />
          <h2 className="text-4xl wrap-break-word">@{username}</h2>
        </div>

        <dl className="mt-6 grid gap-6 border-t border-line pt-6 sm:grid-cols-2">
          <AccountField label="Username" value={username} />
          <AccountField label="Email address" value={user?.emailAddress || user?.email || ''} />
          <AccountField label="Account ID" value={user?.id || ''} mono />
        </dl>

        <div className="mt-6 flex justify-end border-t border-line pt-6">
          <Button variant="danger" onClick={logout}>Sign Out</Button>
        </div>
      </Card>
    </PageLayout>
  );
};
