import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

// Minimal Node mailer using SMTP via environment variables
import nodemailer from 'nodemailer';

function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;

  if (!host || !user || !pass || !from) return null;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return { transporter, from };
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const db = await getDatabase();

    // Insert or ignore duplicate emails
    await db.run(
      'INSERT OR IGNORE INTO subscribers (email) VALUES (?)',
      [email]
    );

    // Send confirmation email if SMTP configured
    const mail = getTransport();
    if (mail) {
      const siteName = 'GlamourCosmetics';
      await mail.transporter.sendMail({
        from: mail.from,
        to: email,
        subject: `You are subscribed to ${siteName}`,
        text: `Thanks for subscribing to ${siteName}! We'll send you our best deals and updates.`,
        html: `<p>Thanks for subscribing to <strong>${siteName}</strong>! We'll send you our best deals and updates.</p>`,
      });
    }

    return NextResponse.json({ message: 'Subscribed successfully' }, { status: 201 });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}