import crypto from 'crypto';
import { userRepository } from '../repositories/user.repository';
import { electricianRepository } from '../repositories/electrician.repository';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { logger } from '../config/logger';

export class AuthService {
  async register(data: any) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      const error: any = new Error('An account with this email already exists.');
      error.statusCode = 409;
      error.isOperational = true;
      throw error;
    }

    const hashedPassword = await hashPassword(data.password);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await userRepository.create({
      name: data.name,
      email: data.email.toLowerCase(),
      password: hashedPassword,
      phone: data.phone,
      role: data.role,
      isVerified: false,
      verificationToken,
      avatarUrl: data.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`,
    });

    let electricianProfile = null;
    if (data.role === 'ELECTRICIAN') {
      electricianProfile = await electricianRepository.createProfile({
        userId: user.id,
        bio: data.bio || 'Professional licensed electrician',
        experienceYears: data.experienceYears || 1,
        skills: data.skills || ['General Electrical Repairs'],
        serviceRadiusKm: data.serviceRadiusKm || 15.0,
        latitude: data.latitude || 23.8103,
        longitude: data.longitude || 90.4125,
        addressText: data.addressText || 'Dhaka Central',
        city: data.city || 'Dhaka',
        hourlyRate: data.hourlyRate || 30.0,
        verificationStatus: 'PENDING',
      });
    }

    logger.info({ userId: user.id, email: user.email, role: user.role }, 'New user registered');

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      electricianProfileId: electricianProfile?.id,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    const { password, verificationToken: _, ...userSafe } = user;
    return {
      user: {
        ...userSafe,
        electricianProfile,
      },
      accessToken,
      refreshToken,
      verificationToken, // Returned for sandbox convenience
    };
  }

  async login(email: string, plainPass: string) {
    const user = await userRepository.findByEmail(email.toLowerCase());
    if (!user) {
      const error: any = new Error('Invalid email or password.');
      error.statusCode = 401;
      error.isOperational = true;
      throw error;
    }

    if (!user.isActive) {
      const error: any = new Error('Account has been deactivated. Please contact support.');
      error.statusCode = 403;
      error.isOperational = true;
      throw error;
    }

    const isMatch = await comparePassword(plainPass, user.password);
    if (!isMatch) {
      const error: any = new Error('Invalid email or password.');
      error.statusCode = 401;
      error.isOperational = true;
      throw error;
    }

    let electricianProfileId: string | undefined;
    if (user.role === 'ELECTRICIAN') {
      const profile = await electricianRepository.findByUserId(user.id);
      electricianProfileId = profile?.id;
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      electricianProfileId,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    logger.info({ userId: user.id, role: user.role }, 'User logged in successfully');

    const { password, ...userSafe } = user;
    return {
      user: userSafe,
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(currentToken: string) {
    try {
      const payload = verifyRefreshToken(currentToken);
      const user = await userRepository.findById(payload.userId);
      if (!user || !user.isActive) {
        throw new Error('User inactive or invalid');
      }

      let electricianProfileId: string | undefined;
      if (user.role === 'ELECTRICIAN') {
        const profile = await electricianRepository.findByUserId(user.id);
        electricianProfileId = profile?.id;
      }

      const newTokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        electricianProfileId,
      };

      const newAccessToken = generateAccessToken(newTokenPayload);
      const newRefreshToken = generateRefreshToken(newTokenPayload);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch {
      const error: any = new Error('Invalid or expired refresh token. Please log in again.');
      error.statusCode = 401;
      error.isOperational = true;
      throw error;
    }
  }

  async forgotPassword(email: string) {
    const user = await userRepository.findByEmail(email.toLowerCase());
    if (!user) {
      // Return true to avoid user enumeration
      return { sent: true };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await userRepository.update(user.id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetExpires,
    });

    logger.info({ email, resetToken }, 'Password reset token generated');
    return { sent: true, resetToken };
  }

  async resetPassword(token: string, newPass: string) {
    const user = await userRepository.findByResetToken(token);
    if (!user) {
      const error: any = new Error('Invalid or expired reset token.');
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    const hashedPassword = await hashPassword(newPass);
    await userRepository.update(user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    logger.info({ userId: user.id }, 'Password reset successfully');
    return { success: true };
  }

  async verifyEmail(token: string) {
    if (userRepository) {
      const user = (await userRepository.findAllUsers({ page: 1, limit: 100 })).users.find(
        (u: any) => u.verificationToken === token
      );
      if (!user) {
        const error: any = new Error('Invalid or expired email verification token.');
        error.statusCode = 400;
        error.isOperational = true;
        throw error;
      }

      await userRepository.update(user.id, {
        isVerified: true,
        verificationToken: null,
      });

      return { success: true, message: 'Email verified successfully!' };
    }
  }
}

export const authService = new AuthService();
