import React, { useRef, useEffect, useCallback } from 'react';
import YouTube, { YouTubeProps, YouTubePlayer } from 'react-youtube';
import { usePlayer } from '../../hooks/usePlayer';
import { useRoom } from '../../hooks/useRoom';
import { Role } from '../../types/participant';
import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import { IconButton } from '../shared/IconButton';
import { Input } from '../shared/Input';
import { extractYouTubeVideoId } from '../../utils/youtube';
import { describeChange } from '../../utils/changeRequest';
import env from '../../config/env';
import {
  Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX,
  Search, Loader2, Smile, Video, Maximize
} from 'lucide-react';

interface VideoRecommendation {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  videoId: string;
}

interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails?: {
      medium?: { url: string };
      default?: { url: string };
    };
  };
}

const REACTION_EMOJIS = ['🔥', '❤️', '👏', '🎉', '😮', '🚀'];

const YT_PLAYING = 1;
const YT_PAUSED = 2;
const SEEK_DETECT_SECONDS = 2;

// Must stay constant: react-youtube destroys and rebuilds the player whenever these change.
const PLAYER_OPTIONS: YouTubeProps['opts'] = {
  width: '100%',
  height: '100%',
  playerVars: {
    autoplay: 0,
    controls: 1,
    modestbranding: 1,
    rel: 0,
    playsinline: 1,
  },
};

interface YouTubeWebsiteProps {
  onChangeVideoClick?: () => void;
  onSendReaction?: (emoji: string) => void;
}

