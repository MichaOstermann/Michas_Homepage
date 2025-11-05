
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET legal pages
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get('type');

    if (type) {
      const page = await prisma.legalPage.findUnique({
        where: { type: type as any },
      });

      if (!page) {
        return NextResponse.json({ error: 'Legal page not found' }, { status: 404 });
      }

      return NextResponse.json(page);
    }

    const pages = await prisma.legalPage.findMany();
    return NextResponse.json(pages);
  } catch (error) {
    console.error('Error fetching legal pages:', error);
    return NextResponse.json({ error: 'Failed to fetch legal pages' }, { status: 500 });
  }
}
