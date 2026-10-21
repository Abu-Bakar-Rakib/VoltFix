import { prisma, getIsDbConnected } from '../config/db';
import { mockStore } from './mockStore';

export class QuoteRepository {
  async createQuote(data: {
    bookingId: string;
    electricianId: string;
    estimatedPrice: number;
    laborCost?: number;
    partsCost?: number;
    estimatedDurationMin?: number;
    note?: string;
  }) {
    if (getIsDbConnected()) {
      return prisma.quote.create({
        data: {
          ...data,
          status: 'PENDING',
        },
        include: { electrician: { include: { user: true } } },
      });
    }

    const newQuote = {
      id: `quote-${Date.now()}`,
      ...data,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockStore.quotes.push(newQuote);

    const elec = mockStore.electricianProfiles.find((p) => p.id === data.electricianId);
    const elecUser = elec ? mockStore.users.find((u) => u.id === elec.userId) : null;
    return {
      ...newQuote,
      electrician: elec ? { ...elec, user: elecUser } : null,
    };
  }

  async findById(id: string) {
    if (getIsDbConnected()) {
      return prisma.quote.findUnique({
        where: { id },
        include: { booking: true, electrician: { include: { user: true } } },
      });
    }

    const q = mockStore.quotes.find((item) => item.id === id);
    if (!q) return null;
    const booking = mockStore.bookings.find((b) => b.id === q.bookingId);
    const elec = mockStore.electricianProfiles.find((p) => p.id === q.electricianId);
    const elecUser = elec ? mockStore.users.find((u) => u.id === elec.userId) : null;
    return { ...q, booking, electrician: elec ? { ...elec, user: elecUser } : null };
  }

  async acceptQuote(quoteId: string, bookingId: string, electricianId: string) {
    if (getIsDbConnected()) {
      return prisma.$transaction(async (tx) => {
        // Accept chosen quote
        await tx.quote.update({
          where: { id: quoteId },
          data: { status: 'ACCEPTED' },
        });

        // Reject others
        await tx.quote.updateMany({
          where: { bookingId, id: { not: quoteId } },
          data: { status: 'REJECTED' },
        });

        // Assign electrician to booking and set status to ACCEPTED
        return tx.booking.update({
          where: { id: bookingId },
          data: {
            electricianId,
            status: 'ACCEPTED',
          },
        });
      });
    }

    // Mock store implementation
    mockStore.quotes.forEach((q) => {
      if (q.bookingId === bookingId) {
        q.status = q.id === quoteId ? 'ACCEPTED' : 'REJECTED';
        q.updatedAt = new Date();
      }
    });

    const bIdx = mockStore.bookings.findIndex((b) => b.id === bookingId);
    if (bIdx !== -1) {
      mockStore.bookings[bIdx].electricianId = electricianId;
      mockStore.bookings[bIdx].status = 'ACCEPTED';
      mockStore.bookings[bIdx].updatedAt = new Date();
    }

    return mockStore.bookings[bIdx];
  }
}

export const quoteRepository = new QuoteRepository();
