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
    if (!decoded || !decoded.isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const db = await getDatabase();
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

    const result = await db.run(`
      INSERT INTO products (name, description, price, originalPrice, brand, imageUrl, stock, categoryId, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name,
      description,
      parseFloat(price),
      originalPrice ? parseFloat(originalPrice) : null,
      brand,
      imageUrl || null,
      parseInt(stock) || 0,
      parseInt(categoryId),
      featured ? 1 : 0
    ]);

    // Fetch the created product
    const newProduct = await db.get(`
      SELECT p.*, c.name as categoryName 
      FROM products p
      LEFT JOIN categories c ON p.categoryId = c.id
      WHERE p.id = ?
    `, [result.lastID]);

    return NextResponse.json({ 
      message: 'Product created successfully',
      product: newProduct
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const db = await getDatabase();

    let query = `
      SELECT p.*, c.name as categoryName 
      FROM products p 
      LEFT JOIN categories c ON p.categoryId = c.id 
      WHERE 1=1
    `;
    const params: any[] = [];

    // Add filters
    if (category) {
      query += ' AND c.name = ?';
      params.push(category);
    }

    if (brand) {
      query += ' AND p.brand = ?';
      params.push(brand);
    }

    if (featured === 'true') {
      query += ' AND p.featured = 1';
    }

    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Add ordering and pagination
    query += ' ORDER BY p.createdAt DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const products = await db.all(query, params);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM products p 
      LEFT JOIN categories c ON p.categoryId = c.id 
      WHERE 1=1
    `;
    const countParams: any[] = [];

    if (category) {
      countQuery += ' AND c.name = ?';
      countParams.push(category);
    }

    if (brand) {
      countQuery += ' AND p.brand = ?';
      countParams.push(brand);
    }

    if (featured === 'true') {
      countQuery += ' AND p.featured = 1';
    }

    if (search) {
      countQuery += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    const { total } = await db.get(countQuery, countParams);

    return NextResponse.json({
      products,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });

  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}