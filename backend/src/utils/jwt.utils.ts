import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

interface TokenUser {
  id: string;
  email: string;
  role: Role;
}

/**
 * Generate a JWT token for a user
 * @param user - User data to include in token
 * @returns JWT token string
 */
export const generateToken = (user: TokenUser): string => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const expiresInEnv = process.env.JWT_EXPIRES_IN ?? '24h';

  const options: jwt.SignOptions = {
    expiresIn: expiresInEnv as jwt.SignOptions['expiresIn'],
  };

  return jwt.sign(payload, process.env.JWT_SECRET as string, options);
};

/**
 * Verify and decode a JWT token
 * @param token - JWT token to verify
 * @returns Decoded token payload or null if invalid
 */
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET as string);
  } catch (error) {
    return null;
  }
};
