import React from 'react';
import type { User } from '@/lib/types';

interface ProfileHeaderProps {
  user: User;
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col items-center text-center pb-6 border-b border-gray-100">
      <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden mb-4 border-2 border-white shadow-md">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-teal-100 text-teal-700 flex items-center justify-center text-2xl font-bold">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <h2 className="text-xl font-bold text-gray-900">{user.fullName}</h2>
      <p className="text-teal-600 font-medium mt-1">ID Anggota: {user.memberId}</p>
    </div>
  );
}
