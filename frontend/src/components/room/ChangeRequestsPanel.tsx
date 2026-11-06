import React from 'react';
import { Check, X } from 'lucide-react';
import { useRoom } from '../../hooks/useRoom';
import { Button } from '../shared/Button';
import { describeChange } from '../../utils/changeRequest';

// The server only sends pending requests to the Host and Moderators.
export const ChangeRequestsPanel: React.FC = () => {
  const { changeRequests, reviewChange } = useRoom();

  if (changeRequests.length === 0) return null;

  return (
    <section aria-label="Pending change requests" className="mb-3 shrink-0 rounded-2xl border border-primary/40 bg-surface-container p-3 space-y-2">
      <h3 className="font-label-caps text-xs font-bold uppercase tracking-wider text-primary">
        Requests waiting for approval ({changeRequests.length})
      </h3>
      {changeRequests.map((request) => (
        <div key={request.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface p-2.5 border border-outline">
          <p className="font-body-md text-sm text-on-surface min-w-0 wrap-break-word">
            <span className="font-bold">{request.requesterName}</span> wants to {describeChange(request)}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="primary" onClick={() => reviewChange(request.id, true)} icon={<Check className="w-4 h-4" />}>
              Approve
            </Button>
            <Button variant="ghost" onClick={() => reviewChange(request.id, false)} icon={<X className="w-4 h-4" />}>
              Decline
            </Button>
          </div>
        </div>
      ))}
    </section>
  );
};
