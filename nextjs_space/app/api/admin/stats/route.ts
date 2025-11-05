
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const [tracks, scripts, gaming, blog, contacts, sections, pages] = await Promise.all([
      prisma.track.count(),
      prisma.script.count(),
      prisma.gamingContent.count(),
      prisma.blogPost.count(),
      prisma.contactForm.count(),
      prisma.section.count(),
      prisma.page.count(),
    ]);

    return NextResponse.json({
      tracks,
      scripts,
      gaming,
      blog,
      contacts,
      sections,
      pages,
    });
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
