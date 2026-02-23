'use client';

import { useState } from 'react';
import { Header } from '@/components/dashboard/header';
import { Key, Copy, Trash2, Plus } from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  environment: 'live' | 'test';
  lastUsed: string | null;
  createdAt: string;
}

const MOCK_KEYS: ApiKey[] = [
  { id: '1', name: 'Production Key', prefix: 'rk_live_abc1...', environment: 'live', lastUsed: '2 hours ago', createdAt: 'Jan 10, 2024' },
  { id: '2', name: 'Development Key', prefix: 'rk_test_xyz9...', environment: 'test', lastUsed: '5 minutes ago', createdAt: 'Jan 8, 2024' },
  { id: '3', name: 'CI/CD Pipeline', prefix: 'rk_test_def4...', environment: 'test', lastUsed: '1 day ago', createdAt: 'Jan 5, 2024' },
];

export default function ApiKeysPage() {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <>
      <Header title="API Keys" />
      <div className="mx-auto max-w-4xl p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            Manage your API keys for the RefundKit SDK and REST API.
          </p>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-black hover:bg-accent-hover"
          >
            <Plus className="h-4 w-4" />
            Create Key
          </button>
        </div>

        {showCreate && (
          <div className="mt-4 rounded-xl border border-white/5 bg-surface p-6">
            <h3 className="text-sm font-semibold text-text-primary">Create New API Key</h3>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-text-secondary">Name</label>
                <input
                  type="text"
                  placeholder="e.g., Production Key"
                  className="mt-1 w-full rounded-lg border border-white/5 bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-text-secondary">Environment</label>
                <select className="mt-1 w-full rounded-lg border border-white/5 bg-background px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none">
                  <option value="test">Test</option>
                  <option value="live">Live</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowCreate(false)}
                className="rounded-lg px-4 py-2 text-sm text-text-secondary hover:text-text-primary"
              >
                Cancel
              </button>
              <button className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-black hover:bg-accent-hover">
                Create
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 space-y-3">
          {MOCK_KEYS.map((key) => (
            <div
              key={key.id}
              className="flex items-center justify-between rounded-xl border border-white/5 bg-surface p-4"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <Key className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-text-primary">{key.name}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        key.environment === 'live'
                          ? 'bg-success/10 text-success'
                          : 'bg-zinc-500/10 text-zinc-400'
                      }`}
                    >
                      {key.environment}
                    </span>
                  </div>
                  <p className="mt-0.5 font-mono text-xs text-text-secondary">{key.prefix}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-xs text-text-muted">
                  {key.lastUsed ? `Last used ${key.lastUsed}` : 'Never used'}
                </p>
                <button className="text-text-secondary hover:text-text-primary">
                  <Copy className="h-4 w-4" />
                </button>
                <button className="text-text-secondary hover:text-danger">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
