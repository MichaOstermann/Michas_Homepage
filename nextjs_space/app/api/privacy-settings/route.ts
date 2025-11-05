
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const settings = await prisma.privacySettings.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      return NextResponse.json({
        cookieBannerEnabled: true,
        cookieBannerText: 'Diese Website verwendet Cookies, um Ihnen die bestmögliche Nutzererfahrung zu bieten.',
        privacyPolicyUrl: '/datenschutz',
        imprintUrl: '/impressum',
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching privacy settings:', error);
    return NextResponse.json({ error: 'Failed to fetch privacy settings' }, { status: 500 });
  }
}
