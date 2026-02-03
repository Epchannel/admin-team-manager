import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant?: 'default' | 'warning' | 'success' | 'danger';
  delay?: number;
}

export function StatsCard({ title, value, icon: Icon, variant = 'default', delay = 0 }: StatsCardProps) {
  const variantStyles = {
    default: 'border-border/50',
    warning: 'border-warning/50 bg-warning/5',
    success: 'border-success/50 bg-success/5',
    danger: 'border-destructive/50 bg-destructive/5',
  };

  const iconStyles = {
    default: 'text-primary',
    warning: 'text-warning',
    success: 'text-success',
    danger: 'text-destructive',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`glass-card rounded-xl p-6 ${variantStyles[variant]}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg bg-secondary ${iconStyles[variant]}`}>
          <Icon size={24} />
        </div>
      </div>
    </motion.div>
  );
}
