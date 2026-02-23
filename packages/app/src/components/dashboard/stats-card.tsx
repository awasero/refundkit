import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}

const changeIcons = {
  positive: TrendingUp,
  negative: TrendingDown,
  neutral: Minus,
};

export function StatsCard({ title, value, change, changeType = 'neutral' }: StatsCardProps) {
  const ChangeIcon = changeIcons[changeType];

  return (
    <Card className="p-5">
      <p className="text-xs font-medium text-text-muted">{title}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">{value}</p>
      {change && (
        <div
          className={cn(
            'mt-2 flex items-center gap-1 text-xs',
            changeType === 'positive' && 'text-success',
            changeType === 'negative' && 'text-danger',
            changeType === 'neutral' && 'text-text-muted',
          )}
        >
          <ChangeIcon className="h-3 w-3" />
          {change}
        </div>
      )}
    </Card>
  );
}
