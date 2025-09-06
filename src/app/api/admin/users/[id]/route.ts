import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { verifyToken } from '@/lib/auth';

// Admin: get/update/delete a user (limited updates)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || !decoded.isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const db = await getDatabase();
    const { id } = await params;
    const userId = parseInt(id);

    const user = await db.get('SELECT id, email, firstName, lastName, isOwner, createdAt FROM users WHERE id = ?', [userId]);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Admin get user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token);
    if (!decoded || !decoded.isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const db = await getDatabase();
    const { id } = await params;
    const userId = parseInt(id);
    const body = await request.json();

    const { firstName, lastName, isOwner } = body;
    if (firstName == null && lastName == null && isOwner == null) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const fields: string[] = [];
    const values: any[] = [];
    if (firstName != null) { fields.push('firstName = ?'); values.push(firstName); }
    if (lastName != null) { fields.push('lastName = ?'); values.push(lastName); }
    if (isOwner != null) { fields.push('isOwner = ?'); values.push(isOwner ? 1 : 0); }
    values.push(userId);

    await db.run(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);

    return NextResponse.json({ message: 'User updated' });
  } catch (error) {
    console.error('Admin update user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token);
    if (!decoded || !decoded.isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const db = await getDatabase();
    const { id } = await params;
    const userId = parseInt(id);

    // Prevent deleting self (owner)
    if (decoded.userId === userId) {
      return NextResponse.json({ error: 'Cannot delete the currently authenticated owner' }, { status: 400 });
    }

    // Optional: delete user's related data (cart, orders) or reject if exists
    // For safety, reject if user has orders
    const hasOrders = await db.get('SELECT 1 FROM orders WHERE userId = ? LIMIT 1', [userId]);
    if (hasOrders) {
      return NextResponse.json({ error: 'Cannot delete user with existing orders' }, { status: 400 });
    }

    await db.run('DELETE FROM cart_items WHERE userId = ?', [userId]);
    await db.run('DELETE FROM users WHERE id = ?', [userId]);

    return NextResponse.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}