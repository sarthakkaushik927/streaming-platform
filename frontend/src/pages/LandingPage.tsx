import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useThemeStore } from '../store/useThemeStore';
import { Sun, Moon, ChevronRight, Play, Pause, MessageSquare, Users, Sparkles, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Footer } from '../components/shared/Footer';

const InvertedCorner = ({ className }: { className: string }) => (
  <div className={`absolute w-8 h-8 bg-transparent pointer-events-none ${className}`} />
);

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const theme = useThemeStore(state => state.theme);
  const toggleTheme = useThemeStore(state => state.toggleTheme);
  const [isCrazyMode, setIsCrazyMode] = useState(false);
  const [isPlayingDemo, setIsPlayingDemo] = useState(true);
  const [activeMessageIndex, setActiveMessageIndex] = useState(0);

  const demoSlides = [
    {
      title: "Cyberpunk 2077 — Official 4K Cinematic Trailer",
      channel: "CD PROJEKT RED",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
      tag: "4K SYNCHRONIZED"
    },
    {
      title: "Interstellar — Space Odyssey Watch Party",
      channel: "Warner Bros. Pictures",
      image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop",
      tag: "FRAME-PERFECT"
    },
    {
      title: "Lofi Hip Hop Radio — 24/7 Chill Beats",
      channel: "Lofi Girl",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop",
      tag: "LIVE AUDIO ROOM"
    }
  ];

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % demoSlides.length);
    }, 4500);
    return () => clearInterval(slideInterval);
  }, []);

  const demoChats = [
    { name: "Alex", text: "Frame-perfect sync is insane! 🔥", role: "HOST" },
    { name: "Sarah", text: "Ready for movie night! 🍿", role: "MOD" },
    { name: "David", text: "Zero lag audio sync 🚀", role: "VIEWER" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMessageIndex((prev) => (prev + 1) % demoChats.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-frame p-2 md:p-4 flex flex-col font-body-md">
      {/* Main Cream Panel */}
      <div className="relative flex-1 bg-background rounded-[32px] overflow-hidden flex flex-col min-h-[90vh]">
        
        {/* Mobile Header (clean full width bar) */}
        <div className="md:hidden flex items-center justify-between p-4 bg-frame text-cream-on-frame z-20">
          <Link to="/" className="text-cream-on-frame font-display-lg text-lg flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold text-xs shadow-sm">V</span>
            SYNCSTREAM
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full border border-white/20 text-cream-on-frame hover:bg-white/10 transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {user ? (
              <Link to="/dashboard" className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-white/20 text-cream-on-frame font-label-mono text-xs">
                Dashboard
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link to="/register" className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cream-on-frame text-frame font-bold font-label-mono text-xs">
                Let's Connect
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Desktop CUTOUT: TOP LEFT (Logo) */}
        <div className="hidden md:block absolute top-0 left-0 bg-frame rounded-br-[32px] p-6 pr-10 pb-8 z-20">
          <Link to="/" className="text-cream-on-frame font-display-lg text-2xl flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold text-xs shadow-sm">V</span>
            SYNCSTREAM
          </Link>
          <InvertedCorner className="top-0 -right-8 rounded-tl-[32px] shadow-[-16px_-16px_0_16px_var(--frame)]" />
          <InvertedCorner className="-bottom-8 left-0 rounded-tl-[32px] shadow-[-16px_-16px_0_16px_var(--frame)]" />
        </div>

        {/* Desktop CUTOUT: TOP RIGHT (Theme & Auth) */}
        <div className="hidden md:flex absolute top-0 right-0 bg-frame rounded-bl-[32px] p-6 pl-10 pb-8 z-20 items-center gap-3">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 text-cream-on-frame hover:bg-white/10 transition-colors font-label-mono text-xs"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span>Theme</span>
          </button>
          {user ? (
            <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 text-cream-on-frame hover:bg-white/10 transition-colors font-label-mono text-xs">
              Dashboard
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link to="/register" className="flex items-center gap-2 px-4 py-2 rounded-full bg-cream-on-frame text-frame font-bold hover:bg-white transition-colors font-label-mono text-xs">
              <span className="w-5 h-5 rounded-full bg-frame text-cream-on-frame flex items-center justify-center">
                <ChevronRight className="w-3 h-3" />
              </span>
              Let's Connect
            </Link>
          )}
          <InvertedCorner className="top-0 -left-8 rounded-tr-[32px] shadow-[16px_-16px_0_16px_var(--frame)]" />
          <InvertedCorner className="-bottom-8 right-0 rounded-tr-[32px] shadow-[16px_-16px_0_16px_var(--frame)]" />
        </div>

        {/* CUTOUT: BOTTOM RIGHT (Crazy Mode Toggle) */}
        <div className="hidden md:flex absolute bottom-0 right-0 bg-frame rounded-tl-[32px] p-5 md:p-6 pl-8 md:pl-10 pt-6 md:pt-8 z-20 items-center gap-3">
          <span className="text-cream-on-frame/70 font-label-mono text-xs">Crazy mode:</span>
          <div className="flex bg-white/10 rounded-full p-1 gap-1 border border-white/20">
            <button
              onClick={() => setIsCrazyMode(true)}
              className={`px-3 py-1 rounded-full text-xs font-label-mono transition-colors ${isCrazyMode ? 'bg-cream-on-frame text-frame font-bold' : 'text-cream-on-frame'}`}
            >
              On
            </button>
            <button
              onClick={() => setIsCrazyMode(false)}
              className={`px-3 py-1 rounded-full text-xs font-label-mono transition-colors ${!isCrazyMode ? 'bg-cream-on-frame text-frame font-bold' : 'text-cream-on-frame'}`}
            >
              Off
            </button>
          </div>
          <InvertedCorner className="bottom-0 -left-8 rounded-br-[32px] shadow-[16px_16px_0_16px_var(--frame)]" />
          <InvertedCorner className="-top-8 right-0 rounded-br-[32px] shadow-[16px_16px_0_16px_var(--frame)]" />
        </div>

        {/* --- INNER CONTENT --- */}
        <div className="flex-1 flex flex-col pt-32 pb-4 md:pb-20 px-6 lg:px-24 relative z-10">
          {/* Center Action Capsule */}
          <div className="hidden md:flex justify-center mb-16">
            <div className="bg-surface rounded-full border border-outline p-1.5 flex items-center shadow-sm">
              <Link
                to="/dashboard"
                className="px-10 py-2.5 rounded-full bg-frame text-cream-on-frame font-label-mono text-sm font-bold shadow-md hover:shadow-lg hover:shadow-primary/10 transition-all hover:-translate-y-0.5 flex items-center gap-2 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--color-primary)]" />
                Enter the Platform
              </Link>
            </div>
          </div>

          {/* Hero Copy */}
          <div className="max-w-2xl mt-10 md:mt-0">
            <h1 className="font-display-lg text-[clamp(3rem,8vw,5.5rem)] leading-[1.05] tracking-tight text-on-surface mb-8">
              There is a <br />
              <span className="flex items-center gap-4">
                <span className="inline-flex shrink-0 w-[1.2em] h-[0.8em] bg-primary/20 rounded-2xl border-2 border-primary items-center justify-center relative overflow-hidden shadow-sm">
                  <span className="w-[45%] h-full bg-primary/30 absolute left-0" />
                  <Play className="w-8 h-8 text-primary relative z-10 ml-1" fill="currentColor" />
                </span>
                Better Way
              </span>
              to Watch.
            </h1>

            <div className="flex items-center gap-4 mb-8 group cursor-pointer w-fit">
              <Link to="/register" className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-on-surface text-surface flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                  <ChevronRight className="w-5 h-5" />
                </span>
                <span className="font-label-mono text-base text-on-surface border-b-2 border-on-surface pb-0.5 font-bold">Start a room</span>
              </Link>
            </div>

            <div className="h-px w-full max-w-sm bg-outline mb-6" />

            <p className="font-body-md text-on-surface-variant max-w-md leading-relaxed text-sm">
              SyncStream is a synchronized playback platform that ensures every participant is frame-perfect in sync, avoiding costly buffers and desyncs.
            </p>
          </div>
        </div>

        {/* Animated Interactive 3D Video Demo Card */}
        <div className="relative mt-4 mb-16 md:mt-0 md:mb-0 px-6 md:px-0 md:absolute md:top-1/2 md:-translate-y-1/2 md:right-[3%] lg:right-[8%] w-full md:w-[360px] lg:w-[480px] z-20 pointer-events-auto">
          <motion.div
            initial={{ y: 0, rotate: -3 }}
            animate={{
              y: isCrazyMode ? [-15, 15, -15] : [-8, 8, -8],
              rotate: isCrazyMode ? [-5, 5, -5] : [-3, -1, -3]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            whileHover={{ scale: 1.03, rotate: 0 }}
            className="relative bg-frame border-2 border-white/20 rounded-[32px] p-4 lg:p-6 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] cursor-pointer group"
            onClick={() => setIsPlayingDemo(!isPlayingDemo)}
          >
            {/* Ambient Glow */}
            <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-[40px] -z-10 group-hover:bg-primary/30 transition-all duration-500" />

            {/* Video Player Display Screen Carousel */}
            <div className="relative aspect-video rounded-2xl bg-black overflow-hidden border border-white/10 shadow-inner flex flex-col justify-between p-4 group/screen">
              {/* Image Carousel Background with AnimatePresence */}
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentSlideIndex}
                  src={demoSlides[currentSlideIndex].image}
                  alt={demoSlides[currentSlideIndex].title}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: isPlayingDemo ? 0.85 : 0.4, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </AnimatePresence>

              {/* Gradient Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/60 pointer-events-none" />

              {/* Center Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/40"
                >
                  {isPlayingDemo ? (
                    <Pause className="w-7 h-7" fill="white" />
                  ) : (
                    <Play className="w-7 h-7 ml-1" fill="white" />
                  )}
                </motion.div>
              </div>

              {/* Floating Animated Reaction */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeMessageIndex}
                  initial={{ opacity: 0, y: 15, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.8 }}
                  transition={{ duration: 0.4 }}
                  className="absolute bottom-4 left-4 z-10 bg-black/70 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full text-white text-xs font-label-mono flex items-center gap-2 shadow-lg max-w-[70%]"
                >
                  <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  <span className="font-bold truncate">{demoChats[activeMessageIndex].name}:</span>
                  <span className="truncate">{demoChats[activeMessageIndex].text}</span>
                </motion.div>
              </AnimatePresence>

              {/* Carousel Slide Indicators */}
              <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                {demoSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); setCurrentSlideIndex(idx); }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlideIndex ? 'w-5 bg-primary' : 'w-1.5 bg-white/40 hover:bg-white'}`}
                  />
                ))}
              </div>
            </div>

            {/* Bottom Controls Info */}
            <div className="mt-4 flex items-center justify-between text-cream-on-frame/70 font-label-mono text-xs px-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-white font-semibold">Realtime Watch Room</span>
              </div>
              <span className="text-xs text-primary font-bold">Click to {isPlayingDemo ? 'Pause' : 'Play'}</span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mt-2 md:mt-4">
        <Footer />
      </div>
    </div>
  );
};
