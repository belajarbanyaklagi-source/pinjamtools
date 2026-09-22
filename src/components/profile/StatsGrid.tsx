import { motion } from 'framer-motion';
import { Wrench, Heart, Trophy } from 'lucide-react';

interface StatsGridProps {
  stats: { totalBorrows: number, favoriteTools: number, rewardPoints: number };
}

export default function StatsGrid({ stats: userStats }: StatsGridProps) {
  const stats = [
    {
      label: 'Total Pinjam',
      value: userStats.totalBorrows,
      unit: 'ALAT',
      icon: Wrench,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50'
    },
    {
      label: 'Alat Favorit',
      value: userStats.favoriteTools,
      unit: 'JENIS',
      icon: Heart,
      color: 'text-rose-500',
      bgColor: 'bg-rose-50'
    },
    {
      label: 'Poin Reward',
      value: userStats.rewardPoints,
      unit: 'POIN',
      icon: Trophy,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50'
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center text-center"
          >
            <div className={`p-2 rounded-full ${stat.bgColor} ${stat.color} mb-2`}>
              <Icon size={18} />
            </div>
            <div className="text-lg font-bold text-gray-900 mb-0.5">
              {stat.value}
            </div>
            <div className="text-[10px] font-medium text-gray-500 mb-0.5">
              {stat.label}
            </div>
            <div className="text-[8px] font-bold text-gray-400 tracking-wider">
              {stat.unit}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
