import { Request, Response } from 'express';
import { MajorService } from './major.service';
import { ApiResponseWrapper } from '../../interfaces/ApiResponseWrapper';

export class MajorController {
  // ==================== Major CRUD Operations ====================
  
  /**
   * Get all majors with optional pagination and search
   * GET /api/v1/majors?page=1&limit=20&search=computer
   */
  static async getAllMajors(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      
      const result = await MajorService.getAllMajors(page, limit, search);
      
      return res.status(200).json(
        ApiResponseWrapper.paginated(
          'Majors retrieved successfully',
          result.majors,
          result.pagination.total,
          result.pagination.page,
          result.pagination.limit
        )
      );
    } catch (error) {
      console.error('Get all majors error:', error);
      return res.status(500).json(
        ApiResponseWrapper.error('Internal server error', String(error))
      );
    }
  }
  
  /**
   * Get major by ID
   * GET /api/v1/majors/:id
   */
  static async getMajorById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const major = await MajorService.getMajorById(id as string);
      
      return res.status(200).json(
        ApiResponseWrapper.success('Major retrieved successfully', major)
      );
    } catch (error) {
      console.error('Get major by ID error:', error);
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
      return res.status(statusCode).json(
        ApiResponseWrapper.error(
          statusCode === 404 ? 'Major not found' : 'Internal server error',
          String(error)
        )
      );
    }
  }
  
  /**
   * Create a new major (Admin only)
   * POST /api/v1/majors
   */
  static async createMajor(req: Request, res: Response) {
    try {
      const majorData = req.body;
      const major = await MajorService.createMajor(majorData);
      
      return res.status(201).json(
        ApiResponseWrapper.success('Major created successfully', major)
      );
    } catch (error) {
      console.error('Create major error:', error);
      const statusCode = error instanceof Error && error.message.includes('already exists') ? 409 : 400;
      return res.status(statusCode).json(
        ApiResponseWrapper.error(
          statusCode === 409 ? 'Major code already exists' : 'Invalid data provided',
          String(error)
        )
      );
    }
  }
  
  /**
   * Update major by ID (Admin only)
   * PUT /api/v1/majors/:id
   */
  static async updateMajor(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const major = await MajorService.updateMajor(id as string, updateData);
      
      return res.status(200).json(
        ApiResponseWrapper.success('Major updated successfully', major)
      );
    } catch (error) {
      console.error('Update major error:', error);
      const statusCode = error instanceof Error && 
        (error.message.includes('not found') ? 404 : 
         error.message.includes('already exists') ? 409 : 400);
      return res.status(statusCode).json(
        ApiResponseWrapper.error(
          statusCode === 404 ? 'Major not found' : 
          statusCode === 409 ? 'Major code already exists' : 'Invalid data provided',
          String(error)
        )
      );
    }
  }
  
  /**
   * Delete major by ID (Admin only)
   * DELETE /api/v1/majors/:id
   */
  static async deleteMajor(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await MajorService.deleteMajor(id as string);
      
      return res.status(200).json(
        ApiResponseWrapper.success('Major deleted successfully', result)
      );
    } catch (error) {
      console.error('Delete major error:', error);
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
      return res.status(statusCode).json(
        ApiResponseWrapper.error(
          statusCode === 404 ? 'Major not found' : 'Internal server error',
          String(error)
        )
      );
    }
  }
  
  // ==================== MBTI Compatibility Operations ====================
  
  /**
   * Get majors ranked by MBTI compatibility
   * GET /api/v1/majors/recommendations/:mbtiType?limit=10
   */
  static async getMajorsByMBTICompatibility(req: Request, res: Response) {
    try {
      const { mbtiType } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const majors = await MajorService.getMajorsByMBTICompatibility(mbtiType as string, limit);
      
      return res.status(200).json(
        ApiResponseWrapper.success(
          `Major recommendations for ${(mbtiType as string).toUpperCase()} retrieved successfully`,
          majors
        )
      );
    } catch (error) {
      console.error('Get majors by MBTI compatibility error:', error);
      return res.status(400).json(
        ApiResponseWrapper.error('Invalid MBTI type or request parameters', String(error))
      );
    }
  }
  
  /**
   * Get compatibility data for a specific major and MBTI type
   * GET /api/v1/majors/:majorId/compatibility/:mbtiType
   */
  static async getCompatibilityByMajorAndType(req: Request, res: Response) {
    try {
      const { majorId, mbtiType } = req.params;
      
      const compatibility = await MajorService.getCompatibilityByMajorAndType(majorId as string, mbtiType as string);
      
      if (!compatibility) {
        return res.status(404).json(
          ApiResponseWrapper.error('Compatibility data not found for this major-MBTI combination')
        );
      }
      
      return res.status(200).json(
        ApiResponseWrapper.success('Compatibility data retrieved successfully', compatibility)
      );
    } catch (error) {
      console.error('Get compatibility by major and type error:', error);
      return res.status(400).json(
        ApiResponseWrapper.error('Invalid major ID or MBTI type', String(error))
      );
    }
  }
  
  /**
   * Create MBTI compatibility record (Admin only)
   * POST /api/v1/majors/compatibility
   */
  static async createMBTICompatibility(req: Request, res: Response) {
    try {
      const compatibilityData = req.body;
      const compatibility = await MajorService.createMBTICompatibility(compatibilityData);
      
      return res.status(201).json(
        ApiResponseWrapper.success('Compatibility record created successfully', compatibility)
      );
    } catch (error) {
      console.error('Create MBTI compatibility error:', error);
      const statusCode = error instanceof Error && 
        (error.message.includes('not found') ? 404 : 
         error.message.includes('already exists') ? 409 : 400);
      return res.status(statusCode).json(
        ApiResponseWrapper.error(
          statusCode === 404 ? 'Major not found' : 
          statusCode === 409 ? 'Compatibility record already exists' : 'Invalid data provided',
          String(error)
        )
      );
    }
  }
  
  /**
   * Update MBTI compatibility record (Admin only)
   * PUT /api/v1/majors/compatibility/:id
   */
  static async updateMBTICompatibility(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const compatibility = await MajorService.updateMBTICompatibility(id as string, updateData);
      
      return res.status(200).json(
        ApiResponseWrapper.success('Compatibility record updated successfully', compatibility)
      );
    } catch (error) {
      console.error('Update MBTI compatibility error:', error);
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 400;
      return res.status(statusCode).json(
        ApiResponseWrapper.error(
          statusCode === 404 ? 'Compatibility record not found' : 'Invalid data provided',
          String(error)
        )
      );
    }
  }
  
  /**
   * Delete MBTI compatibility record (Admin only)
   * DELETE /api/v1/majors/compatibility/:id
   */
  static async deleteMBTICompatibility(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await MajorService.deleteMBTICompatibility(id as string);
      
      return res.status(200).json(
        ApiResponseWrapper.success('Compatibility record deleted successfully', result)
      );
    } catch (error) {
      console.error('Delete MBTI compatibility error:', error);
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
      return res.status(statusCode).json(
        ApiResponseWrapper.error(
          statusCode === 404 ? 'Compatibility record not found' : 'Internal server error',
          String(error)
        )
      );
    }
  }
  
  /**
   * Get all compatibility records for a major
   * GET /api/v1/majors/:majorId/compatibility
   */
  static async getCompatibilityByMajor(req: Request, res: Response) {
    try {
      const { majorId } = req.params;
      
      const compatibilities = await MajorService.getCompatibilityByMajor(majorId as string);
      
      return res.status(200).json(
        ApiResponseWrapper.success('Compatibility records retrieved successfully', compatibilities)
      );
    } catch (error) {
      console.error('Get compatibility by major error:', error);
      return res.status(400).json(
        ApiResponseWrapper.error('Invalid major ID', String(error))
      );
    }
  }
  
  /**
   * Get all compatibility records for an MBTI type
   * GET /api/v1/majors/compatibility/mbti/:mbtiType
   */
  static async getCompatibilityByMBTIType(req: Request, res: Response) {
    try {
      const { mbtiType } = req.params;
      
      const compatibilities = await MajorService.getCompatibilityByMBTIType(mbtiType as string);
      
      return res.status(200).json(
        ApiResponseWrapper.success(
          `Compatibility records for ${(mbtiType as string).toUpperCase()} retrieved successfully`,
          compatibilities
        )
      );
    } catch (error) {
      console.error('Get compatibility by MBTI type error:', error);
      return res.status(400).json(
        ApiResponseWrapper.error('Invalid MBTI type', String(error))
      );
    }
  }
  
  // ==================== Analytics and Statistics ====================
  
  /**
   * Get major statistics (Admin only)
   * GET /api/v1/majors/analytics/statistics
   */
  static async getMajorStatistics(req: Request, res: Response) {
    try {
      const stats = await MajorService.getMajorStatistics();
      
      return res.status(200).json(
        ApiResponseWrapper.success('Major statistics retrieved successfully', stats)
      );
    } catch (error) {
      console.error('Get major statistics error:', error);
      return res.status(500).json(
        ApiResponseWrapper.error('Internal server error', String(error))
      );
    }
  }
  
  /**
   * Get compatibility statistics (Admin only)
   * GET /api/v1/majors/analytics/compatibility
   */
  static async getCompatibilityStatistics(req: Request, res: Response) {
    try {
      const stats = await MajorService.getCompatibilityStatistics();
      
      return res.status(200).json(
        ApiResponseWrapper.success('Compatibility statistics retrieved successfully', stats)
      );
    } catch (error) {
      console.error('Get compatibility statistics error:', error);
      return res.status(500).json(
        ApiResponseWrapper.error('Internal server error', String(error))
      );
    }
  }
}