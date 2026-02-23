import { Header } from '@/components/dashboard/header';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Cpu, CreditCard, Square as SquareIcon, Check } from 'lucide-react';

const PROCESSORS = [
  {
    name: 'Stripe',
    description: 'Connect your Stripe account to process refunds.',
    status: 'active' as const,
    icon: Cpu,
  },
  {
    name: 'PayPal',
    description: 'PayPal refund processing integration.',
    status: 'coming_soon' as const,
    icon: CreditCard,
  },
  {
    name: 'Square',
    description: 'Square payment refund integration.',
    status: 'coming_soon' as const,
    icon: SquareIcon,
  },
];

export default function ProcessorsPage() {
  return (
    <>
      <Header title="Processors" />
      <div className="flex-1 p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <p className="text-sm text-text-secondary">
            Connect payment processors to enable refund processing.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PROCESSORS.map((processor) => {
              const Icon = processor.icon;
              return (
                <Card key={processor.name}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-muted">
                        <Icon className="h-5 w-5 text-accent" />
                      </div>
                      {processor.status === 'active' ? (
                        <Badge variant="default">
                          <Check className="mr-1 h-3 w-3" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Coming soon</Badge>
                      )}
                    </div>
                    <CardTitle className="mt-3">{processor.name}</CardTitle>
                    <CardDescription>{processor.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {processor.status === 'active' ? (
                      <Button variant="outline" className="w-full">
                        Manage
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full" disabled>
                        Notify me
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
