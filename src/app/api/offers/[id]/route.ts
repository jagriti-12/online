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
    const offerId = parseInt(id);

    const offer = await db.get('SELECT * FROM offers WHERE id = ?', [offerId]);

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    return NextResponse.json({ offer });
  } catch (error) {
    console.error('Error fetching offer:', error);
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
    const offerId = parseInt(id);
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

    await db.run(`
      UPDATE offers 
      SET title = ?, description = ?, discountPercentage = ?, discountAmount = ?, 
          startDate = ?, endDate = ?, isActive = ?
      WHERE id = ?
    `, [
      title,
      description,
      discountPercentage ? parseFloat(discountPercentage) : 0,
      discountAmount ? parseFloat(discountAmount) : null,
      startDate || null,
      endDate || null,
      isActive ? 1 : 0,
      offerId
    ]);

    // Fetch updated offer
    const updatedOffer = await db.get('SELECT * FROM offers WHERE id = ?', [offerId]);

    return NextResponse.json({ 
      message: 'Offer updated successfully',
      offer: updatedOffer
    });
  } catch (error) {
    console.error('Error updating offer:', error);
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
    const offerId = parseInt(id);

    // Check if offer exists
    const offer = await db.get('SELECT id FROM offers WHERE id = ?', [offerId]);
    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    // Delete the offer
    await db.run('DELETE FROM offers WHERE id = ?', [offerId]);

    return NextResponse.json({ message: 'Offer deleted successfully' });
  } catch (error) {
    console.error('Error deleting offer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}