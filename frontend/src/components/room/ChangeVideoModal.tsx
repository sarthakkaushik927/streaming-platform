import React, { useState } from 'react';
import { Modal } from '../shared/Modal';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';
import { usePlayer } from '../../hooks/usePlayer';
import { useRoom } from '../../hooks/useRoom';
import { Role } from '../../types/participant';
import { extractYouTubeVideoId } from '../../utils/youtube';

interface ChangeVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangeVideoModal: React.FC<ChangeVideoModalProps> = ({ isOpen, onClose }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const { changeVideo } = usePlayer();
  const { participants, selfId, requestChange } = useRoom();

  const currentUserRole = participants.find(p => String(p.userId) === String(selfId))?.role;
  const canControl = currentUserRole === Role.HOST || currentUserRole === Role.MODERATOR;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    const videoId = extractYouTubeVideoId(url);
    if (!videoId || videoId.length !== 11) {
      setError('Please enter a valid YouTube video URL or ID (e.g. dQw4w9WgXcQ)');
      return;
    }
    
    if (canControl) {
      changeVideo(videoId);
    } else {
      requestChange({ action: 'CHANGE_VIDEO', videoId });
    }
    setUrl('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={canControl ? 'Change YouTube Video' : 'Request a Video Change'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="YOUTUBE URL OR VIDEO ID"
          icon="link"
          placeholder="e.g. https://www.youtube.com/watch?v=8vnrqEudzWQ or 8vnrqEudzWQ"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError('');
          }}
          error={error}
          autoFocus
        />
        <div className="flex gap-4 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
          <Button type="submit" variant="primary" className="flex-1" disabled={!url.trim()}>
            {canControl ? 'Update Video' : 'Send Request'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
