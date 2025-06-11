import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { signToken } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Find user by email
    const user = await prisma.userAuth.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Update last login time
    await prisma.userAuth.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });    // Create JWT token using the centralized utility
    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      organization: user.organization
    });
    // Log token length to verify it's created (don't log the actual token)
    try {
      const token = signToken({
        id: user.id,
        email: user.email,
        role: user.role,
        organization: user.organization
      });
      console.log('Login: Token created, length:', token.length);
    } catch (tokenError) {
      console.error('Login: Error creating token:', tokenError);
      return NextResponse.json(
        { error: 'Authentication failed - token creation error' },
        { status: 500 }
      );
    }


    // Set cookie
    const cookieStore = await cookies();
cookieStore.set({
    name: 'auth_token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Only use secure in production
    sameSite: 'lax', // Try 'lax' instead of 'strict' for easier testing
    path: '/',
});

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}