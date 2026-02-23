import type { Metadata } from 'next';
import { getAllPosts } from '@/lib/blog';
import { PostCard } from '@/components/blog/post-card';

export const metadata: Metadata = {
  title: 'Blog — RefundKit',
  description: 'Engineering insights on refund infrastructure, AI agents, and payment processing.',
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="pt-24">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-4xl font-bold text-text-primary">Blog</h1>
        <p className="mt-4 text-text-secondary">
          Engineering insights on refund infrastructure, AI agents, and payment processing.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <PostCard key={post.slug} {...post} />
          ))}
        </div>

        {posts.length === 0 && (
          <p className="mt-12 text-center text-text-muted">No posts yet. Check back soon.</p>
        )}
      </div>
    </div>
  );
}
