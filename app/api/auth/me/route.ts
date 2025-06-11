import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromCookies, verifyToken } from '@/lib/jwt';

export async function GET(req: NextRequest) {
  try {
    console.log('ME API: Checking authentication');
    const token = getTokenFromCookies();

    if (!token) {
      console.log('ME API: No token found');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('ME API: Token found, verifying...');
    try {
      const decoded = verifyToken(token);
      console.log('ME API: Token verified for user:', decoded.email);
      
      // Get fresh user data from database
      const user = await prisma.userAuth.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          organization: true
        }
      });

      if (!user) {
        console.log('ME API: User not found in database');
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json({ user });
    } catch (verifyError) {
      console.error('ME API: Token verification failed:', verifyError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  } catch (error) {
    console.error('ME API: Error getting current user:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}