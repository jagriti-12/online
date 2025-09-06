import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { getUserFromToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const db = await getDatabase();

    const cartItems = await db.all(`
      SELECT ci.*, p.name, p.price, p.imageUrl, p.stock
      FROM cart_items ci
      JOIN products p ON ci.productId = p.id
      WHERE ci.userId = ? AND p.isActive = 1
      ORDER BY ci.createdAt DESC
    `, [user.userId]);

    const total = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    return NextResponse.json({
      items: cartItems,
      total: total.toFixed(2)
    });

  } catch (error) {
    console.error('Cart fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { productId, quantity = 1 } = await request.json();

    if (!productId || quantity < 1) {
      return NextResponse.json({ error: 'Invalid product ID or quantity' }, { status: 400 });
    }

    const db = await getDatabase();

    // Check if product exists and is active
    const product = await db.get('SELECT id, stock FROM products WHERE id = ? AND isActive = 1', [productId]);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (product.stock < quantity) {
      return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });
    }

    // Check if item already exists in cart
    const existingItem = await db.get(
      'SELECT id, quantity FROM cart_items WHERE userId = ? AND productId = ?',
      [user.userId, productId]
    );

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock < newQuantity) {
        return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });
      }

      await db.run(
        'UPDATE cart_items SET quantity = ? WHERE id = ?',
        [newQuantity, existingItem.id]
      );
    } else {
      // Add new item
      await db.run(
        'INSERT INTO cart_items (userId, productId, quantity) VALUES (?, ?, ?)',
        [user.userId, productId, quantity]
      );
    }

    return NextResponse.json({ message: 'Item added to cart successfully' });

  } catch (error) {
    console.error('Add to cart error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { productId, quantity } = await request.json();

    if (!productId || quantity < 0) {
      return NextResponse.json({ error: 'Invalid product ID or quantity' }, { status: 400 });
    }

    const db = await getDatabase();

    if (quantity === 0) {
      // Remove item from cart
      await db.run('DELETE FROM cart_items WHERE userId = ? AND productId = ?', [user.userId, productId]);
    } else {
      // Check stock
      const product = await db.get('SELECT stock FROM products WHERE id = ? AND isActive = 1', [productId]);
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      if (product.stock < quantity) {
        return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });
      }

      // Update quantity
      await db.run(
        'UPDATE cart_items SET quantity = ? WHERE userId = ? AND productId = ?',
        [quantity, user.userId, productId]
      );
    }

    return NextResponse.json({ message: 'Cart updated successfully' });

  } catch (error) {
    console.error('Update cart error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}