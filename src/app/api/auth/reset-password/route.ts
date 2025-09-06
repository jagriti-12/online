import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();
    if (!token || !password) return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });

    const { getDatabase } = await import('@/lib/database');
    const { hashPassword } = await import('@/lib/auth');

    const db = await getDatabase();

    const user = await db.get(
      'SELECT id, resetToken, resetTokenExpires FROM users WHERE resetToken = ?',
      [token]
    );

    if (!user || !user.resetToken || !user.resetTokenExpires) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    const expired = new Date(user.resetTokenExpires).getTime() < Date.now();
    if (expired) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });

    const hashed = await hashPassword(password);

    await db.run(
      'UPDATE users SET password = ?, resetToken = NULL, resetTokenExpires = NULL WHERE id = ?',
      [hashed, user.id]
    );

    return NextResponse.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}