export const YouTubeWebsite: React.FC<YouTubeWebsiteProps> = ({ onChangeVideoClick, onSendReaction }) => {
  const { playerState, play, pause, seek, changeVideo } = usePlayer();
  const { room, participants, selfId, requestChange, myPendingRequest } = useRoom();

  // ── react-youtube player ref (the actual YT player API object) ──
  const playerRef = useRef<YouTubePlayer | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = React.useState(false);

  // ── Search state ──
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<VideoRecommendation[] | null>(null);
  const [searching, setSearching] = React.useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeVideoId = extractYouTubeVideoId(playerState.videoId || room?.initialVideoId || '8vnrqEudzWQ');

  const currentUserRole = participants.find(p => String(p.userId) === String(selfId))?.role || Role.PARTICIPANT;
  const canControl = currentUserRole === Role.HOST || currentUserRole === Role.MODERATOR;
  const canControlRef = useRef(canControl);

  useEffect(() => {
    canControlRef.current = canControl;
  }, [canControl]);

  // YouTube has no seek event, so spot timeline clicks and drags by watching for position jumps.
  const seekCheckRef = useRef({ playerState, seek, activeVideoId });
  useEffect(() => {
    seekCheckRef.current = { playerState, seek, activeVideoId };
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const player = playerRef.current;
      if (!player || !canControlRef.current) return;
      const { playerState: room, seek: sendSeek, activeVideoId: videoId } = seekCheckRef.current;
      try {
        // Only compare when the player and room agree, which skips loading and buffering.
        const ytState = player.getPlayerState();
        const bothPlaying = room.state === 'playing' && ytState === YT_PLAYING;
        const bothPaused = room.state === 'paused' && ytState === YT_PAUSED;
        if (!bothPlaying && !bothPaused) return;

        const elapsedSeconds = bothPlaying ? (Date.now() - room.timestamp) / 1000 : 0;
        const position = player.getCurrentTime();
        if (Math.abs(position - (room.currentTime + elapsedSeconds)) > SEEK_DETECT_SECONDS) {
          sendSeek(position, videoId);
        }
      } catch {
        // The player throws while its iframe is loading or being replaced. The next check retries.
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ── Mute / unmute via react-youtube API ──
  const toggleMute = () => {
    if (!playerRef.current) return;
    try {
      if (isMuted) { playerRef.current.unMute(); setIsMuted(false); }
      else { playerRef.current.mute(); setIsMuted(true); }
    } catch {
      // The YouTube player throws if its iframe isn't ready; the button state stays as it was.
    }
  };

  // ── react-youtube onReady: sync initial state ──
  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    try {
      if (playerState.state === 'playing') {
        // The room kept playing while this player loaded, so include the time that has passed since.
        const elapsedSeconds = (Date.now() - playerState.timestamp) / 1000;
        event.target.seekTo(playerState.currentTime + elapsedSeconds, true);
        event.target.playVideo();
      } else if (playerState.currentTime > 0) {
        // seekTo would start playback, so load the paused position without playing.
        event.target.cueVideoById({ videoId: activeVideoId, startSeconds: playerState.currentTime });
      }
    } catch {
      // The YouTube player throws if its iframe isn't ready; the next sync event corrects it.
    }
  };

  // ── react-youtube onStateChange: host emits, viewer snaps back ──
  const onStateChange: YouTubeProps['onStateChange'] = (event) => {
    const YT_STATE = { ENDED: 0, PLAYING: 1, PAUSED: 2 };

    // Participant: enforce host's state
    if (!canControlRef.current) {
      if (event.data === YT_STATE.ENDED) { playerRef.current?.pauseVideo(); return; }
      if (playerState.state === 'playing' && event.data !== YT_STATE.PLAYING) {
        playerRef.current?.playVideo();
      } else if (playerState.state === 'paused' && event.data === YT_STATE.PLAYING) {
        playerRef.current?.pauseVideo();
      }
      return;
    }

    // Host: emit socket event when they play/pause
    if (event.data === YT_STATE.PLAYING && playerState.state !== 'playing') {
      play(event.target.getCurrentTime(), activeVideoId);
    } else if ((event.data === YT_STATE.PAUSED || event.data === YT_STATE.ENDED) && playerState.state !== 'paused') {
      pause(event.target.getCurrentTime() || 0, activeVideoId);
    }
  };

  // ── Sync playerState → YT player whenever store updates (from socket) ──
  useEffect(() => {
    if (!playerRef.current || !activeVideoId) return;

    try {
      if (playerState.state === 'playing') {
        playerRef.current.playVideo();
      } else if (playerState.state === 'paused') {
        playerRef.current.pauseVideo();
      }

      const diff = Math.abs(playerRef.current.getCurrentTime() - playerState.currentTime);
      if (diff > 2) playerRef.current.seekTo(playerState.currentTime, true);
    } catch {
      // The player throws while its iframe is loading or being replaced. onPlayerReady syncs it once it's ready.
    }
  }, [playerState.state, playerState.currentTime, playerState.timestamp, playerState.videoId, activeVideoId]);

  // ── Manual controls ──
  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoContainerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Hosts and Moderators act directly; everyone else sends a request for approval.
  const handleManualPlay = () => {
    if (!canControl) { requestChange({ action: 'PLAY' }); return; }
    const time = playerRef.current ? playerRef.current.getCurrentTime() : playerState.currentTime;
    play(time, activeVideoId);
  };

  const handleManualPause = () => {
    if (!canControl) { requestChange({ action: 'PAUSE' }); return; }
    const time = playerRef.current ? playerRef.current.getCurrentTime() : playerState.currentTime;
    pause(time, activeVideoId);
  };

  const handleSeekOffset = (seconds: number) => {
    const current = playerRef.current ? playerRef.current.getCurrentTime() : playerState.currentTime;
    const target = Math.max(0, current + seconds);
    if (!canControl) { requestChange({ action: 'SEEK', currentTime: target }); return; }
    seek(target, activeVideoId);
  };

  // ── YouTube search ──
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) { setSearchResults(null); return; }
    if (!env.YOUTUBE_API_KEY) { setSearchResults(null); return; }
    setSearching(true);
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=10&key=${env.YOUTUBE_API_KEY}`
      );
      const data = await res.json();
      if (data.items) {
        setSearchResults(data.items.map((item: YouTubeSearchItem) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          channel: item.snippet.channelTitle,
          thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || '',
          videoId: item.id.videoId,
        })));
      }
    } catch { setSearchResults(null); }
    finally { setSearching(false); }
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => performSearch(searchQuery), 500);
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [searchQuery, performSearch]);

  const handleVideoSelect = useCallback((videoId: string) => {
    if (!canControlRef.current) { requestChange({ action: 'CHANGE_VIDEO', videoId }); return; }
    changeVideo(videoId);
  }, [changeVideo, requestChange]);

  const isPlaying = playerState.state === 'playing';

  return (
    <div className="flex flex-col gap-4">
      <div ref={videoContainerRef} className="overflow-hidden rounded-sm border border-line bg-card">
        {/* The screen sits on a red curtain stage with marquee bulbs above and below. */}
        <div className="curtain p-2 sm:p-3">
          <div aria-hidden="true" className="marquee-bulbs mb-2" />
          <div className="relative aspect-video w-full bg-screen">
            {/* Stops participants clicking the YouTube timeline directly */}
            {!canControl && (
              <div className="absolute inset-0 z-30 cursor-not-allowed" title="Playback is controlled by the host" />
            )}

            <YouTube
              key={activeVideoId}
              videoId={activeVideoId}
              opts={PLAYER_OPTIONS}
              onReady={onPlayerReady}
              onStateChange={onStateChange}
              className="h-full w-full"
              iframeClassName="w-full h-full"
            />
          </div>
          <div aria-hidden="true" className="marquee-bulbs mt-2" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line p-3">
          <div className="flex flex-wrap items-center gap-2">
            {isPlaying ? (
              <Button onClick={handleManualPause} icon={<Pause className="size-4" />}>{canControl ? 'Pause' : 'Request Pause'}</Button>
            ) : (
              <Button onClick={handleManualPlay} icon={<Play className="size-4" />}>{canControl ? 'Play' : 'Request Play'}</Button>
            )}
            <Button variant="outline" onClick={() => handleSeekOffset(-10)} title={canControl ? 'Rewind 10s' : 'Request to rewind 10s'} icon={<RotateCcw className="size-4" />}>-10s</Button>
            <Button variant="outline" onClick={() => handleSeekOffset(10)} title={canControl ? 'Forward 10s' : 'Request to forward 10s'} icon={<RotateCw className="size-4" />}>+10s</Button>
            <Button variant="outline" onClick={toggleMute} title={isMuted ? 'Unmute' : 'Mute'} icon={isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}>
              {isMuted ? 'Unmute' : 'Mute'}
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="hidden font-mono text-xs text-muted sm:inline">{activeVideoId}</span>
            {onChangeVideoClick && (
              <Button variant="outline" onClick={onChangeVideoClick} icon={<Video className="size-4" />}>{canControl ? 'Change Video' : 'Request Video Change'}</Button>
            )}
            <IconButton label="Toggle fullscreen" onClick={handleFullscreen}>
              <Maximize className="size-4" />
            </IconButton>
          </div>
        </div>

        {myPendingRequest && (
          <div role="status" className="border-t border-l-4 border-line border-l-marquee bg-accent-soft px-4 py-2 text-sm text-ink">
            Waiting for a host or moderator to approve your request to {describeChange(myPendingRequest)}.
          </div>
        )}

        {onSendReaction && (
          <div className="flex items-center gap-2 overflow-x-auto border-t border-line px-3 py-2">
            <span className="label-caps flex items-center gap-1.5 text-muted">
              <Smile className="size-4" /> React
            </span>
            {REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onSendReaction(emoji)}
                title={`Send ${emoji}`}
                aria-label={`Send ${emoji}`}
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-sm text-xl transition-transform hover:-translate-y-0.5 hover:bg-subtle active:translate-y-px"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      <Card className="p-4">
        <Input
          aria-label="Search YouTube"
          icon={<Search />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search YouTube..."
        />

        {searching && (
          <div className="flex justify-center py-8">
            <Loader2 className="size-6 animate-spin text-accent" />
          </div>
        )}

        {!searching && searchQuery.trim() && searchResults?.length === 0 && (
          <p className="py-8 text-center text-sm text-muted">No results for "{searchQuery}"</p>
        )}

        {!searching && searchResults && searchResults.length > 0 && (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {searchResults.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleVideoSelect(item.videoId)}
                className="flex gap-3 rounded-sm p-2 text-left transition-colors hover:bg-subtle"
              >
                <img src={item.thumbnail} alt="" className="aspect-video w-28 shrink-0 bg-subtle object-cover" />
                <span className="min-w-0">
                  <span className="line-clamp-2 text-sm font-semibold text-ink">{item.title}</span>
                  <span className="mt-1 block truncate text-xs text-muted">{item.channel}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
