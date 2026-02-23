import { Sidebar } from '@/components/dashboard/sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="ml-[60px] flex min-h-screen flex-1 flex-col">{children}</main>
    </div>
  );
}
