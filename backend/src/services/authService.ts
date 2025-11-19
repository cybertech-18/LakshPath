import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

import env from '@config/env';
import prisma from '@lib/prisma';
import { AppError } from '@middleware/errorHandler';
import { emailService } from './emailService';

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);
const TOKEN_EXPIRY = '7d';

type JwtPayload = {
  sub: string;
  email?: string | null;
};

const createToken = (payload: JwtPayload) => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
};

const logLogin = async (
  userId: string,
  method: 'GOOGLE' | 'EMAIL' | 'DEMO',
  success: boolean,
  ipAddress?: string,
  userAgent?: string,
  failReason?: string
) => {
  try {
    await prisma.loginLog.create({
      data: {
        userId,
        method,
        success,
        ipAddress,
        userAgent,
        failReason,
      },
    });

    // Update user's last login and increment login count if successful
    if (success) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          lastLoginAt: new Date(),
          loginCount: { increment: 1 },
        },
      });
    }
  } catch (error) {
    console.error('Failed to log login:', error);
    // Don't throw error - logging failure shouldn't block login
  }
};

export const authService = {
  async signInWithGoogle(credential: string, ipAddress?: string, userAgent?: string) {
    if (!credential) {
      throw new AppError('Missing Google credential', 400);
    }

    let ticketPayload: Record<string, any> | undefined = undefined;
    let userId: string | null = null;

    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: env.GOOGLE_CLIENT_ID,
      });

      ticketPayload = ticket.getPayload() ?? undefined;
    } catch (error) {
      console.error('Google token verification failed', error);
      throw new AppError('Invalid Google credential', 401);
    }

    if (!ticketPayload?.email) {
      throw new AppError('Google account is missing a verified email', 400);
    }

    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: ticketPayload.email },
      });

      const isNewUser = !existingUser;

      const user = await prisma.user.upsert({
        where: { email: ticketPayload.email },
        update: {
          name: ticketPayload.name ?? undefined,
          avatarUrl: ticketPayload.picture ?? undefined,
          googleId: ticketPayload.sub,
        },
        create: {
          email: ticketPayload.email,
          name: ticketPayload.name ?? ticketPayload.email.split('@')[0],
          avatarUrl: ticketPayload.picture,
          googleId: ticketPayload.sub,
        },
      });

      userId = user.id;

      // Log successful login
      await logLogin(user.id, 'GOOGLE', true, ipAddress, userAgent);

      // Send emails only if enabled and user has email
      if (user.email) {
        try {
          if (isNewUser && env.EMAIL_ENABLED) {
            emailService.sendWelcomeEmail(user.name || 'User', user.email).catch(err => {
              console.error('Failed to send welcome email:', err);
            });
          } else if (!isNewUser && env.EMAIL_ENABLED) {
            emailService.sendLoginAlert(user.name || 'User', user.email, {
              method: 'Google OAuth',
              ipAddress,
              timestamp: new Date(),
            }).catch(err => {
              console.error('Failed to send login alert:', err);
            });
          }
        } catch (emailError) {
          // Email errors should not block login
          console.error('Email service error:', emailError);
        }
      }

      const token = createToken({ sub: user.id, email: user.email });

      return {
        token,
        user,
        isNewUser,
      };
    } catch (error) {
      if (userId) {
        await logLogin(userId, 'GOOGLE', false, ipAddress, userAgent, (error as Error).message);
      }
      throw error;
    }
  },

  async signInAsDemoUser(ipAddress?: string, userAgent?: string) {
    const email = 'demo@lakshpath.ai';
    
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: 'Demo Explorer',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
        googleId: 'demo-google-id',
      },
    });

    // Log demo login
    await logLogin(user.id, 'DEMO', true, ipAddress, userAgent);

    const token = createToken({ sub: user.id, email: user.email });

    return {
      token,
      user,
    };
  },

  async getCurrentUser(userId: string) {
    if (!userId) {
      throw new AppError('Missing user id', 400);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  },
};
