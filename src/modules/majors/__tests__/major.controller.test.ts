import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import majorRoutes from '../major.route';
import { Major, MBTICompatibility } from '../major.model';

// Mock middleware
jest.mock('../../../middlewares/authMiddleware', () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.user = { id: 'test-user-id', role: 'admin' };
    next();
  }
}));

jest.mock('../../../middlewares/roleMiddleware', () => ({
  authorize: (roles: string[]) => (req: any, res: any, next: any) => {
    if (roles.includes(req.user?.role)) {
      next();
    } else {
      res.status(403).json({ error: 'Forbidden' });
    }
  }
}));

describe('Major Controller Tests', () => {
  let app: express.Application;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    app = express();
    app.use(express.json());
    app.use('/api/v1/majors', majorRoutes);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Major.deleteMany({});
    await MBTICompatibility.deleteMany({});
  });

  describe('GET /api/v1/majors', () => {
    it('should get all majors with pagination', async () => {
      await Major.create([
        {
          code: 'CNTT',
          name: 'Công nghệ thông tin',
          description: 'IT major',
          duration: 4,
          degreeLevel: 'Bachelor',
          salaryRange: { min: 8000000, max: 50000000 }
        },
        {
          code: 'QTKD',
          name: 'Quản trị kinh doanh',
          description: 'Business major',
          duration: 4,
          degreeLevel: 'Bachelor',
          salaryRange: { min: 7000000, max: 80000000 }
        }
      ]);

      const response = await request(app)
        .get('/api/v1/majors')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination.total).toBe(2);
    });

    it('should support pagination parameters', async () => {
      await Major.create([
        {
          code: 'CNTT',
          name: 'Công nghệ thông tin',
          description: 'IT major',
          duration: 4,
          degreeLevel: 'Bachelor',
          salaryRange: { min: 8000000, max: 50000000 }
        },
        {
          code: 'QTKD',
          name: 'Quản trị kinh doanh',
          description: 'Business major',
          duration: 4,
          degreeLevel: 'Bachelor',
          salaryRange: { min: 7000000, max: 80000000 }
        }
      ]);

      const response = await request(app)
        .get('/api/v1/majors?page=1&limit=1')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(1);
    });
  });

  describe('GET /api/v1/majors/:id', () => {
    it('should get major by ID', async () => {
      const major = await Major.create({
        code: 'CNTT',
        name: 'Công nghệ thông tin',
        description: 'IT major',
        duration: 4,
        degreeLevel: 'Bachelor',
        salaryRange: { min: 8000000, max: 50000000 }
      });

      const response = await request(app)
        .get(`/api/v1/majors/${major._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.code).toBe('CNTT');
      expect(response.body.data.name).toBe('Công nghệ thông tin');
    });

    it('should return 404 for non-existent major', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/v1/majors/${nonExistentId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Major not found');
    });

    it('should return 500 for invalid ID format', async () => {
      const response = await request(app)
        .get('/api/v1/majors/invalid-id')
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/majors', () => {
    it('should create a new major', async () => {
      const majorData = {
        code: 'CNTT',
        name: 'Công nghệ thông tin',
        description: 'IT major',
        duration: 4,
        degreeLevel: 'Bachelor',
        salaryRange: { min: 8000000, max: 50000000 }
      };

      const response = await request(app)
        .post('/api/v1/majors')
        .send(majorData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.code).toBe('CNTT');
      expect(response.body.data.name).toBe('Công nghệ thông tin');
    });

    it('should return 409 for duplicate major code', async () => {
      await Major.create({
        code: 'CNTT',
        name: 'Existing Major',
        description: 'Existing description',
        duration: 4,
        degreeLevel: 'Bachelor',
        salaryRange: { min: 8000000, max: 50000000 }
      });

      const majorData = {
        code: 'CNTT',
        name: 'New Major',
        description: 'New description',
        duration: 4,
        degreeLevel: 'Bachelor',
        salaryRange: { min: 8000000, max: 50000000 }
      };

      const response = await request(app)
        .post('/api/v1/majors')
        .send(majorData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Major code already exists');
    });
  });

  describe('PUT /api/v1/majors/:id', () => {
    it('should update a major', async () => {
      const major = await Major.create({
        code: 'CNTT',
        name: 'Công nghệ thông tin',
        description: 'IT major',
        duration: 4,
        degreeLevel: 'Bachelor',
        salaryRange: { min: 8000000, max: 50000000 }
      });

      const updateData = {
        name: 'Computer Science',
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/v1/majors/${major._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Computer Science');
      expect(response.body.data.description).toBe('Updated description');
    });

    it('should return 404 for non-existent major', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .put(`/api/v1/majors/${nonExistentId}`)
        .send({ name: 'Updated Name' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Major not found');
    });
  });

  describe('DELETE /api/v1/majors/:id', () => {
    it('should soft delete a major', async () => {
      const major = await Major.create({
        code: 'CNTT',
        name: 'Công nghệ thông tin',
        description: 'IT major',
        duration: 4,
        degreeLevel: 'Bachelor',
        salaryRange: { min: 8000000, max: 50000000 }
      });

      const response = await request(app)
        .delete(`/api/v1/majors/${major._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Major deleted successfully');

      // Verify soft delete
      const deletedMajor = await Major.findById(major._id);
      expect(deletedMajor?.isActive).toBe(false);
    });
  });

  describe('GET /api/v1/majors/recommendations/:mbtiType', () => {
    it('should get majors by MBTI compatibility', async () => {
      const major = await Major.create({
        code: 'CNTT',
        name: 'Công nghệ thông tin',
        description: 'IT major',
        duration: 4,
        degreeLevel: 'Bachelor',
        salaryRange: { min: 8000000, max: 50000000 }
      });

      await MBTICompatibility.create({
        majorId: major._id,
        mbtiType: 'INTJ',
        compatibilityScore: 95,
        description: 'High compatibility'
      });

      const response = await request(app)
        .get('/api/v1/majors/recommendations/INTJ')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].compatibilityScore).toBe(95);
    });

    it('should return 400 for invalid MBTI type', async () => {
      const response = await request(app)
        .get('/api/v1/majors/recommendations/INVALID')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/majors/:majorId/compatibility/:mbtiType', () => {
    it('should get compatibility by major and MBTI type', async () => {
      const major = await Major.create({
        code: 'CNTT',
        name: 'Công nghệ thông tin',
        description: 'IT major',
        duration: 4,
        degreeLevel: 'Bachelor',
        salaryRange: { min: 8000000, max: 50000000 }
      });

      await MBTICompatibility.create({
        majorId: major._id,
        mbtiType: 'INTJ',
        compatibilityScore: 95,
        description: 'High compatibility'
      });

      const response = await request(app)
        .get(`/api/v1/majors/${major._id}/compatibility/INTJ`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.mbtiType).toBe('INTJ');
      expect(response.body.data.compatibilityScore).toBe(95);
    });

    it('should return 404 for non-existent compatibility', async () => {
      const major = await Major.create({
        code: 'CNTT',
        name: 'Công nghệ thông tin',
        description: 'IT major',
        duration: 4,
        degreeLevel: 'Bachelor',
        salaryRange: { min: 8000000, max: 50000000 }
      });

      const response = await request(app)
        .get(`/api/v1/majors/${major._id}/compatibility/ENFP`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Compatibility data not found for this major-MBTI combination');
    });
  });

  describe('POST /api/v1/majors/compatibility', () => {
    it('should create MBTI compatibility record', async () => {
      const major = await Major.create({
        code: 'CNTT',
        name: 'Công nghệ thông tin',
        description: 'IT major',
        duration: 4,
        degreeLevel: 'Bachelor',
        salaryRange: { min: 8000000, max: 50000000 }
      });

      const compatibilityData = {
        majorId: major._id,
        mbtiType: 'INTJ',
        compatibilityScore: 95,
        description: 'High compatibility',
        strengths: ['Logic', 'Problem solving'],
        challenges: ['Communication'],
        careerExamples: ['Software Engineer']
      };

      const response = await request(app)
        .post('/api/v1/majors/compatibility')
        .send(compatibilityData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.mbtiType).toBe('INTJ');
      expect(response.body.data.compatibilityScore).toBe(95);
    });

    it('should return 409 for duplicate compatibility', async () => {
      const major = await Major.create({
        code: 'CNTT',
        name: 'Công nghệ thông tin',
        description: 'IT major',
        duration: 4,
        degreeLevel: 'Bachelor',
        salaryRange: { min: 8000000, max: 50000000 }
      });

      await MBTICompatibility.create({
        majorId: major._id,
        mbtiType: 'INTJ',
        compatibilityScore: 95,
        description: 'Existing compatibility'
      });

      const compatibilityData = {
        majorId: major._id,
        mbtiType: 'INTJ',
        compatibilityScore: 90,
        description: 'Duplicate compatibility'
      };

      const response = await request(app)
        .post('/api/v1/majors/compatibility')
        .send(compatibilityData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Compatibility record already exists');
    });
  });

  describe('GET /api/v1/majors/analytics/statistics', () => {
    it('should get major statistics', async () => {
      await Major.create([
        {
          code: 'CNTT',
          name: 'Công nghệ thông tin',
          description: 'IT major',
          duration: 4,
          degreeLevel: 'Bachelor',
          salaryRange: { min: 8000000, max: 50000000 }
        },
        {
          code: 'QTKD',
          name: 'Quản trị kinh doanh',
          description: 'Business major',
          duration: 4,
          degreeLevel: 'Master',
          salaryRange: { min: 7000000, max: 80000000 }
        }
      ]);

      const response = await request(app)
        .get('/api/v1/majors/analytics/statistics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalMajors).toBe(2);
      expect(response.body.data.avgDuration).toBe(4);
    });
  });
});