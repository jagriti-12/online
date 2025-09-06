import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { verifyToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = await getDatabase();
    const { id } = await params;
    const productId = parseInt(id);

    const product = await db.get(`
      SELECT p.*, c.name as categoryName 
      FROM products p
      LEFT JOIN categories c ON p.categoryId = c.id
      WHERE p.id = ?
    `, [productId]);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const db = await getDatabase();
    const { id } = await params;
    const productId = parseInt(id);
    const body = await request.json();

    const {
      name,
      description,
      price,
      originalPrice,
      brand,
      imageUrl,
      stock,
      categoryId,
      featured
    } = body;

    // Validate required fields
    if (!name || !description || !price || !brand || !categoryId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await db.run(`
      UPDATE products 
      SET name = ?, description = ?, price = ?, originalPrice = ?, 
          brand = ?, imageUrl = ?, stock = ?, categoryId = ?, featured = ?
      WHERE id = ?
    `, [
      name,
      description,
      parseFloat(price),
      originalPrice ? parseFloat(originalPrice) : null,
      brand,
      imageUrl || null,
      parseInt(stock) || 0,
      parseInt(categoryId),
      featured ? 1 : 0,
      productId
    ]);

    // Fetch updated product
    const updatedProduct = await db.get(`
      SELECT p.*, c.name as categoryName 
      FROM products p
      LEFT JOIN categories c ON p.categoryId = c.id
      WHERE p.id = ?
    `, [productId]);

    return NextResponse.json({ 
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const db = await getDatabase();
    const { id } = await params;
    const productId = parseInt(id);

    // Check if product exists
    const product = await db.get('SELECT id FROM products WHERE id = ?', [productId]);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Delete related cart items first
    await db.run('DELETE FROM cart_items WHERE productId = ?', [productId]);
    
    // Delete the product
    await db.run('DELETE FROM products WHERE id = ?', [productId]);

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}