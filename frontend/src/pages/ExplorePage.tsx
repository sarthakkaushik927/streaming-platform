import React, { useEffect, useState } from 'react';
import { Compass, Search } from 'lucide-react';
import { PageLayout } from '../components/shared/PageLayout';
import { PageHeader } from '../components/shared/PageHeader';
import { EmptyState } from '../components/shared/EmptyState';
import { Input } from '../components/shared/Input';
import { RoomCard } from '../components/dashboard/RoomCard';
import { RoomGrid } from '../components/dashboard/RoomGrid';
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

  const filteredRooms = rooms.filter((room) =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.hostId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageLayout>
      <PageHeader title="Explore watch parties" description="Find a room and watch along with everyone in it." />

      <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="w-full max-w-sm">
          <Input aria-label="Search rooms" icon={<Search />} placeholder="Search rooms..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <span className="label-caps text-muted">
          {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''}
        </span>
      </div>

      <RoomGrid
        isLoading={isLoading}
        rooms={filteredRooms}
        renderRoom={(room) => <RoomCard key={room.id} room={room} actionLabel="Join Party" />}
        empty={<EmptyState icon={<Compass />} message="No rooms found." />}
      />
    </PageLayout>
  );
};
