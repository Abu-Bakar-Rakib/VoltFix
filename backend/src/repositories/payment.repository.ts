import { prisma, getIsDbConnected } from '../config/db';
import { mockStore } from './mockStore';

export class PaymentRepository {
  async findByIdempotencyKey(key: string) {
    if (getIsDbConnected()) {
      return prisma.payment.findUnique({
        where: { idempotencyKey: key },
      });
    }
    return mockStore.payments.find((p) => p.idempotencyKey === key) || null;
  }

  async createPayment(data: {
    bookingId: string;
    invoiceId?: string;
    customerId: string;
    amount: number;
    currency?: string;
    method: 'CASH' | 'ONLINE_SANDBOX' | 'CARD' | 'WALLET';
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
    transactionId?: string;
    idempotencyKey?: string;
    receiptUrl?: string;
  }) {
    if (getIsDbConnected()) {
      return prisma.$transaction(async (tx) => {
        const payment = await tx.payment.create({
          data: {
            ...data,
            currency: data.currency || 'USD',
          },
        });

        if (data.invoiceId && data.status === 'COMPLETED') {
          await tx.invoice.update({
            where: { id: data.invoiceId },
            data: { status: 'PAID' },
          });
        }

        return payment;
      });
    }

    const newPayment = {
      id: `pay-${Date.now()}`,
      currency: 'USD',
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockStore.payments.push(newPayment);

    if (data.invoiceId && data.status === 'COMPLETED') {
      const invIdx = mockStore.invoices.findIndex((i) => i.id === data.invoiceId);
      if (invIdx !== -1) {
        mockStore.invoices[invIdx].status = 'PAID';
        mockStore.invoices[invIdx].updatedAt = new Date();
      }
    }

    return newPayment;
  }

  async getElectricianEarnings(electricianId: string) {
    if (getIsDbConnected()) {
      const invoices = await prisma.invoice.findMany({
        where: { electricianId, status: 'PAID' },
        include: { payments: true },
      });

      const totalGross = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
      const totalNet = invoices.reduce(
        (sum, inv) => sum + (inv.laborCost + inv.partsCost),
        0
      );
      const platformFees = invoices.reduce((sum, inv) => sum + inv.platformFee, 0);

      return {
        totalGross,
        totalNet,
        platformFees,
        completedPayouts: invoices.length,
        invoices,
      };
    }

    const invoices = mockStore.invoices.filter(
      (i) => i.electricianId === electricianId && i.status === 'PAID'
    );
    const totalGross = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalNet = invoices.reduce(
      (sum, inv) => sum + (inv.laborCost + inv.partsCost),
      0
    );
    const platformFees = invoices.reduce((sum, inv) => sum + (inv.platformFee || 0), 0);

    return {
      totalGross,
      totalNet,
      platformFees,
      completedPayouts: invoices.length,
      invoices,
    };
  }
}

export const paymentRepository = new PaymentRepository();
