import Link from 'next/link';

interface PostCardProps {
  title: string;
  description: string;
  date: string;
  tags: string[];
  slug: string;
}

export function PostCard({ title, description, date, tags, slug }: PostCardProps) {
  return (
    <Link
      href={`/blog/${slug}`}
      className="block rounded-xl border border-white/5 bg-surface p-6 transition-colors hover:border-accent/20"
    >
      <div className="flex items-center gap-2">
        {tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent"
          >
            {tag}
          </span>
        ))}
      </div>
      <h3 className="mt-3 text-lg font-semibold text-text-primary">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">{description}</p>
      <p className="mt-4 text-xs text-text-muted">
        {new Date(date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </p>
    </Link>
  );
}
