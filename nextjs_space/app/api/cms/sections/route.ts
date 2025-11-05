
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/db';

// GET all sections
export async function GET() {
  try {
    const sections = await prisma.section.findMany({
      where: { isActive: true },
      include: {
        pages: {
          where: { published: true },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(sections);
  } catch (error) {
    console.error('Error fetching sections:', error);
    return NextResponse.json({ error: 'Failed to fetch sections' }, { status: 500 });
  }
}

// POST create new section
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, slug, icon, description, isActive, showInNav, order } = body;

    const section = await prisma.section.create({
      data: {
        title,
        slug,
        icon,
        description,
        isActive: isActive ?? true,
        showInNav: showInNav ?? true,
        order: order ?? 0,
      },
    });

    return NextResponse.json(section, { status: 201 });
  } catch (error) {
    console.error('Error creating section:', error);
    return NextResponse.json({ error: 'Failed to create section' }, { status: 500 });
  }
}
