import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const DOCS_DIR = path.join(process.cwd(), 'content/docs');

export interface DocMeta {
  title: string;
  description: string;
  order: number;
  slug: string[];
}

export interface Doc extends DocMeta {
  content: string;
}

function getFilesRecursive(dir: string, base: string[] = []): { filepath: string; slug: string[] }[] {
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: { filepath: string; slug: string[] }[] = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      files.push(...getFilesRecursive(path.join(dir, entry.name), [...base, entry.name]));
    } else if (entry.name.endsWith('.mdx')) {
      const name = entry.name.replace(/\.mdx$/, '');
      const slug = name === 'index' ? base : [...base, name];
      files.push({ filepath: path.join(dir, entry.name), slug });
    }
  }

  return files;
}

export function getAllDocs(): DocMeta[] {
  const files = getFilesRecursive(DOCS_DIR);

  return files
    .map(({ filepath, slug }) => {
      const raw = fs.readFileSync(filepath, 'utf-8');
      const { data } = matter(raw);
      return {
        title: data.title ?? slug[slug.length - 1] ?? 'Untitled',
        description: data.description ?? '',
        order: data.order ?? 99,
        slug,
      };
    })
    .sort((a, b) => a.order - b.order);
}

export function getDocBySlug(slug: string[]): Doc | null {
  const files = getFilesRecursive(DOCS_DIR);
  const match = files.find(
    (f) => f.slug.join('/') === slug.join('/'),
  );

  if (!match) return null;

  const raw = fs.readFileSync(match.filepath, 'utf-8');
  const { data, content } = matter(raw);

  return {
    title: data.title ?? 'Untitled',
    description: data.description ?? '',
    order: data.order ?? 99,
    slug,
    content,
  };
}

export interface SidebarSection {
  title: string;
  items: { title: string; slug: string; href: string }[];
}

export function getDocsSidebar(): SidebarSection[] {
  const docs = getAllDocs();
  const sections: Record<string, SidebarSection> = {};

  const sectionNames: Record<string, string> = {
    'getting-started': 'Getting Started',
    'mcp-server': 'MCP Server',
    sdk: 'SDK',
    'api-reference': 'API Reference',
    processors: 'Processors',
  };

  for (const doc of docs) {
    const sectionKey = doc.slug[0] ?? '_root';
    const sectionTitle = sectionNames[sectionKey] ?? sectionKey;

    if (!sections[sectionKey]) {
      sections[sectionKey] = { title: sectionTitle, items: [] };
    }

    sections[sectionKey].items.push({
      title: doc.title,
      slug: doc.slug.join('/'),
      href: `/docs/${doc.slug.join('/')}`,
    });
  }

  // Top-level docs (webhooks, errors)
  const topLevel = docs.filter((d) => d.slug.length === 1 && !sectionNames[d.slug[0]]);
  if (topLevel.length > 0) {
    sections['_other'] = {
      title: 'Other',
      items: topLevel.map((d) => ({
        title: d.title,
        slug: d.slug.join('/'),
        href: `/docs/${d.slug.join('/')}`,
      })),
    };
  }

  const order = ['getting-started', 'mcp-server', 'sdk', 'api-reference', 'processors', '_other'];
  return order.filter((k) => sections[k]).map((k) => sections[k]);
}
