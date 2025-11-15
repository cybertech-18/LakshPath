import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

import env from '@config/env';
import prisma from '@lib/prisma';
import { AppError } from '@middleware/errorHandler';

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);
const TOKEN_EXPIRY = '7d';

type JwtPayload = {
  sub: string;
  email?: string | null;
};

const createToken = (payload: JwtPayload) => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
};

export const authService = {
  async signInWithGoogle(credential: string) {
    if (!credential) {
      throw new AppError('Missing Google credential', 400);
    }

    let ticketPayload: Record<string, any> | undefined = undefined;

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
