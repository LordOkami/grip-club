import type { HandlerEvent } from '@netlify/functions';

export interface JWTPayload {
  sub: string; // User ID
  email: string;
  exp: number;
  aud: string;
  app_metadata?: {
    provider?: string;
    roles?: string[];
  };
  user_metadata?: {
    full_name?: string;
  };
}

// Validate Netlify Identity JWT token
export function validateToken(event: HandlerEvent): JWTPayload | null {
  const authHeader = event.headers.authorization || event.headers.Authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    // Decode JWT payload (middle part)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64').toString('utf-8')
    ) as JWTPayload;

    // Check expiration
    if (payload.exp * 1000 < Date.now()) {
      console.log('Token expired');
      return null;
    }

    return payload;
  } catch (error) {
    console.error('Token validation error:', error);
    return null;
  }
}

// Get user ID from request
export function getUserId(event: HandlerEvent): string | null {
  const payload = validateToken(event);
  return payload?.sub || null;
}

// Get user email from request
export function getUserEmail(event: HandlerEvent): string | null {
  const payload = validateToken(event);
  return payload?.email || null;
}

// Standard CORS headers
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json'
};

// Unauthorized response
export function unauthorizedResponse() {
  return {
    statusCode: 401,
    headers: corsHeaders,
    body: JSON.stringify({ error: 'Unauthorized' })
  };
}

// Error response
export function errorResponse(message: string, statusCode: number = 400) {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify({ error: message })
  };
}

// Success response
export function successResponse(data: any, statusCode: number = 200) {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(data)
  };
}
