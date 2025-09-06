import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { verifyToken } from '@/lib/auth';

// Admin: list all orders with pagination and optional status filter
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || !decoded.isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const db = await getDatabase();

    let query = `
      SELECT o.*, u.email as userEmail, u.firstName || ' ' || u.lastName as customerName,
             COUNT(oi.id) as itemCount
      FROM orders o
      JOIN users u ON o.userId = u.id
      LEFT JOIN order_items oi ON o.id = oi.orderId
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }

    query += ' GROUP BY o.id ORDER BY o.createdAt DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const orders = await db.all(query, params);

    // Attach items per order
    for (const order of orders) {
      order.items = await db.all(
        `SELECT oi.*, p.name, p.imageUrl FROM order_items oi JOIN products p ON oi.productId = p.id WHERE oi.orderId = ?`,
        [order.id]
      );
    }

    // total count
    let countQuery = 'SELECT COUNT(*) as total FROM orders o WHERE 1=1';
    const countParams: any[] = [];
    if (status) {
      countQuery += ' AND o.status = ?';
      countParams.push(status);
    }
    const { total } = await db.get(countQuery, countParams);

    return NextResponse.json({
      orders,
      pagination: { total, limit, offset, hasMore: offset + limit < total }
    });
  } catch (error) {
    console.error('Admin orders list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Admin: create/update order status in bulk (optional future use)
export async function PATCH(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token);
    if (!decoded || !decoded.isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { updates } = await request.json(); // [{id, status}]
    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    const db = await getDatabase();
    await db.run('BEGIN TRANSACTION');
    try {
      for (const u of updates) {
        await db.run('UPDATE orders SET status = ? WHERE id = ?', [u.status, u.id]);
      }
      await db.run('COMMIT');
    } catch (e) {
      await db.run('ROLLBACK');
      throw e;
    }

    return NextResponse.json({ message: 'Orders updated' });
  } catch (error) {
    console.error('Admin orders bulk update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}