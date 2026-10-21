import { electricianRepository } from '../repositories/electrician.repository';

export class ElectricianService {
  async getProfile(electricianId: string) {
    const profile = await electricianRepository.findById(electricianId);
    if (!profile) {
      const error: any = new Error('Electrician profile not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }
    return profile;
  }

  async getProfileByUserId(userId: string) {
    const profile = await electricianRepository.findByUserId(userId);
    if (!profile) {
      const error: any = new Error('Electrician profile not found for this user');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }
    return profile;
  }

  async updateProfile(profileId: string, data: any) {
    return electricianRepository.updateProfile(profileId, data);
  }

  async toggleOnlineStatus(profileId: string, isOnline: boolean) {
    return electricianRepository.updateProfile(profileId, { isOnline });
  }

  async addService(profileId: string, data: any) {
    return electricianRepository.addService({
      ...data,
      electricianProfileId: profileId,
    });
  }

  async updateService(serviceId: string, data: any) {
    return electricianRepository.updateService(serviceId, data);
  }

  async deleteService(serviceId: string) {
    return electricianRepository.deleteService(serviceId);
  }

  async setAvailability(profileId: string, slots: any[]) {
    return electricianRepository.setAvailability(profileId, slots);
  }

  async addTimeOff(profileId: string, data: any) {
    return electricianRepository.addTimeOff({
      ...data,
      electricianProfileId: profileId,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    });
  }

  async uploadDocument(profileId: string, data: any) {
    return electricianRepository.addDocument({
      ...data,
      electricianProfileId: profileId,
    });
  }

  async getCategories() {
    return electricianRepository.getAllCategories();
  }
}

export const electricianService = new ElectricianService();
