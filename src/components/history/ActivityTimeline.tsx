import React from 'react';
import { motion } from 'framer-motion';
import { ActivityItem as ActivityItemType } from '@/lib/types';
import ActivityItem from './ActivityItem';

interface ActivityTimelineProps {
  activities: ActivityItemType[];
}

export default function ActivityTimeline({ activities }: ActivityTimelineProps) {
  return (
    <div className="relative pl-4 space-y-6">
      {/* Vertical line */}
      <div className="absolute left-[23px] top-4 bottom-4 w-0.5 bg-gray-200" />
      
      {activities.map((activity, index) => (
        <motion.div
          key={activity.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative flex gap-4"
        >
          {/* Dot */}
          <div className="absolute left-[3px] top-1.5 w-3 h-3 rounded-full bg-teal-500 border-2 border-white shadow-sm z-10" />
          
          <div className="pl-6 w-full">
            <ActivityItem activity={activity} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
