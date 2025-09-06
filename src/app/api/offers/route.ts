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
      title,
      description,
      discountPercentage,
      discountAmount,
      startDate,
      endDate,
      isActive
    } = body;

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!discountPercentage && !discountAmount) {
      return NextResponse.json({ error: 'Either discount percentage or amount is required' }, { status: 400 });
    }

    const result = await db.run(`
      INSERT INTO offers (title, description, discountPercentage, discountAmount, startDate, endDate, isActive)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      title,
      description,
      discountPercentage ? parseFloat(discountPercentage) : 0,
      discountAmount ? parseFloat(discountAmount) : null,
      startDate || null,
      endDate || null,
      isActive ? 1 : 0
    ]);

    // Fetch the created offer
    const newOffer = await db.get('SELECT * FROM offers WHERE id = ?', [result.lastID]);

    return NextResponse.json({ 
      message: 'Offer created successfully',
      offer: newOffer
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating offer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();

    const offers = await db.all(`
      SELECT * FROM offers 
      WHERE isActive = 1 
      AND (startDate IS NULL OR startDate <= datetime('now'))
      AND (endDate IS NULL OR endDate >= datetime('now'))
      ORDER BY createdAt DESC
    `);

    return NextResponse.json({ offers });

  } catch (error) {
    console.error('Offers fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}