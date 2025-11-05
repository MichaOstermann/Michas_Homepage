
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/db';

// GET all pages
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const sectionId = searchParams.get('sectionId');

    const where = sectionId ? { sectionId } : {};

    const pages = await prisma.page.findMany({
      where,
      include: {
        section: true,
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(pages);
  } catch (error) {
    console.error('Error fetching pages:', error);
    return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
  }
}

// POST create new page
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      slug,
      content,
      excerpt,
      sectionId,
      featuredImageUrl,
      tags,
      published,
      showInNav,
      order,
    } = body;

    const page = await prisma.page.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        sectionId,
        featuredImageUrl,
        tags: tags || [],
        published: published ?? true,
        showInNav: showInNav ?? true,
        order: order ?? 0,
      },
    });

    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    console.error('Error creating page:', error);
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
  }
}
