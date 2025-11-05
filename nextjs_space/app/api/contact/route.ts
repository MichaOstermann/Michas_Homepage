
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Save to database
    const contactForm = await prisma.contactForm.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim(),
        status: 'UNREAD',
      },
    });

    // Send email notification (only if Resend is configured)
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'your_resend_api_key_here') {
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
          to: process.env.RESEND_TO_EMAIL || 'your-email@example.com',
          subject: `Neue Kontaktanfrage: ${subject}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #0B0F16 0%, #1A1F2E 100%); border-radius: 10px; border: 2px solid #06FFF0;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #06FFF0; text-shadow: 0 0 10px rgba(6, 255, 240, 0.5);">
                  🚀 Neue Kontaktanfrage
                </h1>
              </div>
              
              <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 8px; backdrop-filter: blur(10px); border: 1px solid rgba(6, 255, 240, 0.2);">
                <div style="margin-bottom: 20px;">
                  <h3 style="color: #FF006E; margin-bottom: 5px;">👤 Name:</h3>
                  <p style="color: #E0E0E0; margin: 0; font-size: 16px;">${name}</p>
                </div>
                
                <div style="margin-bottom: 20px;">
                  <h3 style="color: #FF006E; margin-bottom: 5px;">📧 E-Mail:</h3>
                  <p style="color: #E0E0E0; margin: 0; font-size: 16px;">
                    <a href="mailto:${email}" style="color: #06FFF0; text-decoration: none;">${email}</a>
                  </p>
                </div>
                
                <div style="margin-bottom: 20px;">
                  <h3 style="color: #FF006E; margin-bottom: 5px;">📋 Betreff:</h3>
                  <p style="color: #E0E0E0; margin: 0; font-size: 16px;">${subject}</p>
                </div>
                
                <div style="margin-bottom: 20px;">
                  <h3 style="color: #FF006E; margin-bottom: 5px;">💬 Nachricht:</h3>
                  <p style="color: #E0E0E0; margin: 0; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
                </div>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(6, 255, 240, 0.2);">
                <p style="color: #888; font-size: 12px; margin: 0;">
                  Diese Nachricht wurde über das Kontaktformular auf mcgv.de gesendet
                </p>
                <p style="color: #888; font-size: 12px; margin: 5px 0 0 0;">
                  Zeitstempel: ${new Date().toLocaleString('de-DE')}
                </p>
              </div>
            </div>
          `,
        });
      } catch (emailError) {
        // Log error but don't fail the request - form is already saved
        console.error('Email sending failed:', emailError);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Contact form submitted successfully',
        id: contactForm.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Contact form submission error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
