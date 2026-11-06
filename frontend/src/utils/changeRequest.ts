import { PlaybackChange } from '../types/socket';

const formatTime = (seconds: number): string => {
  const whole = Math.floor(seconds);
  const minutes = Math.floor(whole / 60);
  return `${minutes}:${String(whole % 60).padStart(2, '0')}`;
};

export const describeChange = ({ action, currentTime, videoId }: PlaybackChange): string => {
  switch (action) {
    case 'PLAY':
      return 'play the video';
    case 'PAUSE':
      return 'pause the video';
    case 'SEEK':
      return `jump to ${formatTime(currentTime ?? 0)}`;
    case 'CHANGE_VIDEO':
      return `change the video to ${videoId}`;
  }
};
