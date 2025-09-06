import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { verifyToken } from '@/lib/auth';

// Admin: list users with pagination and search
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || !decoded.isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const db = await getDatabase();

    let query = `SELECT id, email, firstName, lastName, isOwner, createdAt FROM users WHERE 1=1`;
    const params: any[] = [];

    if (search) {
      query += ' AND (email LIKE ? OR firstName LIKE ? OR lastName LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const users = await db.all(query, params);

    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    const countParams: any[] = [];
    if (search) {
      countQuery += ' AND (email LIKE ? OR firstName LIKE ? OR lastName LIKE ?)';
      const s = `%${search}%`;
      countParams.push(s, s, s);
    }
    const { total } = await db.get(countQuery, countParams);

    return NextResponse.json({ users, pagination: { total, limit, offset, hasMore: offset + limit < total } });
  } catch (error) {
    console.error('Admin users list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}