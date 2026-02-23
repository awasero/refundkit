import { DocsSidebar } from '@/components/docs/sidebar';
import { getDocsSidebar } from '@/lib/docs';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const sections = getDocsSidebar();

  return (
    <div className="pt-16">
      <div className="mx-auto flex max-w-6xl gap-8 px-6 py-10">
        <DocsSidebar sections={sections} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
