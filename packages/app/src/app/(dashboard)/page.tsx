'use client';

import { Header } from '@/components/dashboard/header';
import { StatsCard } from '@/components/dashboard/stats-card';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const chartData = [
  { day: 'Mon', volume: 4200 },
  { day: 'Tue', volume: 5800 },
  { day: 'Wed', volume: 4900 },
  { day: 'Thu', volume: 7200 },
  { day: 'Fri', volume: 6100 },
  { day: 'Sat', volume: 3400 },
  { day: 'Sun', volume: 5100 },
];

const QUICK_ACTIONS = [
  'Process Refund',
  'Create API Key',
  'Connect Processor',
  'View Docs',
];

const recentRefunds = [
  {
    id: 'ref_a1b2c3',
    amount: '$29.99',
    status: 'completed' as const,
    processor: 'Stripe',
    date: '2 hours ago',
  },
  {
    id: 'ref_d4e5f6',
    amount: '$149.00',
    status: 'pending' as const,
    processor: 'Stripe',
    date: '5 hours ago',
  },
  {
    id: 'ref_g7h8i9',
    amount: '$9.99',
    status: 'failed' as const,
    processor: 'Stripe',
    date: '1 day ago',
  },
];

const statusVariantMap = {
  completed: 'default',
  pending: 'warning',
  failed: 'destructive',
} as const;

function StatusBadge({ status }: { status: 'completed' | 'pending' | 'failed' }) {
  return (
    <Badge variant={statusVariantMap[status]}>
      {status}
    </Badge>
  );
}

export default function DashboardPage() {
  return (
    <>
      <Header title="Overview" />

      <div className="flex-1 p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Refunds"
              value="1,284"
              change="+12% from last month"
              changeType="positive"
            />
            <StatsCard
              title="Pending"
              value="23"
              change="5 new today"
              changeType="neutral"
            />
            <StatsCard
              title="Volume"
              value="$48,290"
              change="+8% from last month"
              changeType="positive"
            />
            <StatsCard
              title="Success Rate"
              value="97.2%"
              change="-0.3% from last month"
              changeType="negative"
            />
          </div>

          {/* Refund Volume Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Refund Volume</CardTitle>
              <CardDescription>Last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -12 }}>
                    <defs>
                      <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={0.24} />
                        <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                      tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-surface-raised)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                        color: 'var(--color-text-primary)',
                        fontSize: '13px',
                      }}
                      labelStyle={{ color: 'var(--color-text-muted)', marginBottom: '4px' }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Volume']}
                    />
                    <Area
                      type="monotone"
                      dataKey="volume"
                      stroke="#10B981"
                      strokeWidth={2}
                      fill="url(#volumeGradient)"
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Quick Actions</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {QUICK_ACTIONS.map((action) => (
                <Button key={action} variant="outline" className="rounded-full">
                  {action}
                </Button>
              ))}
            </div>
          </div>

          {/* Recent Refunds */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Refunds</CardTitle>
              <CardDescription>Latest transactions across all processors</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Processor</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentRefunds.map((refund) => (
                    <TableRow key={refund.id}>
                      <TableCell className="font-mono text-text-primary">
                        {refund.id}
                      </TableCell>
                      <TableCell className="text-text-primary">
                        {refund.amount}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={refund.status} />
                      </TableCell>
                      <TableCell>{refund.processor}</TableCell>
                      <TableCell>{refund.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
