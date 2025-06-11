import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
//todo

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Define which paths are protected and which are public
  const isPublicPath = path === '/login';
  const isApiPath = path.startsWith('/api/') && !path.startsWith('/api/auth/');
  
  const token = request.cookies.get('auth_token')?.value;
  
  if (isPublicPath && token) {
    // If user is logged in and tries to access login page, redirect to dashboard
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  if (!isPublicPath && !token && !path.startsWith('/api/auth/')) {
    // If user is not logged in and tries to access a protected route, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // For protected API routes, validate token and check permissions
  if (isApiPath) {
    try {
      if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      // Verify the token to ensure it's valid
      const decoded = verify(token, JWT_SECRET) as any;
      
      // For organization-specific API endpoints, check if user has access
      if (path.includes('/organizations/') && path.includes('/members')) {
        const orgInPath = decodeURIComponent(path.split('/organizations/')[1].split('/')[0]);
        
        if (decoded.role !== 'super_admin' && decoded.organization !== orgInPath) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
      }
      
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  }
  
  return NextResponse.next();
}

export const config = {
  // Match all paths except static files, images, and API routes
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};