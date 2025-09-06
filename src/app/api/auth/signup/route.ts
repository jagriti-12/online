import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, phone, address, city, zipCode } = await request.json();

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, password, first name, and last name are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Check if user already exists
    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists. Please use the login page instead.' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const result = await db.run(
      `INSERT INTO users (email, password, firstName, lastName, phone, address, city, zipCode) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [email, hashedPassword, firstName, lastName, phone || null, address || null, city || null, zipCode || null]
    );

    // Get the created user
    const newUser = await db.get(
      'SELECT id, email, firstName, lastName, phone, address, city, zipCode, isOwner FROM users WHERE id = ?',
      [result.lastID]
    );

    // Generate JWT token
    const token = generateToken(newUser);

    return NextResponse.json({
      message: 'User created successfully',
      user: newUser,
      token
    }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}