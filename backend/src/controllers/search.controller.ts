import { Request, Response, NextFunction } from 'express';
import { searchService } from '../services/search.service';
import { sendSuccess } from '../utils/response';

export class SearchController {
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const results = await searchService.search(req.query);
      sendSuccess(
        res,
        results.electricians,
        'Electricians found matching criteria.',
        200,
        {
          total: results.total,
          page: results.page,
          limit: results.limit,
          totalPages: results.totalPages,
        }
      );
    } catch (err) {
      next(err);
    }
  }
}

export const searchController = new SearchController();
