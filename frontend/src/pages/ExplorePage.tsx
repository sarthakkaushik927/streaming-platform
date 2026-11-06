import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/shared/Navbar';
import { Footer } from '../components/shared/Footer';
import { GlassCard } from '../components/shared/GlassCard';
import { Button } from '../components/shared/Button';
import { Link } from 'react-router-dom';
import { roomService } from '../services/room.service';
import { Room } from '../types/room';

export const ExplorePage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await roomService.listAllRooms();
        setRooms(data);
      } catch (error) {
        console.error('Failed to load rooms', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.hostId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-frame p-2 md:p-4 flex flex-col font-body-md">
      <div className="flex-1 bg-background text-on-surface rounded-[32px] overflow-hidden flex flex-col shadow-2xl relative">
      <Navbar />

      <main className="flex-1 max-w-full px-6 lg:px-16 2xl:px-24 py-12 w-full">
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <span className="font-label-caps text-[11px] text-primary uppercase tracking-[0.15em]">Public Lobbies</span>
          <h1 className="font-display-lg text-4xl text-on-surface mt-1 tracking-tight">Explore Live Watch Parties</h1>
          <p className="font-body-md text-on-surface-variant max-w-xl">
            Join public synchronized lobbies created by creators, friends, and media enthusiasts around the world.
          </p>
        </div>

        {/* Search */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search rooms or hosts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-low border border-outline rounded-full pl-10 pr-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary font-label-mono"
            />
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
              search
            </span>
          </div>
          <span className="font-label-mono text-xs text-on-surface-variant">
            {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''} available
          </span>
        </div>

        {/* Rooms Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 rounded-full border-primary border-t-transparent animate-spin" />
          </div>
        ) : filteredRooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {filteredRooms.map(room => (
              <GlassCard key={room.id} className="p-6 flex flex-col justify-between hover:border-primary/30 transition-colors">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-3xl">🎬</span>
                    <span className={`inline-flex items-center gap-1.5 font-label-caps text-[10px] px-2.5 py-1 rounded-full border ${
                      room.isPrivate
                        ? 'bg-error/10 text-error border-error/30'
                        : 'bg-tertiary/10 text-tertiary border-tertiary/30'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${room.isPrivate ? 'bg-error' : 'bg-tertiary'}`} />
                      {room.isPrivate ? 'PRIVATE' : 'PUBLIC'}
                    </span>
                  </div>

                  <h3 className="font-headline-sm text-lg text-on-surface mb-2 leading-snug">{room.name}</h3>
                  <p className="font-label-mono text-xs text-on-surface-variant mb-1">
                    Host: <span className="text-primary">@{room.hostId}</span>
                  </p>
                  <p className="font-label-mono text-xs text-on-surface-variant mb-4">
                    ID: <span className="text-on-surface">{room.id}</span>
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {room.participantCount !== undefined && (
                      <span className="font-label-caps text-[10px] px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant border border-outline">
                        👥 {room.participantCount} watching
                      </span>
                    )}
                    {room.initialVideoId && room.initialVideoId !== 'dQw4w9WgXcQ' && (
                      <span className="font-label-caps text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                        🎥 Has Video
                      </span>
                    )}
                  </div>
                </div>

                <Link to={`/room/${room.id}`}>
                  <Button variant="primary" fullWidth icon={<span className="material-symbols-outlined text-[18px]">play_arrow</span>}>
                    Join Party
                  </Button>
                </Link>
              </GlassCard>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-surface-container-low rounded-[20px] border border-outline border-dashed">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40 mb-4">travel_explore</span>
            <p className="font-body-md text-on-surface-variant">No public rooms found.</p>
          </div>
        )}
      </main>

      </div>
    </div>
  );
};
