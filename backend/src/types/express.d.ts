import type { User } from '@prisma/client';

declare global {
  namespace Express {
    interface UserPayload {
      id: string;
      email?: string | null;
    }

    interface Request {
      user?: UserPayload;
      currentUser?: User;
    }
  }
}

export {};
