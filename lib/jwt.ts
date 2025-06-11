import { sign, verify, SignOptions } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

// Using a constant JWT secret for consistency across the application
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// User payload interface for type safety
export interface JwtPayload {
  id: string;
  email: string;
  role: string;
  organization?: string | null;
  iat?: number;
  exp?: number;
}

/**
 * Sign a new JWT token with user data
 */
export function signToken(payload: Omit<JwtPayload, 'iat' | 'exp'>, expiresIn: string = '24h'): string {
  return sign(payload, JWT_SECRET, { expiresIn } as SignOptions);
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JwtPayload {
  return verify(token, JWT_SECRET) as JwtPayload;
}

/**
 * Get the token from request cookies - SYNCHRONOUS version
 * This resolves the issue with async/sync mismatch
 */
export function getTokenFromCookies(): string | undefined {
  // Using synchronous cookies() access
  const cookieStore = cookies();
  return cookieStore.get('auth_token')?.value;
}

/**
 * Extract and verify token from a request
 * Returns the decoded payload or null if invalid/missing
 */
export function getUserFromToken(): JwtPayload | null {
  try {
    // For API routes handling their own cookies
    const token = getTokenFromCookies();
    
    if (!token) {
      return null;
    }
    
    return verifyToken(token);
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}
