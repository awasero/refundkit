'use client';

import { useState } from 'react';
import { Header } from '@/components/dashboard/header';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KeyRound, Copy, Trash2, Plus } from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  environment: 'live' | 'test';
  lastUsed: string | null;
}

const MOCK_KEYS: ApiKey[] = [
  {
    id: '1',
    name: 'Production Key',
    prefix: 'rk_live_abc1...',
    environment: 'live',
    lastUsed: '2 hours ago',
  },
  {
    id: '2',
    name: 'Development Key',
    prefix: 'rk_test_xyz9...',
    environment: 'test',
    lastUsed: '5 minutes ago',
  },
  {
    id: '3',
    name: 'CI/CD Pipeline',
    prefix: 'rk_test_def4...',
    environment: 'test',
    lastUsed: '1 day ago',
  },
];

export default function ApiKeysPage() {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <>
      <Header title="API Keys" />
      <div className="flex-1 p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary">
              Manage your API keys for the RefundKit SDK and REST API.
            </p>
            <Button
              size="sm"
              onClick={() => setShowCreate(!showCreate)}
            >
              <Plus className="h-3.5 w-3.5" />
              Create Key
            </Button>
          </div>

          {/* Create form */}
          {showCreate && (
            <Card>
              <CardHeader>
                <CardTitle>Create New API Key</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-text-secondary">
                      Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Production Key"
                      className="mt-1.5 h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/40 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-text-secondary">
                      Environment
                    </label>
                    <select className="mt-1.5 h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/40 focus:outline-none">
                      <option value="test">Test</option>
                      <option value="live">Live</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreate(false)}
                  >
                    Cancel
                  </Button>
                  <Button size="sm">Create</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* API key list */}
          <div className="space-y-3">
            {MOCK_KEYS.map((key) => (
              <Card key={key.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-muted">
                      <KeyRound className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-text-primary">
                          {key.name}
                        </p>
                        <Badge
                          variant={
                            key.environment === 'live'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {key.environment}
                        </Badge>
                      </div>
                      <p className="mt-0.5 font-mono text-xs text-text-muted">
                        {key.prefix}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-xs text-text-muted">
                      {key.lastUsed
                        ? `Last used ${key.lastUsed}`
                        : 'Never used'}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-text-muted hover:text-text-primary"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-text-muted hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
