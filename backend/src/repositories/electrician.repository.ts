import { prisma, getIsDbConnected } from '../config/db';
import { mockStore } from './mockStore';
import { calculateDistanceKm, calculateBoundingBox } from '../utils/geo';

export class ElectricianRepository {
  async findByUserId(userId: string) {
    if (getIsDbConnected()) {
      return prisma.electricianProfile.findUnique({
        where: { userId },
        include: {
          user: true,
          services: { include: { category: true } },
          availabilitySlots: true,
          documents: true,
          timeOffs: true,
        },
      });
    }

    const profile = mockStore.electricianProfiles.find((p) => p.userId === userId);
    if (!profile) return null;
    const user = mockStore.users.find((u) => u.id === profile.userId);
    const services = mockStore.services
      .filter((s) => s.electricianProfileId === profile.id)
      .map((s) => ({
        ...s,
        category: mockStore.categories.find((c) => c.id === s.categoryId),
      }));
    const availabilitySlots = mockStore.availabilitySlots.filter(
      (a) => a.electricianProfileId === profile.id
    );
    const documents = mockStore.verificationDocuments.filter(
      (d) => d.electricianProfileId === profile.id
    );
    const timeOffs = mockStore.timeOffs.filter((t) => t.electricianProfileId === profile.id);

    return {
      ...profile,
      user,
      services,
      availabilitySlots,
      documents,
      timeOffs,
    };
  }

