import { bookingRepository } from '../repositories/booking.repository';
import { electricianRepository } from '../repositories/electrician.repository';
import { notificationRepository } from '../repositories/notification.repository';
import { applyBookingPrivacyMask } from '../middlewares/auth.middleware';

export class BookingService {
  async createDirectBooking(customerId: string, data: any) {
    const { electricianId, scheduledAt, estimatedDurationMin = 60, photos = [] } = data;

    // 1. Verify electrician exists and is approved
    const profile = await electricianRepository.findById(electricianId);
    if (!profile) {
      const error: any = new Error('Electrician not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }
    if (profile.verificationStatus !== 'APPROVED') {
      const error: any = new Error('Selected electrician is not currently verified to accept bookings.');
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    // 2. Double-booking conflict check
    const scheduledDate = new Date(scheduledAt);
    if (scheduledDate.getTime() < Date.now() - 5 * 60 * 1000) {
      const error: any = new Error('Scheduled booking time must be in the future.');
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    const conflict = await bookingRepository.findConflictingBooking(
      electricianId,
      scheduledDate,
      estimatedDurationMin
    );

    if (conflict) {
      const error: any = new Error(
        'The electrician already has a confirmed booking during this time slot. Please choose another time.'
      );
      error.statusCode = 409;
      error.isOperational = true;
      throw error;
    }

    // 3. Create booking
    const booking = await bookingRepository.createDirectBooking(
      {
        customerId,
        electricianId,
        serviceId: data.serviceId,
        categoryId: data.categoryId,
        problemDescription: data.problemDescription,
        scheduledAt: scheduledDate,
        estimatedDurationMin,
        isEmergency: data.isEmergency || false,
        addressStreet: data.addressStreet,
        addressCity: data.addressCity,
        addressZip: data.addressZip,
        addressLat: data.addressLat,
        addressLng: data.addressLng,
        customerPhone: data.customerPhone,
        electricianPhone: profile.user?.phone || null,
      },
      photos
    );

    // 4. Notify electrician
    if (profile.userId) {
      await notificationRepository.create({
        userId: profile.userId,
        title: 'New Booking Request',
        message: `You have received a new ${data.isEmergency ? 'EMERGENCY ' : ''}booking request: ${booking.bookingNumber}`,
        type: 'BOOKING',
        entityId: booking.id,
        entityType: 'BOOKING',
      });
    }

    return booking;
  }

  async createOpenRequest(customerId: string, data: any) {
    const scheduledDate = new Date(data.scheduledAt);
    return bookingRepository.createOpenRequest(
      {
        customerId,
        categoryId: data.categoryId,
        problemDescription: data.problemDescription,
        scheduledAt: scheduledDate,
        estimatedDurationMin: data.estimatedDurationMin || 120,
        isEmergency: data.isEmergency || false,
        addressStreet: data.addressStreet,
        addressCity: data.addressCity,
        addressZip: data.addressZip,
        addressLat: data.addressLat,
        addressLng: data.addressLng,
        customerPhone: data.customerPhone,
      },
      data.photos || []
    );
  }

  async getBookingById(bookingId: string, viewerUserId?: string, viewerRole?: string) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      const error: any = new Error('Booking not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    // Apply privacy masking for address and phone
    return applyBookingPrivacyMask(booking, viewerUserId, viewerRole);
  }

  async updateStatus(
    bookingId: string,
    toStatus: string,
    userId: string,
    userRole: string,
    reason?: string
  ) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      const error: any = new Error('Booking not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    // Role and status transition validation
    const current = booking.status;
    const isElectrician =
      userRole === 'ELECTRICIAN' &&
      booking.electrician &&
      (booking.electrician.userId === userId || booking.electricianId === userId);
    const isCustomer = userRole === 'CUSTOMER' && booking.customerId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isElectrician && !isCustomer && !isAdmin) {
      const error: any = new Error('Unauthorized to update this booking status.');
      error.statusCode = 403;
      error.isOperational = true;
      throw error;
    }

    // Electrician allowed actions
    if (toStatus === 'ACCEPTED' && !isElectrician && !isAdmin) {
      throw new Error('Only the assigned electrician or admin can accept this booking.');
    }
    if (['ON_THE_WAY', 'IN_PROGRESS', 'COMPLETED'].includes(toStatus) && !isElectrician && !isAdmin) {
      throw new Error('Only the assigned electrician can advance the job progress.');
    }

    const updated = await bookingRepository.updateStatusWithHistory(
      bookingId,
      toStatus,
      userId,
      reason
    );

    // Send notifications to counterpart
    const targetUserId = isElectrician ? booking.customerId : booking.electrician?.userId;
    if (targetUserId) {
      await notificationRepository.create({
        userId: targetUserId,
        title: `Booking Status: ${toStatus.replace(/_/g, ' ')}`,
        message: `Booking #${booking.bookingNumber} is now ${toStatus.replace(/_/g, ' ')}. ${reason ? `Note: ${reason}` : ''}`,
        type: 'STATUS',
        entityId: booking.id,
        entityType: 'BOOKING',
      });
    }

    return updated;
  }

  async cancelBooking(bookingId: string, userId: string, userRole: string, reason: string) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      const error: any = new Error('Booking not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    if (['COMPLETED', 'CANCELLED'].includes(booking.status)) {
      const error: any = new Error(`Cannot cancel a booking that is already ${booking.status}.`);
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    // Cancellation window rule check
    const scheduledTime = new Date(booking.scheduledAt).getTime();
    const now = Date.now();
    const hoursRemaining = (scheduledTime - now) / (1000 * 60 * 60);

    let cancellationNote = reason;
    if (hoursRemaining < 2 && hoursRemaining > 0) {
      cancellationNote = `[Late Cancellation (<2 hours remaining)] ${reason}`;
    }

    return this.updateStatus(bookingId, 'CANCELLED', userId, userRole, cancellationNote);
  }

  async rescheduleBooking(
    bookingId: string,
    newScheduledAt: string,
    userId: string,
    reason?: string
  ) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      const error: any = new Error('Booking not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    const scheduledDate = new Date(newScheduledAt);

    // Conflict check if electrician assigned
    if (booking.electricianId) {
      const conflict = await bookingRepository.findConflictingBooking(
        booking.electricianId,
        scheduledDate,
        booking.estimatedDurationMin || 60,
        booking.id
      );
      if (conflict) {
        const error: any = new Error(
          'Electrician is unavailable at the newly selected time. Please choose another time.'
        );
        error.statusCode = 409;
        error.isOperational = true;
        throw error;
      }
    }

    return bookingRepository.rescheduleBooking(bookingId, scheduledDate, userId, reason);
  }

  async getCustomerBookings(customerId: string) {
    return bookingRepository.findCustomerBookings(customerId);
  }

  async getElectricianBookings(electricianId: string) {
    return bookingRepository.findElectricianBookings(electricianId);
  }

  async getOpenRequests() {
    return bookingRepository.findOpenRequests();
  }
}

export const bookingService = new BookingService();
