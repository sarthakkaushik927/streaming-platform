import React from 'react';
import { Role } from '../../types/participant';
import { Crown, Shield, User, Eye } from 'lucide-react';

interface RoleBadgeProps {
  role: Role;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  switch (role) {
    case Role.HOST:
      return (
        <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-500 font-label-caps text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-500/30">
          <Crown className="w-3 h-3" /> HOST
        </span>
      );
    case Role.MODERATOR:
      return (
        <span className="inline-flex items-center gap-1 bg-purple-500/10 text-purple-400 font-label-caps text-[10px] font-bold px-2.5 py-1 rounded-full border border-purple-500/30">
          <Shield className="w-3 h-3" /> MODERATOR
        </span>
      );
    case Role.PARTICIPANT:
      return (
        <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-400 font-label-caps text-[10px] font-bold px-2.5 py-1 rounded-full border border-blue-500/30">
          <User className="w-3 h-3" /> PARTICIPANT
        </span>
      );
    case Role.VIEWER:
      return (
        <span className="inline-flex items-center gap-1 bg-gray-500/10 text-gray-400 font-label-caps text-[10px] font-bold px-2.5 py-1 rounded-full border border-gray-500/30">
          <Eye className="w-3 h-3" /> VIEWER
        </span>
      );
  }
};
