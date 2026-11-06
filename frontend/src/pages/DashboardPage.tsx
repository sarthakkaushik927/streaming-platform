import React, { useEffect, useState } from 'react';
import { Inbox, LogIn, Plus, Search } from 'lucide-react';
import { PageLayout } from '../components/shared/PageLayout';
import { PageHeader } from '../components/shared/PageHeader';
import { EmptyState } from '../components/shared/EmptyState';
import { Input } from '../components/shared/Input';
import { RoomGrid } from '../components/dashboard/RoomGrid';
import { Button } from '../components/shared/Button';
import { RoomCard } from '../components/dashboard/RoomCard';
import { CreateRoomModal } from '../components/dashboard/CreateRoomModal';
import { JoinRoomModal } from '../components/dashboard/JoinRoomModal';
import { roomService } from '../services/room.service';
import { Room } from '../types/room';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { getErrorMessage } from '../utils/error';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
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
      showToast('Room deleted.', 'success');
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to delete room'), 'error');
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title={`Welcome back, ${user?.username || 'User'}`}
        description="Rooms you created or currently host."
        actions={
          <>
            <Button variant="outline" onClick={() => setIsJoinOpen(true)} icon={<LogIn className="size-4" />}>
              Join Party
            </Button>
            <Button onClick={() => setIsCreateOpen(true)} icon={<Plus className="size-4" />}>
              Create Room
            </Button>
          </>
        }
      />

      <div className="mb-8 max-w-sm">
        <Input aria-label="Search rooms" icon={<Search />} placeholder="Search rooms..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <RoomGrid
        isLoading={isLoading}
        rooms={filteredRooms}
        renderRoom={(room) => <RoomCard key={room.id} room={room} onDelete={handleDeleteRoom} />}
        empty={
          <EmptyState
            icon={<Inbox />}
            message="No rooms found."
            action={<Button variant="outline" onClick={() => setIsCreateOpen(true)}>Create a new room</Button>}
          />
        }
      />

      <CreateRoomModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <JoinRoomModal isOpen={isJoinOpen} onClose={() => setIsJoinOpen(false)} />
    </PageLayout>
  );
};
