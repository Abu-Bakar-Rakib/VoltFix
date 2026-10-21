import { electricianRepository } from '../repositories/electrician.repository';

export class SearchService {
  async search(params: any) {
    return electricianRepository.searchNearby({
      lat: params.lat ?? 23.8103, // Default center: Dhaka
      lng: params.lng ?? 90.4125,
      radiusKm: params.radius ?? 25,
      categoryId: params.categoryId,
      minRating: params.minRating,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      emergencyOnly: params.emergencyOnly,
      availableNow: params.availableNow,
      query: params.query,
      sort: params.sort ?? 'distance_asc',
      page: params.page ?? 1,
      limit: params.limit ?? 12,
    });
  }
}

export const searchService = new SearchService();
