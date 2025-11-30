// ============================================================
// app/api/auth/register/route.ts
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, businessName, businessType } = await request.json();

    if (!email || !password || !businessName) {
      return NextResponse.json(
        { error: 'Email, password, and business name are required' },
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
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    const result = await createUser(email, password, businessName, businessType || 'other');

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Registration failed' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful. Your account is pending admin approval.',
        status: 'pending',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}