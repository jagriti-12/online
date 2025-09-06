import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { verifyToken, verifyPassword, hashPassword } = await import('@/lib/auth');
    const decoded = verifyToken(token);
    if (!decoded?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { currentPassword, newPassword } = await request.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters long' }, { status: 400 });
    }

    const { getDatabase } = await import('@/lib/database');
    const db = await getDatabase();

    const user = await db.get('SELECT id, password FROM users WHERE id = ?', [decoded.userId]);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const isValid = await verifyPassword(currentPassword, user.password);
    if (!isValid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });

    const hashed = await hashPassword(newPassword);
    await db.run('UPDATE users SET password = ? WHERE id = ?', [hashed, user.id]);

    return NextResponse.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}