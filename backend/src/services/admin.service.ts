import { adminRepository } from '../repositories/admin.repository';
import { electricianRepository } from '../repositories/electrician.repository';
import { userRepository } from '../repositories/user.repository';
import { notificationRepository } from '../repositories/notification.repository';

export class AdminService {
  async getDashboardAnalytics() {
    return adminRepository.getDashboardAnalytics();
  }

  async getAllUsers(params: any) {
    return userRepository.findAllUsers(params);
  }

  async toggleUserStatus(userId: string, isActive: boolean, adminUserId: string) {
    const updated = await userRepository.update(userId, { isActive });
    await adminRepository.createAuditLog({
      userId: adminUserId,
      action: isActive ? 'USER_ACTIVATED' : 'USER_SUSPENDED',
      entityType: 'USER',
      entityId: userId,
      details: { isActive },
    });
    return updated;
  }

  async getVerificationQueue(status?: string) {
    return electricianRepository.getVerificationQueue(status);
  }

  async reviewVerification(
    profileId: string,
    status: 'APPROVED' | 'REJECTED',
    adminUserId: string,
    rejectionReason?: string
  ) {
    const profile = await electricianRepository.findById(profileId);
    if (!profile) {
      const error: any = new Error('Electrician profile not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    const updated = await electricianRepository.updateVerificationStatus(
      profileId,
      status,
      rejectionReason
    );

    // Audit log
    await adminRepository.createAuditLog({
      userId: adminUserId,
      action: `ELECTRICIAN_${status}`,
      entityType: 'ELECTRICIAN_PROFILE',
      entityId: profileId,
      details: { status, rejectionReason },
    });

    // Notify electrician
    if (profile.userId) {
      await notificationRepository.create({
        userId: profile.userId,
        title: `Verification Status: ${status}`,
        message:
          status === 'APPROVED'
            ? 'Congratulations! Your electrician credentials have been approved. You are now live and can receive booking requests.'
            : `Your verification request was rejected. Reason: ${rejectionReason || 'Documentation does not meet VoltFix compliance requirements.'}`,
        type: 'STATUS',
        entityId: profileId,
        entityType: 'ELECTRICIAN_PROFILE',
      });
    }

    return updated;
  }

  async getDisputes(status?: string) {
    return adminRepository.getDisputes(status);
  }

  async resolveDispute(
    disputeId: string,
    adminUserId: string,
    resolution: string,
    status: 'RESOLVED' | 'REJECTED'
  ) {
    const dispute = await adminRepository.resolveDispute(
      disputeId,
      resolution,
      adminUserId,
      status
    );

    await adminRepository.createAuditLog({
      userId: adminUserId,
      action: `DISPUTE_${status}`,
      entityType: 'DISPUTE',
      entityId: disputeId,
      details: { resolution, status },
    });

    return dispute;
  }

  async raiseDispute(
    bookingId: string,
    userId: string,
    reason: string,
    evidencePhotos?: string[]
  ) {
    return adminRepository.createDispute({
      bookingId,
      raisedByUserId: userId,
      reason,
      evidencePhotos,
    });
  }

  async getAuditLogs(page = 1, limit = 50) {
    return adminRepository.getAuditLogs(page, limit);
  }

  async updateUserAvatar(userId: string, avatarUrl: string) {
    const updated = await userRepository.update(userId, { avatarUrl });
    await adminRepository.createAuditLog({
      userId,
      action: 'ADMIN_AVATAR_UPDATED',
      entityType: 'USER',
      entityId: userId,
      details: { avatarUrl },
    });
    return updated;
  }
}

export const adminService = new AdminService();
