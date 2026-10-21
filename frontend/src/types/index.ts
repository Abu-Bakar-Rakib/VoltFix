export type Role = 'CUSTOMER' | 'ELECTRICIAN' | 'ADMIN';

export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type BookingStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'ON_THE_WAY'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED';

export type PricingType = 'FIXED' | 'HOURLY' | 'INSPECTION';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  isVerified: boolean;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  isActive: boolean;
}

export interface Service {
  id: string;
  electricianProfileId: string;
  categoryId: string;
  category?: Category;
  title: string;
  description?: string;
  pricingType: PricingType;
  basePrice: number;
  estimatedDurationMin: number;
  isActive: boolean;
}

export interface ElectricianProfile {
  id: string;
  userId: string;
  user?: User;
  bio?: string;
  experienceYears: number;
  skills: string[];
  serviceRadiusKm: number;
  latitude: number;
  longitude: number;
  addressText?: string;
  city?: string;
  isOnline: boolean;
  verificationStatus: VerificationStatus;
  rejectionReason?: string;
  hourlyRate: number;
  emergencyAvailable: boolean;
  ratingAverage: number;
  reviewCount: number;
  portfolioPhotos?: string[];
  services?: Service[];
  reviews?: Review[];
  distanceKm?: number;
}

export interface BookingPhoto {
  id: string;
  bookingId: string;
  photoUrl: string;
  caption?: string;
}

export interface BookingStatusHistory {
  id: string;
  bookingId: string;
  fromStatus?: BookingStatus;
  toStatus: BookingStatus;
  changedByUserId: string;
  changedBy?: User;
  reason?: string;
  createdAt: string;
}

export interface InvoiceItem {
  description: string;
  cost: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  bookingId: string;
  electricianId: string;
  customerId: string;
  laborCost: number;
  partsCost: number;
  tax: number;
  platformFee: number;
  totalAmount: number;
  items?: InvoiceItem[];
  notes?: string;
  status: 'ISSUED' | 'APPROVED' | 'PAID' | 'DISPUTED';
  approvedAt?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  invoiceId?: string;
  customerId: string;
  amount: number;
  currency: string;
  method: 'CASH' | 'ONLINE_SANDBOX' | 'CARD' | 'WALLET';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  transactionId?: string;
  receiptUrl?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  customer?: User;
  electricianId: string;
  electrician?: ElectricianProfile;
  rating: number;
  comment: string;
  replyComment?: string;
  repliedAt?: string;
  isReported?: boolean;
  createdAt: string;
}

export interface Quote {
  id: string;
  bookingId: string;
  electricianId: string;
  electrician?: ElectricianProfile;
  estimatedPrice: number;
  laborCost?: number;
  partsCost?: number;
  estimatedDurationMin: number;
  note?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  createdAt: string;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  customerId: string;
  customer?: User;
  electricianId?: string;
  electrician?: ElectricianProfile;
  serviceId?: string;
  service?: Service;
  categoryId?: string;
  category?: Category;
  status: BookingStatus;
  type: 'DIRECT' | 'OPEN_REQUEST';
  isEmergency: boolean;
  problemDescription: string;
  scheduledAt: string;
  estimatedDurationMin: number;
  addressStreet: string;
  addressCity: string;
  addressZip?: string;
  addressLat: number;
  addressLng: number;
  customerPhone?: string;
  electricianPhone?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  photos?: BookingPhoto[];
  statusHistory?: BookingStatusHistory[];
  invoice?: Invoice;
  payments?: Payment[];
  review?: Review;
  quotes?: Quote[];
}

export interface Message {
  id: string;
  bookingId: string;
  senderId: string;
  sender?: User;
  content: string;
  attachmentUrl?: string;
  attachmentType?: 'IMAGE' | 'FILE';
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  entityId?: string;
  entityType?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    [key: string]: any;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
