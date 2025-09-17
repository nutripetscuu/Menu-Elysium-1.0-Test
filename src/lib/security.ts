// Security utilities and validation helpers
import { z } from 'zod';

// Rate limiting helpers
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();

  constructor(
    private maxAttempts: number = 10,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(identifier);

    if (!attempt || now > attempt.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (attempt.count >= this.maxAttempts) {
      return false;
    }

    attempt.count++;
    return true;
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential XSS vectors
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

// URL validation
export const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

// Email validation with additional security checks
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .min(5, 'Email too short')
  .max(254, 'Email too long')
  .refine(
    (email) => !email.includes('..'), // Consecutive dots
    'Invalid email format'
  )
  .refine(
    (email) => !/[<>]/.test(email), // XSS prevention
    'Invalid email format'
  );

// Password validation (for future auth implementation)
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .refine(
    (password) => /[a-z]/.test(password),
    'Password must contain lowercase letter'
  )
  .refine(
    (password) => /[A-Z]/.test(password),
    'Password must contain uppercase letter'
  )
  .refine(
    (password) => /[0-9]/.test(password),
    'Password must contain number'
  )
  .refine(
    (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
    'Password must contain special character'
  );

// Content Security Policy helpers
export const generateNonce = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
};

// CSRF token generation and validation
export class CSRFProtection {
  private static tokenLength = 32;

  static generateToken(): string {
    const array = new Uint8Array(this.tokenLength);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  static validateToken(token: string, expectedToken: string): boolean {
    if (!token || !expectedToken) return false;
    if (token.length !== expectedToken.length) return false;

    // Timing-safe comparison
    let result = 0;
    for (let i = 0; i < token.length; i++) {
      result |= token.charCodeAt(i) ^ expectedToken.charCodeAt(i);
    }
    return result === 0;
  }
}

// File upload security
export const validateFileUpload = (file: File) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
  ];

  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only images are allowed.');
  }

  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size is 5MB.');
  }

  // Check for potential malicious extensions
  const fileName = file.name.toLowerCase();
  const suspiciousExtensions = ['.php', '.jsp', '.asp', '.exe', '.bat', '.cmd'];

  if (suspiciousExtensions.some(ext => fileName.includes(ext))) {
    throw new Error('File contains suspicious content.');
  }

  return true;
};

// SQL injection prevention helpers
export const escapeString = (str: string): string => {
  return str.replace(/'/g, "''").replace(/;/g, '\\;');
};

// Header security
export const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
} as const;

// IP validation
export const isValidIP = (ip: string): boolean => {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
};