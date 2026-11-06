import React, { useRef, useEffect, useCallback } from 'react';
import YouTube, { YouTubeProps, YouTubePlayer } from 'react-youtube';
import { usePlayer } from '../../hooks/usePlayer';
import { useRoom } from '../../hooks/useRoom';
import { Role } from '../../types/participant';
import { Button } from '../shared/Button';
import { extractYouTubeVideoId } from '../../utils/youtube';
import env from '../../config/env';
import {
  Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX,
  Search, Loader2, Clapperboard, Smile, Video, Maximize
} from 'lucide-react';

interface VideoRecommendation {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  videoId: string;
}

const REACTION_EMOJIS = ['🔥', '❤️', '👏', '🎉', '😮', '🚀'];

interface YouTubeWebsiteProps {
  onChangeVideoClick?: () => void;
  onSendReaction?: (emoji: string) => void;
}

export const YouTubeWebsite: React.FC<YouTubeWebsiteProps> = ({ onChangeVideoClick, onSendReaction }) => {
  const { playerState, play, pause, seek, changeVideo } = usePlayer();
  const { room, participants, selfId } = useRoom();

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

  const currentUserRole = participants.find(p => String(p.userId) === String(selfId))?.role || Role.VIEWER;
  const canControl = currentUserRole === Role.HOST || currentUserRole === Role.MODERATOR;
  const canControlRef = useRef(canControl);

  useEffect(() => {
    canControlRef.current = canControl;
  }, [canControl]);

  // ── Mute / unmute via react-youtube API ──
  const toggleMute = () => {
    if (!playerRef.current) return;
    try {
      if (isMuted) { playerRef.current.unMute(); setIsMuted(false); }
      else { playerRef.current.mute(); setIsMuted(true); }
    } catch {}
  };

  // ── react-youtube onReady: sync initial state ──
  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    try {
      event.target.seekTo(playerState.currentTime, true);
      if (playerState.state === 'playing') event.target.playVideo();
    } catch {}
  };

  // ── react-youtube onStateChange: host emits, viewer snaps back ──
  const onStateChange: YouTubeProps['onStateChange'] = (event) => {
    const YT_STATE = { ENDED: 0, PLAYING: 1, PAUSED: 2 };

    // Viewer: enforce host's state
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

    if (playerState.state === 'playing') {
      playerRef.current.playVideo();
    } else if (playerState.state === 'paused') {
      playerRef.current.pauseVideo();
    }

    try {
      const diff = Math.abs(playerRef.current.getCurrentTime() - playerState.currentTime);
      if (diff > 2) playerRef.current.seekTo(playerState.currentTime, true);
    } catch {}
  }, [playerState.state, playerState.currentTime, playerState.videoId, activeVideoId]);

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

  const handleManualPlay = () => {
    if (!canControl) return;
    const time = playerRef.current ? playerRef.current.getCurrentTime() : playerState.currentTime;
    play(time, activeVideoId);
  };

  const handleManualPause = () => {
    if (!canControl) return;
    const time = playerRef.current ? playerRef.current.getCurrentTime() : playerState.currentTime;
    pause(time, activeVideoId);
  };

  const handleSeekOffset = (seconds: number) => {
    if (!canControl) return;
    const current = playerRef.current ? playerRef.current.getCurrentTime() : playerState.currentTime;
    seek(Math.max(0, current + seconds), activeVideoId);
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
        setSearchResults(data.items.map((item: any) => ({
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
    if (!canControlRef.current) return;
    changeVideo(videoId);
  }, [changeVideo]);

  const isPlaying = playerState.state === 'playing';

  return (
    <div className="w-full flex flex-col lg:flex-row gap-4 items-stretch">

      {/* ── LEFT BOX: Video + Controls ── */}
      <div ref={videoContainerRef} className="flex-1 min-w-0 flex flex-col rounded-[24px] overflow-hidden bg-room-card-bg shadow-xl dark:p-[3px] border border-outline">
        <div className="flex-1 min-w-0 flex flex-col dark:bg-black dark:rounded-[21px] overflow-hidden">

        {/* Video player */}
        <div className="relative w-full aspect-video bg-black flex-1 min-h-[300px]">

          {/* Viewer overlay — blocks timeline scrubbing */}
          {!canControl && (
            <div className="absolute inset-0 z-30 bg-transparent cursor-not-allowed" title="Playback is controlled by the host" />
          )}

          <YouTube
            key={activeVideoId}
            videoId={activeVideoId}
            opts={{
              width: '100%',
              height: '100%',
              playerVars: {
                autoplay: isPlaying ? 1 : 0,
                controls: 1,
                disablekb: canControl ? 0 : 1,
                modestbranding: 1,
                rel: 0,
                playsinline: 1,
              },
            }}
            onReady={onPlayerReady}
            onStateChange={onStateChange}
            className="w-full h-full"
            iframeClassName="w-full h-full"
          />
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10" />

        {/* Controls bar */}
        <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3 bg-surface-container dark:bg-black border-t border-outline dark:border-white/10">
          <div className="flex items-center gap-2 flex-wrap">
            {isPlaying ? (
              <Button variant="primary" onClick={handleManualPause} disabled={!canControl} icon={<Pause className="w-4 h-4" />}>Pause</Button>
            ) : (
              <Button variant="primary" onClick={handleManualPlay} disabled={!canControl} icon={<Play className="w-4 h-4" />}>Play</Button>
            )}
            <button onClick={() => handleSeekOffset(-10)} disabled={!canControl} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-primary hover:text-black dark:hover:bg-primary dark:hover:text-black border border-black/10 dark:border-white/10 text-on-surface dark:text-white disabled:opacity-40 transition-all font-label-mono text-xs font-semibold shadow-xs" title="Rewind 10s">
              <RotateCcw className="w-3.5 h-3.5 text-primary" /> -10s
            </button>
            <button onClick={() => handleSeekOffset(10)} disabled={!canControl} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-primary hover:text-black dark:hover:bg-primary dark:hover:text-black border border-black/10 dark:border-white/10 text-on-surface dark:text-white disabled:opacity-40 transition-all font-label-mono text-xs font-semibold shadow-xs" title="Forward 10s">
              <RotateCw className="w-3.5 h-3.5 text-primary" /> +10s
            </button>
            <button onClick={toggleMute} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-primary hover:text-black dark:hover:bg-primary dark:hover:text-black border border-black/10 dark:border-white/10 text-on-surface dark:text-white transition-all font-label-mono text-xs font-semibold shadow-xs" title={isMuted ? 'Unmute' : 'Mute'}>
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-error" /> : <Volume2 className="w-3.5 h-3.5 text-primary" />}
              {isMuted ? 'Unmute' : 'Mute'}
            </button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-label-mono text-[10px] text-on-surface-variant dark:text-white/60 bg-surface dark:bg-white/5 px-3 py-1.5 rounded-lg border border-outline dark:border-white/10">
              ID: <span className="text-primary font-bold">{activeVideoId}</span>
            </span>
            {onChangeVideoClick && (
              <Button variant="outline" onClick={onChangeVideoClick} disabled={!canControl} icon={<Video className="w-4 h-4" />}>Change Video</Button>
            )}
            <button onClick={handleFullscreen} className="flex items-center justify-center p-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-primary hover:text-black dark:hover:bg-primary dark:hover:text-black border border-black/10 dark:border-white/10 text-on-surface dark:text-white transition-all shadow-xs" title="Toggle Fullscreen">
              <Maximize className="w-4 h-4 text-primary" />
            </button>
          </div>
        </div>

        {/* Reactions row */}
        {onSendReaction && (
          <div className="px-4 py-2.5 flex items-center gap-3 bg-surface dark:bg-black border-t border-outline dark:border-white/10 relative overflow-hidden flex-shrink-0">
            <div className="flex items-center gap-1.5 text-on-surface-variant relative z-10">
              <Smile className="w-4 h-4 text-primary" />
              <span className="font-label-caps text-[10px] font-bold text-primary uppercase tracking-widest">React</span>
            </div>
            <div className="h-4 w-px bg-outline relative z-10" />
            <div className="flex items-center gap-2 relative z-10">
              {REACTION_EMOJIS.map(emoji => (
                <button key={emoji} onClick={() => onSendReaction(emoji)}
                  className="text-xl hover:scale-125 active:scale-95 transition-transform p-1.5 rounded-xl hover:bg-surface-container-high dark:hover:bg-white/10 border border-transparent hover:border-primary/30"
                  title={`Send ${emoji}`}>{emoji}</button>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>

      {/* ── RIGHT BOX: YouTube Search ── */}
      <div className="w-full lg:w-[340px] xl:w-[360px] flex-shrink-0 flex flex-col border border-outline rounded-[24px] overflow-hidden bg-room-card-bg text-room-card-text shadow-md dark:p-[3px] h-[580px]">
        <div className="flex flex-col h-full dark:bg-black dark:rounded-[21px] overflow-hidden">

        {/* Panel header */}
        <div className="px-4 py-3 border-b border-black/10 dark:border-white/10 flex items-center gap-2 flex-shrink-0 dark:text-white">
          <Clapperboard className="w-4 h-4" />
          <span className="font-label-caps text-xs uppercase tracking-wider font-bold">Video Search</span>
        </div>

        {/* Search input */}
        <div className="px-3 py-3 flex-shrink-0 border-b border-black/10 dark:border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50 dark:opacity-100 dark:text-white/50" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search YouTube..."
              className="w-full bg-black/5 dark:bg-white/10 border-2 border-black/20 dark:border-primary/50 rounded-xl pl-9 pr-4 py-2 text-sm placeholder:opacity-50 dark:placeholder:text-white/40 focus:outline-none focus:border-black dark:focus:border-primary focus:ring-2 focus:ring-black/20 dark:focus:ring-primary/30 transition-all font-body-md text-room-card-text dark:text-white shadow-xs" />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2 min-h-0">
          {searching && <div className="flex items-center justify-center py-10"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>}

          {!searching && !searchQuery.trim() && (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-2 dark:text-white">
              <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/10 flex items-center justify-center mb-2">
                <Search className="w-5 h-5 opacity-50" />
              </div>
              <p className="font-body-md text-sm opacity-70 font-medium">Search YouTube for videos</p>
            </div>
          )}

          {!searching && searchQuery.trim() && searchResults?.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-2 dark:text-white">
              <Search className="w-6 h-6 opacity-50" />
              <p className="text-sm opacity-70 font-body-md">No results for "{searchQuery}"</p>
            </div>
          )}

          {!searching && searchResults && searchResults.length > 0 && searchResults.map(item => (
            <div key={item.id} onClick={() => handleVideoSelect(item.videoId)}
              className="flex gap-3 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 border border-transparent dark:border-white/5 transition-all cursor-pointer group dark:text-white h-20">
              <div className="w-24 aspect-video bg-black/10 dark:bg-white/5 rounded-lg overflow-hidden flex-shrink-0 relative">
                <img src={item.thumbnail} alt="thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-8 h-8 rounded-full bg-primary/90 text-black flex items-center justify-center shadow-lg transform scale-50 group-hover:scale-100 transition-all duration-300">
                    <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col overflow-hidden justify-center py-1 flex-1 min-w-0">
                <h4 className="font-headline-sm text-sm font-bold line-clamp-2 leading-snug">{item.title}</h4>
                <p className="font-label-mono text-[10px] opacity-60 mt-1 truncate">{item.channel}</p>
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
};