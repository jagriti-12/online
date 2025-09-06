import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    const { getDatabase } = await import('@/lib/database');
    const { sendPasswordResetEmail } = await import('@/lib/mail');

    const db = await getDatabase();

    const user = await db.get('SELECT id, email FROM users WHERE email = ?', [email]);

    // Always respond success to avoid user enumeration
    const successResponse = NextResponse.json({ message: 'If that email exists, a reset link has been sent.' });

    if (!user) return successResponse;

    // Generate token and expiry (60 minutes)
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    await db.run(
      'UPDATE users SET resetToken = ?, resetTokenExpires = ? WHERE id = ?',
      [token, expires, user.id]
    );

    // Build reset URL using host header
    const host = request.headers.get('host');
    const protocol = host?.includes('localhost') || host?.startsWith('127.') ? 'http' : 'https';
    const resetUrl = `${protocol}://${host}/reset-password?token=${token}`;

    try {
      await sendPasswordResetEmail(user.email, resetUrl);
    } catch (e) {
      console.warn('Failed to send reset email (SMTP may be misconfigured):', e);
    }

    return successResponse;
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}