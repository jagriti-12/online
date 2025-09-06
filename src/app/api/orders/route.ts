import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const db = await getDatabase();
    const body = await request.json();

    const { items, shippingInfo, paymentInfo, total } = body;

    // Validate required fields
    if (!items || !shippingInfo || !paymentInfo || !total) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Start transaction
    await db.run('BEGIN TRANSACTION');

    try {
      // Create order
      const orderResult = await db.run(`
        INSERT INTO orders (
          userId, total, status, 
          shippingFirstName, shippingLastName, shippingEmail, shippingPhone,
          shippingAddress, shippingCity, shippingState, shippingZipCode,
          paymentMethod, paymentStatus
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        decoded.userId,
        parseFloat(total),
        'pending',
        shippingInfo.firstName,
        shippingInfo.lastName,
        shippingInfo.email,
        shippingInfo.phone || null,
        shippingInfo.address,
        shippingInfo.city,
        shippingInfo.state,
        shippingInfo.zipCode,
        'credit_card',
        'pending'
      ]);

      const orderId = orderResult.lastID;

      // Create order items
      for (const item of items) {
        await db.run(`
          INSERT INTO order_items (orderId, productId, quantity, price)
          VALUES (?, ?, ?, ?)
        `, [orderId, item.productId, item.quantity, item.price]);

        // Update product stock
        await db.run(`
          UPDATE products 
          SET stock = stock - ? 
          WHERE id = ? AND stock >= ?
        `, [item.quantity, item.productId, item.quantity]);
      }

      // Clear user's cart
      await db.run('DELETE FROM cart_items WHERE userId = ?', [decoded.userId]);

      // Commit transaction
      await db.run('COMMIT');

      return NextResponse.json({ 
        message: 'Order placed successfully',
        orderId: orderId
      }, { status: 201 });

    } catch (error) {
      // Rollback transaction on error
      await db.run('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const db = await getDatabase();

    // Get user's orders
    const orders = await db.all(`
      SELECT o.*, 
             COUNT(oi.id) as itemCount
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.orderId
      WHERE o.userId = ?
      GROUP BY o.id
      ORDER BY o.createdAt DESC
    `, [decoded.userId]);

    // Get order items for each order
    for (const order of orders) {
      const items = await db.all(`
        SELECT oi.*, p.name, p.imageUrl
        FROM order_items oi
        JOIN products p ON oi.productId = p.id
        WHERE oi.orderId = ?
      `, [order.id]);
      
      order.items = items;
    }

    return NextResponse.json({ orders });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}