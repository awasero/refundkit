import { Header } from '@/components/dashboard/header';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  return (
    <>
      <Header title="Settings" />
      <div className="flex-1 p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Organization */}
          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
              <CardDescription>
                Manage your organization settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-w-sm">
                <label className="text-xs font-medium text-text-secondary">
                  Organization Name
                </label>
                <input
                  type="text"
                  defaultValue="My Organization"
                  className="mt-1.5 h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/40 focus:outline-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Webhooks */}
          <Card>
            <CardHeader>
              <CardTitle>Webhooks</CardTitle>
              <CardDescription>
                Configure webhook endpoints for real-time refund notifications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <label className="text-xs font-medium text-text-secondary">
                  Webhook URL
                </label>
                <input
                  type="url"
                  placeholder="https://your-app.com/webhooks/refundkit"
                  className="mt-1.5 h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/40 focus:outline-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-danger/20">
            <CardHeader>
              <CardTitle className="text-danger">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions for your organization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="danger">Delete Organization</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
