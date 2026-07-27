import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface StatsCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon: LucideIcon;
  colorTheme?: 'red' | 'amber' | 'emerald' | 'indigo' | 'rose';
  onClick?: () => void;
  linkTo?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  colorTheme = 'red',
  onClick,
  linkTo,
}) => {
  const navigate = useNavigate();

  const getThemeStyles = () => {
    switch (colorTheme) {
      case 'amber':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'emerald':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'indigo':
        return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      case 'rose':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      case 'red':
      default:
        return 'bg-red-500/10 text-red-500 border border-red-500/20';
    }
  };

  const iconClass = getThemeStyles();

  const handleClick = () => {
    if (onClick) onClick();
    else if (linkTo) navigate(linkTo);
  };

  const isClickable = Boolean(onClick || linkTo);

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      onClick={isClickable ? handleClick : undefined}
      className={`bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3.5 ${
        isClickable ? 'cursor-pointer hover:bg-white/10 hover:border-white/20 transition' : ''
      }`}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider truncate">{title}</p>
        <p className="text-2xl font-bold text-white leading-tight mt-0.5">{value}</p>
        {description && <p className="text-[10px] text-gray-500 mt-0.5 truncate">{description}</p>}
      </div>
    </motion.div>
  );
};