  async findById(id: string) {
    if (getIsDbConnected()) {
      return prisma.electricianProfile.findUnique({
        where: { id },
        include: {
          user: true,
          services: { include: { category: true } },
          availabilitySlots: true,
          documents: true,
          timeOffs: true,
          reviews: {
            include: { customer: true },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });
    }

    const profile = mockStore.electricianProfiles.find((p) => p.id === id);
    if (!profile) return null;
    const user = mockStore.users.find((u) => u.id === profile.userId);
    const services = mockStore.services
      .filter((s) => s.electricianProfileId === profile.id)
      .map((s) => ({
        ...s,
        category: mockStore.categories.find((c) => c.id === s.categoryId),
      }));
    const availabilitySlots = mockStore.availabilitySlots.filter(
      (a) => a.electricianProfileId === profile.id
    );
    const documents = mockStore.verificationDocuments.filter(
      (d) => d.electricianProfileId === profile.id
    );
    const timeOffs = mockStore.timeOffs.filter((t) => t.electricianProfileId === profile.id);
    const reviews = mockStore.reviews
      .filter((r) => r.electricianId === profile.id)
      .map((r) => ({
        ...r,
        customer: mockStore.users.find((u) => u.id === r.customerId),
      }));

    return {
      ...profile,
      user,
      services,
      availabilitySlots,
      documents,
      timeOffs,
      reviews,
    };
  }

  async createProfile(data: any) {
    if (getIsDbConnected()) {
      return prisma.electricianProfile.create({ data });
    }
    const newProfile = {
      id: `prof-${Date.now()}`,
      ...data,
      ratingAverage: 0,
      reviewCount: 0,
      isOnline: true,
      verificationStatus: data.verificationStatus || 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockStore.electricianProfiles.push(newProfile);
    return newProfile;
  }

  async updateProfile(id: string, data: any) {
    if (getIsDbConnected()) {
      return prisma.electricianProfile.update({
        where: { id },
        data,
      });
    }
    const idx = mockStore.electricianProfiles.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    mockStore.electricianProfiles[idx] = {
      ...mockStore.electricianProfiles[idx],
      ...data,
      updatedAt: new Date(),
    };
    return mockStore.electricianProfiles[idx];
  }

  async searchNearby({
    lat = 23.8103,
    lng = 90.4125,
    radiusKm = 25,
    categoryId,
    minRating,
    minPrice,
    maxPrice,
    emergencyOnly,
    availableNow,
    query,
    sort = 'distance_asc',
    page = 1,
    limit = 12,
  }: any) {
    // 1. Calculate bounding box for fast indexed prefilter
    const bbox = calculateBoundingBox(lat, lng, radiusKm);

    if (getIsDbConnected()) {
      // In production with MySQL 8:
      // We use bounding-box conditions, category joining, and ST_Distance_Sphere
      try {
        const results = await prisma.$queryRaw<any[]>`
          SELECT 
            ep.*, 
            u.name as user_name, 
            u.avatarUrl as user_avatar, 
            u.phone as user_phone,
            (ST_Distance_Sphere(point(ep.longitude, ep.latitude), point(${lng}, ${lat})) / 1000) AS distance_km
          FROM electrician_profiles ep
          JOIN users u ON ep.userId = u.id
          WHERE ep.verificationStatus = 'APPROVED'
            AND ep.isOnline = true
            AND ep.latitude BETWEEN ${bbox.minLat} AND ${bbox.maxLat}
            AND ep.longitude BETWEEN ${bbox.minLng} AND ${bbox.maxLng}
          HAVING distance_km <= ${radiusKm}
          ORDER BY distance_km ASC
          LIMIT ${limit} OFFSET ${(page - 1) * limit}
        `;
        return {
          electricians: results,
          total: results.length,
          page,
          limit,
        };
      } catch (err) {
        // Fallback to in-memory filter if raw SQL is unavailable
      }
    }

    // In-memory / Mock search implementation
    let list = mockStore.electricianProfiles
      .filter((p) => p.verificationStatus === 'APPROVED')
      .map((p) => {
        const user = mockStore.users.find((u) => u.id === p.userId);
        const services = mockStore.services.filter((s) => s.electricianProfileId === p.id);
        const distanceKm = calculateDistanceKm(lat, lng, p.latitude, p.longitude);
        return {
          ...p,
          user,
          services,
          distanceKm,
        };
      });

    // Distance filter
    list = list.filter((p) => p.distanceKm <= radiusKm);

    // Online check
    if (availableNow) {
      list = list.filter((p) => p.isOnline);
    }

    // Emergency filter
    if (emergencyOnly) {
      list = list.filter((p) => p.emergencyAvailable);
    }

    // Min rating
    if (minRating) {
      list = list.filter((p) => p.ratingAverage >= minRating);
    }

    // Price range filter
    if (minPrice) {
      list = list.filter((p) => p.hourlyRate >= minPrice);
    }
    if (maxPrice) {
      list = list.filter((p) => p.hourlyRate <= maxPrice);
    }

    // Category filter
    if (categoryId) {
      list = list.filter((p) => p.services.some((s: any) => s.categoryId === categoryId));
    }

    // Keyword search
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.user?.name.toLowerCase().includes(q) ||
          p.bio?.toLowerCase().includes(q) ||
          p.city?.toLowerCase().includes(q) ||
          p.skills?.some((sk: string) => sk.toLowerCase().includes(q))
      );
    }

    // Sorting
    list.sort((a, b) => {
      if (sort === 'distance_asc') return a.distanceKm - b.distanceKm;
      if (sort === 'rating_desc') return b.ratingAverage - a.ratingAverage;
      if (sort === 'price_asc') return a.hourlyRate - b.hourlyRate;
      if (sort === 'price_desc') return b.hourlyRate - a.hourlyRate;
      if (sort === 'experience_desc') return b.experienceYears - a.experienceYears;
      return 0;
    });

    const total = list.length;
    const paginated = list.slice((page - 1) * limit, page * limit);

    return {
      electricians: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getVerificationQueue(status?: string) {
    if (getIsDbConnected()) {
      return prisma.electricianProfile.findMany({
        where: status ? { verificationStatus: status as any } : undefined,
        include: { user: true, documents: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    let list = mockStore.electricianProfiles;
    if (status) {
      list = list.filter((p) => p.verificationStatus === status);
    }
    return list.map((p) => {
      const user = mockStore.users.find((u) => u.id === p.userId);
      const documents = mockStore.verificationDocuments.filter(
        (d) => d.electricianProfileId === p.id
      );
      return { ...p, user, documents };
    });
  }

  async updateVerificationStatus(profileId: string, status: string, rejectionReason?: string) {
    if (getIsDbConnected()) {
      return prisma.electricianProfile.update({
        where: { id: profileId },
        data: {
          verificationStatus: status as any,
          rejectionReason: rejectionReason || null,
        },
      });
    }

    const idx = mockStore.electricianProfiles.findIndex((p) => p.id === profileId);
    if (idx === -1) return null;
    mockStore.electricianProfiles[idx].verificationStatus = status;
    mockStore.electricianProfiles[idx].rejectionReason = rejectionReason || null;
    mockStore.electricianProfiles[idx].updatedAt = new Date();
    return mockStore.electricianProfiles[idx];
  }

  async addService(data: any) {
    if (getIsDbConnected()) {
      return prisma.service.create({ data });
    }
    const newService = {
      id: `srv-${Date.now()}`,
      ...data,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockStore.services.push(newService);
    return newService;
  }

  async updateService(id: string, data: any) {
    if (getIsDbConnected()) {
      return prisma.service.update({ where: { id }, data });
    }
    const idx = mockStore.services.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    mockStore.services[idx] = { ...mockStore.services[idx], ...data, updatedAt: new Date() };
    return mockStore.services[idx];
  }

  async deleteService(id: string) {
    if (getIsDbConnected()) {
      return prisma.service.delete({ where: { id } });
    }
    const idx = mockStore.services.findIndex((s) => s.id === id);
    if (idx !== -1) mockStore.services.splice(idx, 1);
    return true;
  }

  async addDocument(data: any) {
    if (getIsDbConnected()) {
      return prisma.verificationDocument.create({ data });
    }
    const newDoc = {
      id: `doc-${Date.now()}`,
      ...data,
      verificationStatus: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockStore.verificationDocuments.push(newDoc);
    return newDoc;
  }

  async setAvailability(electricianProfileId: string, slots: any[]) {
    if (getIsDbConnected()) {
      await prisma.availabilitySlot.deleteMany({ where: { electricianProfileId } });
      return prisma.availabilitySlot.createMany({
        data: slots.map((s) => ({ ...s, electricianProfileId })),
      });
    }

    mockStore.availabilitySlots = mockStore.availabilitySlots.filter(
      (s) => s.electricianProfileId !== electricianProfileId
    );
    slots.forEach((s) => {
      mockStore.availabilitySlots.push({
        id: `slot-${Date.now()}-${Math.random()}`,
        electricianProfileId,
        ...s,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
    return mockStore.availabilitySlots.filter(
      (s) => s.electricianProfileId === electricianProfileId
    );
  }

  async addTimeOff(data: any) {
    if (getIsDbConnected()) {
      return prisma.timeOff.create({ data });
    }
    const newTimeOff = {
      id: `timeoff-${Date.now()}`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockStore.timeOffs.push(newTimeOff);
    return newTimeOff;
  }

  async getAllCategories() {
    if (getIsDbConnected()) {
      return prisma.category.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
      });
    }
    return mockStore.categories.filter((c) => c.isActive);
  }
}

export const electricianRepository = new ElectricianRepository();
