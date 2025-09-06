import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { verifyToken } from '@/lib/auth';

// Admin: get/update a single order
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
    const orderId = parseInt(id);

    const order = await db.get(
      `SELECT o.*, u.email as userEmail, u.firstName || ' ' || u.lastName as customerName
       FROM orders o JOIN users u ON o.userId = u.id WHERE o.id = ?`,
      [orderId]
    );
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const items = await db.all(
      `SELECT oi.*, p.name, p.imageUrl FROM order_items oi JOIN products p ON oi.productId = p.id WHERE oi.orderId = ?`,
      [orderId]
    );
    order.items = items;

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Admin get order error:', error);
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
    const orderId = parseInt(id);
    const body = await request.json();

    const { status, paymentStatus } = body;
    if (!status && !paymentStatus) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Build dynamic update
    const fields: string[] = [];
    const values: any[] = [];
    if (status) { fields.push('status = ?'); values.push(status); }
    if (paymentStatus) { fields.push('paymentStatus = ?'); values.push(paymentStatus); }
    values.push(orderId);

    await db.run(`UPDATE orders SET ${fields.join(', ')} WHERE id = ?`, values);

    return NextResponse.json({ message: 'Order updated' });
  } catch (error) {
    console.error('Admin update order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}