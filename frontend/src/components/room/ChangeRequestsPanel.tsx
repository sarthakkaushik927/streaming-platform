import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useRoom } from '../../hooks/useRoom';
import { Button } from '../shared/Button';
import { describeChange } from '../../utils/changeRequest';
import { EASE_OUT } from '../shared/motionPresets';

// The server only sends pending requests to the Host and Moderators.
// It is printed on the red curtain because it is the one thing in the room waiting on you.
export const ChangeRequestsPanel: React.FC = () => {
  const { changeRequests, reviewChange } = useRoom();

  if (changeRequests.length === 0) return null;

  return (
    <section aria-label="Pending change requests">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE_OUT }}
        className="curtain mb-4 space-y-2 p-3 text-curtain-ink shadow-[6px_6px_0_rgba(0,0,0,0.4)]"
      >
        <h2 className="label-caps text-curtain-ink">Requests waiting for approval ({changeRequests.length})</h2>
        <AnimatePresence initial={false}>
          {changeRequests.map((request) => (
            <motion.div
              key={request.id}
              layout
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className="flex flex-wrap items-center justify-between gap-3 rounded-sm bg-black/25 p-2 pl-3"
            >
              <p className="min-w-0 text-sm wrap-break-word">
                <span className="font-semibold">{request.requesterName}</span> wants to {describeChange(request)}
              </p>
              <div className="flex shrink-0 items-center gap-2">
                <Button variant="marquee" onClick={() => reviewChange(request.id, true)} icon={<Check className="size-4" />}>
                  Approve
                </Button>
                <Button variant="curtain-outline" onClick={() => reviewChange(request.id, false)} icon={<X className="size-4" />}>
                  Decline
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
};
