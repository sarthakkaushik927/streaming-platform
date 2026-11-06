import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoom } from '../hooks/useRoom';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types/participant';
import { Navbar } from '../components/shared/Navbar';
import { Button } from '../components/shared/Button';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { YouTubeWebsite } from '../components/room/VideoPlayer';
import { ParticipantList } from '../components/room/ParticipantList';
import { ChatPanel } from '../components/room/ChatPanel';
import { SyncTelemetry } from '../components/room/SyncTelemetry';
import { ChangeVideoModal } from '../components/room/ChangeVideoModal';
import { RoleManagementModal } from '../components/room/RoleManagementModal';
import { RoleBadge } from '../components/shared/RoleBadge';
import { useParticipants } from '../hooks/useParticipants';
import { useToast } from '../components/shared/Toast';
import { useRoomStore } from '../store/useRoomStore';
import { FloatingReactions } from '../components/room/FloatingReactions';
import { MessageSquare, X } from 'lucide-react';

export const RoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { room, joinRoom, leaveRoom, isLoading, participants, selfId } = useRoom();
  const { reactions, sendEmojiReaction, removeReaction } = useRoomStore();
  const { assignRole } = useParticipants();
  const { showToast } = useToast();
  
  const [isChangeVideoOpen, setIsChangeVideoOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  useEffect(() => {
    let isActive = true;

    if (!roomId || roomId === 'undefined') {
      navigate('/dashboard', { replace: true });
      return () => {
        isActive = false;
      };
    }

    joinRoom(roomId).catch((err: any) => {
      if (!isActive) return;
      showToast(err?.message || 'Unable to join this room', 'error');
      navigate('/dashboard', { replace: true });
    });

    return () => {
      isActive = false;
      leaveRoom();
    };
  }, [roomId, joinRoom, leaveRoom, navigate, showToast]);

  const currentUserRole = participants.find(p => String(p.userId) === String(selfId))?.role || Role.VIEWER;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/room/${roomId}`);
    showToast('Room link copied to clipboard!', 'success');
  };

  if (isLoading || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen flex flex-col pt-4 overflow-y-auto lg:overflow-hidden bg-frame">
      {/* Desktop Header Row: Left Room Info | Center Navbar | Right Actions */}
      <div className="hidden lg:grid grid-cols-[auto_1fr_auto] items-center gap-4 sticky top-4 z-50 px-4 w-full mb-6">
        {/* Left Side: Room Info */}
        <div className="justify-self-start flex items-center gap-3 bg-surface/95 backdrop-blur-md border-2 border-black/20 dark:border-primary/50 px-5 py-2 rounded-full shadow-xl h-14">
           <h1 className="font-headline-sm text-base text-on-surface font-bold truncate max-w-[140px] xl:max-w-[180px]" title={room.name}>{room.name}</h1>
           <div className="h-4 w-px bg-outline-variant/50" />
           <RoleBadge role={currentUserRole} />
        </div>

        {/* Center: Compact Navbar */}
        <div className="justify-self-center">
          <Navbar variant="compact" />
        </div>

        {/* Right Side: Actions */}
        <div className="justify-self-end flex items-center gap-1.5 bg-surface/95 backdrop-blur-md border-2 border-black/20 dark:border-primary/50 p-1.5 rounded-full shadow-xl h-14">
          <button onClick={handleCopyLink} className="flex items-center gap-1.5 px-4 py-2 rounded-full text-on-surface hover:bg-surface-container transition-colors font-label-mono text-xs font-bold">
            <span className="material-symbols-outlined text-sm">link</span>
            <span className="hidden xl:inline">Copy Link</span>
          </button>
          
          {(currentUserRole === Role.HOST || currentUserRole === Role.MODERATOR) && (
            <button onClick={() => setIsChangeVideoOpen(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-full text-on-surface hover:bg-surface-container transition-colors font-label-mono text-xs font-bold">
              <span className="material-symbols-outlined text-sm">movie</span>
              <span className="hidden xl:inline">Change Video</span>
            </button>
          )}
          
          <Button variant="danger" onClick={() => navigate('/dashboard')} icon={<span className="material-symbols-outlined text-sm">logout</span>}>
            <span className="hidden xl:inline">Leave</span>
            <span className="xl:hidden">Leave</span>
          </Button>
        </div>
      </div>

      {/* Mobile/Tablet Navbar & Toolbar */}
      <div className="lg:hidden">
        <Navbar />
      </div>
      
      {/* Mobile/Tablet Room Toolbar */}
      <div className="lg:hidden bg-surface-container border-b border-outline px-4 py-3 flex flex-wrap items-center justify-between gap-3 z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
           <h1 className="font-headline-sm text-sm font-bold text-on-surface truncate max-w-[130px] sm:max-w-[200px]" title={room.name}>{room.name}</h1>
           <RoleBadge role={currentUserRole} />
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={handleCopyLink} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-on-surface hover:bg-surface transition-colors font-label-mono text-xs border border-transparent hover:border-outline">
            <span className="material-symbols-outlined text-sm">link</span>
          </button>
          
          {(currentUserRole === Role.HOST || currentUserRole === Role.MODERATOR) && (
            <button onClick={() => setIsChangeVideoOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-on-surface hover:bg-surface transition-colors font-label-mono text-xs border border-transparent hover:border-outline">
              <span className="material-symbols-outlined text-sm">movie</span>
            </button>
          )}
          
          <Button variant="danger" onClick={() => navigate('/dashboard')} icon={<span className="material-symbols-outlined text-sm">logout</span>}>
            Leave
          </Button>
        </div>
      </div>

      {/* Main Room Layout */}
      <div className="flex-1 flex flex-col lg:flex-row bg-background min-h-0 mx-2 lg:mx-4 mb-2 lg:mb-4 rounded-[24px] lg:rounded-[32px] overflow-hidden shadow-2xl relative border border-outline">
         {/* Video Area (left side) */}
         <div className="w-full lg:flex-[3] flex flex-col p-3 md:p-4 lg:min-h-0 lg:overflow-y-auto custom-scrollbar relative">
           <FloatingReactions reactions={reactions} onRemove={removeReaction} />
           <YouTubeWebsite
             onChangeVideoClick={() => setIsChangeVideoOpen(true)}
             onSendReaction={sendEmojiReaction}
           />
         </div>
         
         {/* Sidebar (right side) */}
         <div className="w-full lg:w-[380px] xl:w-[420px] border-t lg:border-t-0 lg:border-l border-outline bg-background flex flex-col p-4 md:p-6 gap-6 h-auto lg:h-full lg:min-h-0 overflow-hidden flex-shrink-0 relative">
            <div className="h-[200px] lg:h-[30%] lg:min-h-[180px] lg:max-h-[250px] flex flex-col min-h-0 flex-shrink-0">
               <ParticipantList />
            </div>
            {/* Desktop Only Chat Panel */}
            <div className="hidden lg:flex flex-1 min-h-0 flex-col overflow-hidden">
               <ChatPanel />
            </div>
         </div>
      </div>
      
      {/* Mobile Floating Chatbot Trigger Button */}
      <button
        onClick={() => setIsMobileChatOpen(!isMobileChatOpen)}
        className="fixed bottom-6 right-6 z-50 lg:hidden flex items-center gap-2 bg-primary text-on-primary px-4 py-3.5 rounded-full shadow-[0_8px_24px_-8px_rgba(217,134,47,0.5)] hover:scale-105 active:scale-95 transition-all duration-200 border border-primary/20"
        title="Open Room Chat"
      >
        <MessageSquare className="w-5 h-5" />
        <span className="font-label-mono text-xs font-bold">Chat</span>
      </button>

      {/* Mobile Floating Chat Overlay Drawer */}
      {isMobileChatOpen && (
        <div className="fixed inset-x-4 top-20 bottom-20 z-50 lg:hidden rounded-[20px] shadow-2xl overflow-hidden border border-outline bg-surface/95 backdrop-blur-xl flex flex-col animate-in slide-in-from-bottom-5 duration-200">
          <div className="p-3.5 border-b border-outline bg-surface-container/80 flex items-center justify-between flex-shrink-0">
            <h3 className="font-headline-sm text-sm text-on-surface flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" /> Live Room Chat
            </h3>
            <button 
              onClick={() => setIsMobileChatOpen(false)} 
              className="p-1 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <ChatPanel />
          </div>
        </div>
      )}

      {/* Footer Telemetry */}
      <SyncTelemetry />

      {/* Modals */}
      <ChangeVideoModal isOpen={isChangeVideoOpen} onClose={() => setIsChangeVideoOpen(false)} />
      <RoleManagementModal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} />
    </div>
  );
};
