import { prisma, getIsDbConnected } from '../config/db';
import { mockStore } from './mockStore';

export class AdminRepository {
  async getDashboardAnalytics() {
    if (getIsDbConnected()) {
      const [
        totalUsers,
        totalCustomers,
        totalElectricians,
        pendingVerifications,
        totalBookings,
        completedBookings,
        paidInvoices,
        openDisputes,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: 'CUSTOMER' } }),
        prisma.user.count({ where: { role: 'ELECTRICIAN' } }),
        prisma.electricianProfile.count({ where: { verificationStatus: 'PENDING' } }),
        prisma.booking.count(),
        prisma.booking.count({ where: { status: 'COMPLETED' } }),
        prisma.invoice.findMany({ where: { status: 'PAID' } }),
        prisma.dispute.count({ where: { status: 'OPEN' } }),
      ]);

      const gmv = paidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
      const platformRevenue = paidInvoices.reduce((sum, inv) => sum + inv.platformFee, 0);

      return {
        totalUsers,
        totalCustomers,
        totalElectricians,
        pendingVerifications,
        totalBookings,
        completedBookings,
        gmv,
        platformRevenue,
        openDisputes,
      };
    }

    const totalUsers = mockStore.users.length;
    const totalCustomers = mockStore.users.filter((u) => u.role === 'CUSTOMER').length;
    const totalElectricians = mockStore.users.filter((u) => u.role === 'ELECTRICIAN').length;
    const pendingVerifications = mockStore.electricianProfiles.filter(
      (p) => p.verificationStatus === 'PENDING'
    ).length;
    const totalBookings = mockStore.bookings.length;
    const completedBookings = mockStore.bookings.filter(
      (b) => b.status === 'COMPLETED'
    ).length;
    const paidInvoices = mockStore.invoices.filter((i) => i.status === 'PAID');
    const gmv = paidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const platformRevenue = paidInvoices.reduce(
      (sum, inv) => sum + (inv.platformFee || 0),
      0
    );
    const openDisputes = mockStore.disputes.filter((d) => d.status === 'OPEN').length;

    return {
      totalUsers,
      totalCustomers,
      totalElectricians,
      pendingVerifications,
      totalBookings,
      completedBookings,
      gmv,
      platformRevenue,
      openDisputes,
    };
  }

  async createAuditLog(data: {
    userId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    if (getIsDbConnected()) {
      return prisma.auditLog.create({ data });
    }
    const log = {
      id: `audit-${Date.now()}`,
      ...data,
      createdAt: new Date(),
    };
    mockStore.auditLogs.unshift(log);
    return log;
  }

  async getAuditLogs(page = 1, limit = 50) {
    if (getIsDbConnected()) {
      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: { user: true },
        }),
        prisma.auditLog.count(),
      ]);
      return { logs, total };
    }

    const total = mockStore.auditLogs.length;
    const logs = mockStore.auditLogs.slice((page - 1) * limit, page * limit).map((l) => ({
      ...l,
      user: l.userId ? mockStore.users.find((u) => u.id === l.userId) : null,
    }));
    return { logs, total };
  }

  async getDisputes(status?: string) {
    if (getIsDbConnected()) {
      return prisma.dispute.findMany({
        where: status ? { status: status as any } : undefined,
        include: {
          booking: {
            include: { customer: true, electrician: { include: { user: true } } },
          },
          raisedBy: true,
          resolvedBy: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    let list = mockStore.disputes;
    if (status) list = list.filter((d) => d.status === status);
    return list.map((d) => {
      const booking = mockStore.bookings.find((b) => b.id === d.bookingId);
      const raisedBy = mockStore.users.find((u) => u.id === d.raisedByUserId);
      const resolvedBy = d.resolvedByUserId
        ? mockStore.users.find((u) => u.id === d.resolvedByUserId)
        : null;
      return { ...d, booking, raisedBy, resolvedBy };
    });
  }

  async resolveDispute(
    disputeId: string,
    resolution: string,
    resolvedByUserId: string,
    status: 'RESOLVED' | 'REJECTED'
  ) {
    if (getIsDbConnected()) {
      return prisma.dispute.update({
        where: { id: disputeId },
        data: {
          resolution,
          resolvedByUserId,
          status,
          resolvedAt: new Date(),
        },
      });
    }

    const idx = mockStore.disputes.findIndex((d) => d.id === disputeId);
    if (idx === -1) return null;
    mockStore.disputes[idx] = {
      ...mockStore.disputes[idx],
      resolution,
      resolvedByUserId,
      status,
      resolvedAt: new Date(),
      updatedAt: new Date(),
    };
    return mockStore.disputes[idx];
  }

  async createDispute(data: {
    bookingId: string;
    raisedByUserId: string;
    reason: string;
    evidencePhotos?: string[];
  }) {
    if (getIsDbConnected()) {
      return prisma.dispute.create({
        data: {
          ...data,
          status: 'OPEN',
        },
      });
    }

    const dispute = {
      id: `disp-${Date.now()}`,
      ...data,
      status: 'OPEN',
      resolution: null,
      resolvedByUserId: null,
      resolvedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockStore.disputes.unshift(dispute);
    return dispute;
  }
}

export const adminRepository = new AdminRepository();
