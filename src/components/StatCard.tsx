import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'violet';
}

const colorMap = {
  indigo: {
    bg: 'from-indigo-500/20 to-indigo-500/5',
    border: 'border-indigo-500/30',
    iconBg: 'bg-indigo-500/20 text-indigo-400',
    text: 'text-indigo-400',
  },
  emerald: {
    bg: 'from-emerald-500/20 to-emerald-500/5',
    border: 'border-emerald-500/30',
    iconBg: 'bg-emerald-500/20 text-emerald-400',
    text: 'text-emerald-400',
  },
  amber: {
    bg: 'from-amber-500/20 to-amber-500/5',
    border: 'border-amber-500/30',
    iconBg: 'bg-amber-500/20 text-amber-400',
    text: 'text-amber-400',
  },
  rose: {
    bg: 'from-rose-500/20 to-rose-500/5',
    border: 'border-rose-500/30',
    iconBg: 'bg-rose-500/20 text-rose-400',
    text: 'text-rose-400',
  },
  violet: {
    bg: 'from-violet-500/20 to-violet-500/5',
    border: 'border-violet-500/30',
    iconBg: 'bg-violet-500/20 text-violet-400',
    text: 'text-violet-400',
  },
};

export function StatCard({ title, value, subtitle, icon: Icon, color = 'indigo' }: StatCardProps) {
  const styles = colorMap[color];

  return (
    <div
      className={`glass-card p-5 rounded-2xl bg-gradient-to-br ${styles.bg} border ${styles.border} flex flex-col justify-between`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">{title}</span>
        <div className={`p-2.5 rounded-xl ${styles.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4">
        <div className="text-3xl font-extrabold text-slate-100 tracking-tight">{value}</div>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
