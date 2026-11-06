import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Room } from '../../types/room';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { staggerItem, staggerOnMount } from '../shared/motionPresets';

interface RoomGridProps {
  isLoading: boolean;
  rooms: Room[];
  renderRoom: (room: Room) => ReactNode;
  empty: ReactNode;
}

// Shared by the dashboard and Explore, which only differ in their card and empty message. Tickets deal in one by one.
export const RoomGrid: React.FC<RoomGridProps> = ({ isLoading, rooms, renderRoom, empty }) => {
  if (isLoading) {
    return (
      <div className="py-16">
        <LoadingSpinner />
      </div>
    );
  }

  if (rooms.length === 0) return <>{empty}</>;

  return (
    <motion.div {...staggerOnMount} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {rooms.map((room) => (
        <motion.div key={room.id} {...staggerItem}>
          {renderRoom(room)}
        </motion.div>
      ))}
    </motion.div>
  );
};
