
import { prisma } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';

export const metadata = {
  title: 'Impressum | Code & Beats',
  description: 'Impressum für mcgv.de',
};

export default async function ImpressumPage() {
  const page = await prisma.legalPage.findUnique({
    where: { type: 'IMPRESSUM' },
  });

  if (!page) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5">
        <div className="max-w-4xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-8">Impressum</h1>
          <p className="text-muted-foreground">Impressum wird geladen...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5">
      <div className="max-w-4xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
        <Card className="border-white/10 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-8">
            <article className="prose prose-invert prose-lg max-w-none">
              <ReactMarkdown>{page.content}</ReactMarkdown>
            </article>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
