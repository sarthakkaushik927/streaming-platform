import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/shared/Navbar';
import { Button } from '../components/shared/Button';
import { GlassCard } from '../components/shared/GlassCard';
import { RoomCard } from '../components/dashboard/RoomCard';
import { CreateRoomModal } from '../components/dashboard/CreateRoomModal';
import { JoinRoomModal } from '../components/dashboard/JoinRoomModal';
import { roomService } from '../services/room.service';
import { Room } from '../types/room';
import { useAuth } from '../hooks/useAuth';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await roomService.listMyRooms();
        setRooms(data);
      } catch (error) {
        console.error('Failed to load rooms', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRooms();
  }, [isCreateOpen]);

  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    room.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteRoom = async (roomId: string) => {
    try {
      await roomService.deleteRoom(roomId);
      setRooms(prev => prev.filter(r => r.id !== roomId));
    } catch (err) {
      console.error('Failed to delete room', err);
    }
  };

  return (
    <div className="min-h-screen bg-frame p-2 md:p-4 flex flex-col font-body-md">
      <div className="flex-1 bg-background text-on-surface rounded-[32px] overflow-hidden flex flex-col shadow-2xl relative">
      <Navbar />
      
      <main className="flex-1 max-w-full px-6 lg:px-16 2xl:px-24 py-10 w-full">
        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="font-label-caps text-[11px] text-primary uppercase tracking-[0.15em]">Dashboard Overview</span>
            <h1 className="font-display-lg text-3xl md:text-4xl text-on-surface mt-1 tracking-tight">Welcome back, {user?.username || 'User'}</h1>
            <p className="font-body-md text-on-surface-variant">Manage your watch parties, connections, and live sync sessions</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsJoinOpen(true)} icon={<span className="material-symbols-outlined text-[20px]">login</span>}>
              Join Party
            </Button>
            <Button variant="primary" onClick={() => setIsCreateOpen(true)} icon={<span className="material-symbols-outlined text-[20px]">add</span>}>
              Create Room
            </Button>
          </div>
        </header>


        {/* Room Filter & Search */}
        <section className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="font-headline-sm text-xl text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">grid_view</span>
            Your Watch Rooms
          </h2>
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-container-low border border-outline rounded-xl pl-10 pr-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors font-label-mono"
            />
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
              search
            </span>
          </div>
        </section>

        {/* Room Grid */}
        <section className="mb-16">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 rounded-full border-primary border-t-transparent animate-spin" />
            </div>
          ) : filteredRooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRooms.map(room => (
                <RoomCard key={room.id} room={room} onDelete={handleDeleteRoom} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-surface-container-low rounded-[20px] border border-outline border-dashed">
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40 mb-4">inbox</span>
              <p className="font-body-md text-on-surface-variant mb-4">No rooms found.</p>
              <Button variant="outline" onClick={() => setIsCreateOpen(true)}>Create a new room</Button>
            </div>
          )}
        </section>
      </main>

      </div>
      <CreateRoomModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <JoinRoomModal isOpen={isJoinOpen} onClose={() => setIsJoinOpen(false)} />
    </div>
  );
};
