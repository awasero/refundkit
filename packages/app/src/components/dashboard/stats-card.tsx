import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}

export function StatsCard({ title, value, change, changeType = 'neutral' }: StatsCardProps) {
  return (
    <div className="rounded-xl border border-white/5 bg-surface p-6">
      <p className="text-sm text-text-secondary">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-text-primary">{value}</p>
      {change && (
        <p
          className={cn(
            'mt-1 text-sm',
            changeType === 'positive' && 'text-success',
            changeType === 'negative' && 'text-danger',
            changeType === 'neutral' && 'text-text-secondary',
          )}
        >
          {change}
        </p>
      )}
    </div>
  );
}
