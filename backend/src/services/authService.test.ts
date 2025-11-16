
import { authService } from './authService';
import { prismaMock } from '@lib/prisma-mock';
import { AppError } from '@middleware/errorHandler';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

jest.mock('@config/env', () => jest.requireActual('@config/env-mock'));
jest.mock('google-auth-library');
jest.mock('jsonwebtoken');

describe('authService', () => {
  const mockedGoogleClient = new OAuth2Client();
  const mockedJwt = jwt;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signInWithGoogle', () => {
    it('should return a token and user when given a valid credential', async () => {
      const mockTicket = {
        getPayload: () => ({
          email: 'test@example.com',
          name: 'Test User',
          picture: 'https://example.com/avatar.png',
          sub: '12345',
        }),
      };
      (mockedGoogleClient.verifyIdToken as jest.Mock).mockResolvedValue(mockTicket);
      (mockedJwt.sign as jest.Mock).mockReturnValue('mocked-token');
      prismaMock.user.upsert.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        avatarUrl: 'https://example.com/avatar.png',
        googleId: '12345',
        role: 'USER',
        passwordHash: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await authService.signInWithGoogle('valid-credential');

      expect(result.token).toBe('mocked-token');
      expect(result.user.email).toBe('test@example.com');
      expect(prismaMock.user.upsert).toHaveBeenCalled();
    });

    it('should throw an error if the credential is not provided', async () => {
        await expect(authService.signInWithGoogle('')).rejects.toThrow(
          new AppError('Missing Google credential', 400)
        );
      });

      it('should throw an error if the Google token is invalid', async () => {
        (mockedGoogleClient.verifyIdToken as jest.Mock).mockRejectedValue(new Error('Invalid token'));

        await expect(authService.signInWithGoogle('invalid-credential')).rejects.toThrow(
          new AppError('Invalid Google credential', 401)
        );
      });

      it('should throw an error if the Google account is missing a verified email', async () => {
        const mockTicket = {
          getPayload: () => ({
            name: 'Test User',
            picture: 'https://example.com/avatar.png',
            sub: '12345',
          }),
        };
        (mockedGoogleClient.verifyIdToken as jest.Mock).mockResolvedValue(mockTicket);

        await expect(authService.signInWithGoogle('valid-credential')).rejects.toThrow(
          new AppError('Google account is missing a verified email', 400)
        );
      });
    });

    describe('getCurrentUser', () => {
      it('should return the current user when given a valid user id', async () => {
        const mockUser = {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
          avatarUrl: 'https://example.com/avatar.png',
          googleId: '12345',
          role: 'USER',
          passwordHash: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        prismaMock.user.findUnique.mockResolvedValue(mockUser);

        const result = await authService.getCurrentUser('user-1');

        expect(result).toEqual(mockUser);
        expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { id: 'user-1' } });
      });

      it('should throw an error if the user is not found', async () => {
        prismaMock.user.findUnique.mockResolvedValue(null);

        await expect(authService.getCurrentUser('non-existent-user')).rejects.toThrow(
          new AppError('User not found', 404)
        );
      });

      it('should throw an error if the user id is not provided', async () => {
        await expect(authService.getCurrentUser('')).rejects.toThrow(new AppError('Missing user id', 400));
      });
    });
  });
