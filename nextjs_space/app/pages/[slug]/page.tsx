
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const page = await prisma.page.findUnique({
    where: { slug: params.slug },
  });

  if (!page) {
    return {
      title: 'Seite nicht gefunden',
    };
  }

  return {
    title: `${page.title} | Code & Beats`,
    description: page.excerpt || page.title,
  };
}

export default async function DynamicPage({ params }: { params: { slug: string } }) {
  const page = await prisma.page.findUnique({
    where: { slug: params.slug, published: true },
    include: {
      section: true,
    },
  });

  if (!page) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5">
      <div className="max-w-4xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Badge className="mb-4">{page.section.title}</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {page.title}
          </h1>
          
          {page.excerpt && (
            <p className="text-lg text-muted-foreground mb-6">{page.excerpt}</p>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(page.createdAt).toLocaleDateString('de-DE')}</span>
            </div>
            {page.tags && page.tags.length > 0 && (
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <div className="flex gap-2">
                  {page.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <Card className="border-white/10 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-8">
            <article className="prose prose-invert prose-lg max-w-none" suppressHydrationWarning>
              <ReactMarkdown>{page.content}</ReactMarkdown>
            </article>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
