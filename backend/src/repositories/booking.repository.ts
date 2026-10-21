import { prisma, getIsDbConnected } from '../config/db';
import { mockStore } from './mockStore';

export class BookingRepository {
  /**
   * Conflict check: finds any active booking overlapping with the proposed time window
   * for the same electrician.
   */
  async findConflictingBooking(
    electricianId: string,
    scheduledAt: Date,
    durationMin: number,
    excludeBookingId?: string
  ) {
    const proposedStart = new Date(scheduledAt).getTime();
    const proposedEnd = proposedStart + durationMin * 60 * 1000;
    const activeStatuses = ['PENDING', 'ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS'];

    if (getIsDbConnected()) {
      const bookings = await prisma.booking.findMany({
        where: {
          electricianId,
          id: excludeBookingId ? { not: excludeBookingId } : undefined,
          status: { in: activeStatuses as any },
        },
      });

      return bookings.find((b) => {
        const bStart = new Date(b.scheduledAt).getTime();
        const bEnd = bStart + b.estimatedDurationMin * 60 * 1000;
        // Overlap condition: startA < endB and endA > startB
        return proposedStart < bEnd && proposedEnd > bStart;
      });
    }

    const bookings = mockStore.bookings.filter(
      (b) =>
        b.electricianId === electricianId &&
        b.id !== excludeBookingId &&
        activeStatuses.includes(b.status)
    );

    return bookings.find((b) => {
      const bStart = new Date(b.scheduledAt).getTime();
      const bEnd = bStart + b.estimatedDurationMin * 60 * 1000;
      return proposedStart < bEnd && proposedEnd > bStart;
    });
  }

  async findById(id: string) {
    if (getIsDbConnected()) {
      return prisma.booking.findUnique({
        where: { id },
        include: {
          customer: true,
          electrician: { include: { user: true } },
          service: true,
          category: true,
          photos: true,
          statusHistory: {
            include: { changedBy: true },
            orderBy: { createdAt: 'desc' },
          },
          invoice: true,
          payments: true,
          review: true,
          quotes: { include: { electrician: { include: { user: true } } } },
        },
      });
    }

    const b = mockStore.bookings.find((item) => item.id === id);
    if (!b) return null;

    const customer = mockStore.users.find((u) => u.id === b.customerId);
    const electrician = b.electricianId
      ? mockStore.electricianProfiles.find((p) => p.id === b.electricianId)
      : null;
    const electricianUser = electrician
      ? mockStore.users.find((u) => u.id === electrician.userId)
      : null;
    const service = b.serviceId
      ? mockStore.services.find((s) => s.id === b.serviceId)
      : null;
    const category = b.categoryId
      ? mockStore.categories.find((c) => c.id === b.categoryId)
      : null;
    const photos = mockStore.bookingPhotos.filter((p) => p.bookingId === b.id);
    const statusHistory = mockStore.bookingStatusHistories
      .filter((h) => h.bookingId === b.id)
      .map((h) => ({
        ...h,
        changedBy: mockStore.users.find((u) => u.id === h.changedByUserId),
      }));
    const invoice = mockStore.invoices.find((inv) => inv.bookingId === b.id) || null;
    const payments = mockStore.payments.filter((p) => p.bookingId === b.id);
    const review = mockStore.reviews.find((r) => r.bookingId === b.id) || null;
    const quotes = mockStore.quotes
      .filter((q) => q.bookingId === b.id)
      .map((q) => {
        const elec = mockStore.electricianProfiles.find((p) => p.id === q.electricianId);
        const elecUser = elec ? mockStore.users.find((u) => u.id === elec.userId) : null;
        return {
          ...q,
          electrician: elec ? { ...elec, user: elecUser } : null,
        };
      });

    return {
      ...b,
      customer,
      electrician: electrician ? { ...electrician, user: electricianUser } : null,
      service,
      category,
      photos,
      statusHistory,
      invoice,
      payments,
      review,
      quotes,
    };
  }

