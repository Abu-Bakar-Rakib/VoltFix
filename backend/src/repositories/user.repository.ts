import { prisma, getIsDbConnected } from '../config/db';
import { mockStore } from './mockStore';

export class UserRepository {
  async findByEmail(email: string) {
    if (getIsDbConnected()) {
      return prisma.user.findUnique({
        where: { email },
        include: { electricianProfile: true },
      });
    }
    const user = mockStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return null;
    const profile = mockStore.electricianProfiles.find((p) => p.userId === user.id);
    return { ...user, electricianProfile: profile || null };
  }

  async findById(id: string) {
    if (getIsDbConnected()) {
      return prisma.user.findUnique({
        where: { id },
        include: { electricianProfile: true, addresses: true },
      });
    }
    const user = mockStore.users.find((u) => u.id === id);
    if (!user) return null;
    const profile = mockStore.electricianProfiles.find((p) => p.userId === user.id);
    const addresses = mockStore.addresses.filter((a) => a.userId === user.id);
    return { ...user, electricianProfile: profile || null, addresses };
  }

  async create(data: any) {
    if (getIsDbConnected()) {
      return prisma.user.create({ data });
    }
    const newUser = {
      id: `usr-${Date.now()}`,
      ...data,
      isVerified: data.isVerified ?? false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockStore.users.push(newUser);
    return newUser;
  }

  async update(id: string, data: any) {
    if (getIsDbConnected()) {
      return prisma.user.update({ where: { id }, data });
    }
    const idx = mockStore.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    mockStore.users[idx] = { ...mockStore.users[idx], ...data, updatedAt: new Date() };
    return mockStore.users[idx];
  }

  async findByResetToken(token: string) {
    if (getIsDbConnected()) {
      return prisma.user.findFirst({
        where: {
          resetPasswordToken: token,
          resetPasswordExpires: { gt: new Date() },
        },
      });
    }
    return (
      mockStore.users.find(
        (u) =>
          u.resetPasswordToken === token &&
          u.resetPasswordExpires &&
          new Date(u.resetPasswordExpires) > new Date()
      ) || null
    );
  }

  async findAllUsers({ role, search, page = 1, limit = 20 }: any) {
    if (getIsDbConnected()) {
      const where: any = {};
      if (role) where.role = role;
      if (search) {
        where.OR = [
          { name: { contains: search } },
          { email: { contains: search } },
          { phone: { contains: search } },
        ];
      }
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: { electricianProfile: true },
        }),
        prisma.user.count({ where }),
      ]);
      return { users, total };
    }

    let list = [...mockStore.users];
    if (role) list = list.filter((u) => u.role === role);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.phone && u.phone.includes(q))
      );
    }
    const total = list.length;
    const paginated = list.slice((page - 1) * limit, page * limit).map((u) => {
      const profile = mockStore.electricianProfiles.find((p) => p.userId === u.id);
      return { ...u, electricianProfile: profile || null };
    });
    return { users: paginated, total };
  }
}

export const userRepository = new UserRepository();
