import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllDocs, getDocBySlug } from '@/lib/docs';
import { techArticleSchema } from '@/lib/structured-data';
import { Breadcrumbs } from '@/components/docs/breadcrumbs';
import { MDXRemote } from 'next-mdx-remote/rsc';

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export async function generateStaticParams() {
  const docs = getAllDocs();
  return docs.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDocBySlug(slug ?? ['getting-started']);
  if (!doc) return {};
  return {
    title: `${doc.title} — RefundKit Docs`,
    description: doc.description,
  };
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params;
  const docSlug = slug ?? ['getting-started'];
  const doc = getDocBySlug(docSlug);

  if (!doc) notFound();

  const jsonLd = techArticleSchema({
    title: doc.title,
    description: doc.description,
    url: `https://refundkit.dev/docs/${docSlug.join('/')}`,
  });

  const breadcrumbItems = docSlug.map((s, i) => ({
    label: i === docSlug.length - 1 ? doc.title : s.replace(/-/g, ' '),
    href: i === docSlug.length - 1 ? undefined : `/docs/${docSlug.slice(0, i + 1).join('/')}`,
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs items={breadcrumbItems} />
      <article className="prose mt-6">
        <h1>{doc.title}</h1>
        <MDXRemote source={doc.content} />
      </article>
    </>
  );
}