  async createDirectBooking(data: any, photos: string[] = []) {
    const bookingNumber = `VF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (getIsDbConnected()) {
      return prisma.$transaction(async (tx) => {
        const booking = await tx.booking.create({
          data: {
            ...data,
            bookingNumber,
            type: 'DIRECT',
            status: 'PENDING',
          },
        });

        if (photos.length > 0) {
          await tx.bookingPhoto.createMany({
            data: photos.map((url) => ({ bookingId: booking.id, photoUrl: url })),
          });
        }

        await tx.bookingStatusHistory.create({
          data: {
            bookingId: booking.id,
            fromStatus: null,
            toStatus: 'PENDING',
            changedByUserId: data.customerId,
            reason: 'Booking requested by customer',
          },
        });

        return booking;
      });
    }

    const newBooking = {
      id: `book-${Date.now()}`,
      bookingNumber,
      type: 'DIRECT',
      status: 'PENDING',
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockStore.bookings.push(newBooking);

    if (photos.length > 0) {
      photos.forEach((url) => {
        mockStore.bookingPhotos.push({
          id: `photo-${Date.now()}-${Math.random()}`,
          bookingId: newBooking.id,
          photoUrl: url,
          createdAt: new Date(),
        });
      });
    }

    mockStore.bookingStatusHistories.push({
      id: `hist-${Date.now()}`,
      bookingId: newBooking.id,
      fromStatus: null,
      toStatus: 'PENDING',
      changedByUserId: data.customerId,
      reason: 'Booking requested by customer',
      createdAt: new Date(),
    });

    return newBooking;
  }

  async createOpenRequest(data: any, photos: string[] = []) {
    const bookingNumber = `VF-OPEN-${Math.floor(1000 + Math.random() * 9000)}`;

    if (getIsDbConnected()) {
      return prisma.$transaction(async (tx) => {
        const booking = await tx.booking.create({
          data: {
            ...data,
            bookingNumber,
            type: 'OPEN_REQUEST',
            status: 'PENDING',
            electricianId: null,
          },
        });

        if (photos.length > 0) {
          await tx.bookingPhoto.createMany({
            data: photos.map((url) => ({ bookingId: booking.id, photoUrl: url })),
          });
        }

        await tx.bookingStatusHistory.create({
          data: {
            bookingId: booking.id,
            fromStatus: null,
            toStatus: 'PENDING',
            changedByUserId: data.customerId,
            reason: 'Open request posted to local verified electricians',
          },
        });

        return booking;
      });
    }

    const newBooking = {
      id: `book-open-${Date.now()}`,
      bookingNumber,
      type: 'OPEN_REQUEST',
      status: 'PENDING',
      electricianId: null,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockStore.bookings.push(newBooking);

    if (photos.length > 0) {
      photos.forEach((url) => {
        mockStore.bookingPhotos.push({
          id: `photo-${Date.now()}-${Math.random()}`,
          bookingId: newBooking.id,
          photoUrl: url,
          createdAt: new Date(),
        });
      });
    }

    mockStore.bookingStatusHistories.push({
      id: `hist-${Date.now()}`,
      bookingId: newBooking.id,
      fromStatus: null,
      toStatus: 'PENDING',
      changedByUserId: data.customerId,
      reason: 'Open request posted to local verified electricians',
      createdAt: new Date(),
    });

    return newBooking;
  }

  async updateStatusWithHistory(
    bookingId: string,
    toStatus: string,
    changedByUserId: string,
    reason?: string,
    additionalUpdates: any = {}
  ) {
    if (getIsDbConnected()) {
      return prisma.$transaction(async (tx) => {
        const current = await tx.booking.findUnique({ where: { id: bookingId } });
        if (!current) throw new Error('Booking not found');

        const updated = await tx.booking.update({
          where: { id: bookingId },
          data: {
            status: toStatus as any,
            ...additionalUpdates,
          },
        });

        await tx.bookingStatusHistory.create({
          data: {
            bookingId,
            fromStatus: current.status,
            toStatus: toStatus as any,
            changedByUserId,
            reason,
          },
        });

        return updated;
      });
    }

    const idx = mockStore.bookings.findIndex((b) => b.id === bookingId);
    if (idx === -1) throw new Error('Booking not found');

    const current = mockStore.bookings[idx];
    const fromStatus = current.status;

    mockStore.bookings[idx] = {
      ...current,
      status: toStatus,
      ...additionalUpdates,
      updatedAt: new Date(),
    };

    mockStore.bookingStatusHistories.push({
      id: `hist-${Date.now()}`,
      bookingId,
      fromStatus,
      toStatus,
      changedByUserId,
      reason,
      createdAt: new Date(),
    });

    return mockStore.bookings[idx];
  }

  async findCustomerBookings(customerId: string) {
    if (getIsDbConnected()) {
      return prisma.booking.findMany({
        where: { customerId },
        include: {
          electrician: { include: { user: true } },
          service: true,
          invoice: true,
          review: true,
        },
        orderBy: { scheduledAt: 'desc' },
      });
    }

    return mockStore.bookings
      .filter((b) => b.customerId === customerId)
      .map((b) => {
        const elec = b.electricianId
          ? mockStore.electricianProfiles.find((p) => p.id === b.electricianId)
          : null;
        const elecUser = elec ? mockStore.users.find((u) => u.id === elec.userId) : null;
        const srv = b.serviceId ? mockStore.services.find((s) => s.id === b.serviceId) : null;
        const inv = mockStore.invoices.find((i) => i.bookingId === b.id);
        const rev = mockStore.reviews.find((r) => r.bookingId === b.id);
        return {
          ...b,
          electrician: elec ? { ...elec, user: elecUser } : null,
          service: srv,
          invoice: inv,
          review: rev,
        };
      })
      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
  }

  async findElectricianBookings(electricianId: string) {
    if (getIsDbConnected()) {
      return prisma.booking.findMany({
        where: { electricianId },
        include: {
          customer: true,
          service: true,
          invoice: true,
          review: true,
        },
        orderBy: { scheduledAt: 'desc' },
      });
    }

    return mockStore.bookings
      .filter((b) => b.electricianId === electricianId)
      .map((b) => {
        const customer = mockStore.users.find((u) => u.id === b.customerId);
        const srv = b.serviceId ? mockStore.services.find((s) => s.id === b.serviceId) : null;
        const inv = mockStore.invoices.find((i) => i.bookingId === b.id);
        const rev = mockStore.reviews.find((r) => r.bookingId === b.id);
        return {
          ...b,
          customer,
          service: srv,
          invoice: inv,
          review: rev,
        };
      })
      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
  }

  async findOpenRequests() {
    if (getIsDbConnected()) {
      return prisma.booking.findMany({
        where: {
          type: 'OPEN_REQUEST',
          status: 'PENDING',
        },
        include: {
          customer: true,
          category: true,
          quotes: { include: { electrician: { include: { user: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return mockStore.bookings
      .filter((b) => b.type === 'OPEN_REQUEST' && b.status === 'PENDING')
      .map((b) => {
        const customer = mockStore.users.find((u) => u.id === b.customerId);
        const category = b.categoryId
          ? mockStore.categories.find((c) => c.id === b.categoryId)
          : null;
        const quotes = mockStore.quotes
          .filter((q) => q.bookingId === b.id)
          .map((q) => {
            const elec = mockStore.electricianProfiles.find((p) => p.id === q.electricianId);
            const elecUser = elec ? mockStore.users.find((u) => u.id === elec.userId) : null;
            return { ...q, electrician: elec ? { ...elec, user: elecUser } : null };
          });
        return { ...b, customer, category, quotes };
      });
  }

  async rescheduleBooking(bookingId: string, newScheduledAt: Date, userId: string, reason?: string) {
    return this.updateStatusWithHistory(
      bookingId,
      'PENDING',
      userId,
      reason ? `Rescheduled to ${newScheduledAt.toISOString()}: ${reason}` : `Rescheduled to ${newScheduledAt.toISOString()}`,
      { scheduledAt: newScheduledAt }
    );
  }
}

export const bookingRepository = new BookingRepository();
