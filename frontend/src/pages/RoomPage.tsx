import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X } from 'lucide-react';
import { useRoom } from '../hooks/useRoom';
import { useToast } from '../hooks/useToast';
import { useRoomStore } from '../store/useRoomStore';
import { Role } from '../types/participant';
import { getErrorMessage } from '../utils/error';
import { IconButton } from '../components/shared/IconButton';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { YouTubeWebsite } from '../components/room/VideoPlayer';
import { ParticipantList } from '../components/room/ParticipantList';
import { ChatPanel } from '../components/room/ChatPanel';
import { SyncTelemetry } from '../components/room/SyncTelemetry';
import { ChangeVideoModal } from '../components/room/ChangeVideoModal';
import { TransferHostModal } from '../components/room/TransferHostModal';
import { ChangeRequestsPanel } from '../components/room/ChangeRequestsPanel';
import { RoomToolbar } from '../components/room/RoomToolbar';
import { FloatingReactions } from '../components/room/FloatingReactions';

export const RoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { room, joinRoom, leaveRoom, isLoading, participants, selfId, notice, clearNotice, wasRemoved } = useRoom();
  const { reactions, sendEmojiReaction, removeReaction } = useRoomStore();
  const { showToast } = useToast();

  const [isChangeVideoOpen, setIsChangeVideoOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  useEffect(() => {
    let isActive = true;

    if (!roomId || roomId === 'undefined') {
      navigate('/dashboard', { replace: true });
      return () => {
        isActive = false;
      };
    }

    joinRoom(roomId).catch((err: unknown) => {
      if (!isActive) return;
      showToast(getErrorMessage(err, 'Unable to join this room'), 'error');
      navigate('/dashboard', { replace: true });
    });

    return () => {
      isActive = false;
      leaveRoom();
    };
  }, [roomId, joinRoom, leaveRoom, navigate, showToast]);

  useEffect(() => {
    if (!notice) return;
    showToast(notice.message, notice.type);
    clearNotice();
  }, [notice, showToast, clearNotice]);

  useEffect(() => {
    if (wasRemoved) navigate('/dashboard', { replace: true });
  }, [wasRemoved, navigate]);

  const currentUserRole = participants.find((p) => String(p.userId) === String(selfId))?.role || Role.PARTICIPANT;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/room/${roomId}`);
    showToast('Room link copied to clipboard!', 'success');
  };

  if (isLoading || !room) {
    return (
      <div className="flex min-h-[calc(100svh-var(--nav-h))] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100svh-var(--nav-h))] flex-col lg:h-[calc(100svh-var(--nav-h))] lg:overflow-hidden">
      <RoomToolbar
        roomName={room.name}
        role={currentUserRole}
        onCopyLink={handleCopyLink}
        onTransferHost={() => setIsTransferOpen(true)}
        onLeave={() => navigate('/dashboard')}
        onOpenChat={() => setIsMobileChatOpen(true)}
      />

      <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 lg:flex-row lg:px-8">
        <div className="thin-scrollbar relative min-w-0 flex-1 lg:overflow-y-auto">
          <ChangeRequestsPanel />
          <YouTubeWebsite
            onChangeVideoClick={() => setIsChangeVideoOpen(true)}
            onSendReaction={sendEmojiReaction}
            overlay={<FloatingReactions reactions={reactions} onRemove={removeReaction} />}
          />
        </div>

        <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-90 xl:w-96">
          <div className="h-56 shrink-0 lg:h-[38%]">
            <ParticipantList />
          </div>
          <div className="hidden min-h-0 flex-1 lg:block">
            <ChatPanel />
          </div>
        </aside>
      </div>

      <SyncTelemetry />

      {isMobileChatOpen && (
        <div role="dialog" aria-label="Room chat" className="fixed inset-0 z-50 flex flex-col bg-canvas p-4 lg:hidden">
          <div className="mb-2 flex justify-end">
            <IconButton label="Close chat" onClick={() => setIsMobileChatOpen(false)}>
              <X className="size-5" />
            </IconButton>
          </div>
          <div className="min-h-0 flex-1">
            <ChatPanel />
          </div>
        </div>
      )}

      <ChangeVideoModal isOpen={isChangeVideoOpen} onClose={() => setIsChangeVideoOpen(false)} />
      <TransferHostModal isOpen={isTransferOpen} onClose={() => setIsTransferOpen(false)} />
    </div>
  );
};
