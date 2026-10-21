import { prisma, getIsDbConnected } from '../config/db';
import { mockStore } from './mockStore';

export class InvoiceRepository {
  async findByBookingId(bookingId: string) {
    if (getIsDbConnected()) {
      return prisma.invoice.findUnique({
        where: { bookingId },
        include: { payments: true, customer: true, electrician: { include: { user: true } } },
      });
    }
    const inv = mockStore.invoices.find((i) => i.bookingId === bookingId);
    if (!inv) return null;
    const payments = mockStore.payments.filter((p) => p.invoiceId === inv.id);
    const customer = mockStore.users.find((u) => u.id === inv.customerId);
    const elec = mockStore.electricianProfiles.find((p) => p.id === inv.electricianId);
    const elecUser = elec ? mockStore.users.find((u) => u.id === elec.userId) : null;
    return {
      ...inv,
      payments,
      customer,
      electrician: elec ? { ...elec, user: elecUser } : null,
    };
  }

  async findById(id: string) {
    if (getIsDbConnected()) {
      return prisma.invoice.findUnique({
        where: { id },
        include: { payments: true, customer: true, electrician: { include: { user: true } }, booking: true },
      });
    }
    const inv = mockStore.invoices.find((i) => i.id === id);
    if (!inv) return null;
    const payments = mockStore.payments.filter((p) => p.invoiceId === inv.id);
    const customer = mockStore.users.find((u) => u.id === inv.customerId);
    const elec = mockStore.electricianProfiles.find((p) => p.id === inv.electricianId);
    const elecUser = elec ? mockStore.users.find((u) => u.id === elec.userId) : null;
    const booking = mockStore.bookings.find((b) => b.id === inv.bookingId);
    return {
      ...inv,
      payments,
      customer,
      electrician: elec ? { ...elec, user: elecUser } : null,
      booking,
    };
  }

  async create(data: {
    bookingId: string;
    electricianId: string;
    customerId: string;
    laborCost: number;
    partsCost: number;
    tax: number;
    platformFee: number;
    totalAmount: number;
    items?: any[];
    notes?: string;
  }) {
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (getIsDbConnected()) {
      return prisma.invoice.create({
        data: {
          invoiceNumber,
          ...data,
          status: 'ISSUED',
        },
      });
    }

    const newInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      status: 'ISSUED',
      ...data,
      approvedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockStore.invoices.push(newInvoice);
    return newInvoice;
  }

  async approveInvoice(id: string) {
    if (getIsDbConnected()) {
      return prisma.invoice.update({
        where: { id },
        data: { status: 'APPROVED', approvedAt: new Date() },
      });
    }
    const idx = mockStore.invoices.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    mockStore.invoices[idx].status = 'APPROVED';
    mockStore.invoices[idx].approvedAt = new Date();
    mockStore.invoices[idx].updatedAt = new Date();
    return mockStore.invoices[idx];
  }
}

export const invoiceRepository = new InvoiceRepository();
