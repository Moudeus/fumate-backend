import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Major, MBTICompatibility } from '../major.model';
import { MajorService } from '../major.service';

describe('Major Service Tests', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Major.deleteMany({});
    await MBTICompatibility.deleteMany({});
  });

  describe('Major CRUD Operations', () => {
    it('should get all majors with pagination', async () => {
      // Create test majors
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

      const result = await MajorService.getAllMajors(1, 10);

      expect(result.majors).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });

    it('should get major by ID', async () => {
      const major = await Major.create({
        code: 'CNTT',
        name: 'Công nghệ thông tin',
        description: 'IT major',
        duration: 4,
        degreeLevel: 'Bachelor',
        salaryRange: { min: 8000000, max: 50000000 }
      });

      const result = await MajorService.getMajorById(major._id.toString());

      expect(result).toBeTruthy();
      expect(result.code).toBe('CNTT');
      expect(result.name).toBe('Công nghệ thông tin');
    });

    it('should throw error for invalid major ID', async () => {
      await expect(MajorService.getMajorById('invalid-id')).rejects.toThrow('Invalid major ID');
    });

    it('should throw error for non-existent major', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      await expect(MajorService.getMajorById(nonExistentId)).rejects.toThrow('Major not found');
    });

    it('should create a new major', async () => {
      const majorData = {
        code: 'CNTT',
        name: 'Công nghệ thông tin',
        description: 'IT major',
        duration: 4,
        degreeLevel: 'Bachelor' as const,
        salaryRange: { min: 8000000, max: 50000000 }
      };

      const result = await MajorService.createMajor(majorData);

      expect(result).toBeTruthy();
      expect(result.code).toBe('CNTT');
      expect(result.name).toBe('Công nghệ thông tin');
    });

    it('should throw error for duplicate major code', async () => {
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
        degreeLevel: 'Bachelor' as const,
        salaryRange: { min: 8000000, max: 50000000 }
      };

      await expect(MajorService.createMajor(majorData)).rejects.toThrow('Major code already exists');
    });

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

      const result = await MajorService.updateMajor(major._id.toString(), updateData);

      expect(result.name).toBe('Computer Science');
      expect(result.description).toBe('Updated description');
    });

    it('should soft delete a major', async () => {
      const major = await Major.create({
        code: 'CNTT',
        name: 'Công nghệ thông tin',
        description: 'IT major',
        duration: 4,
        degreeLevel: 'Bachelor',
        salaryRange: { min: 8000000, max: 50000000 }
      });

      const result = await MajorService.deleteMajor(major._id.toString());

      expect(result.message).toBe('Major deleted successfully');

      const deletedMajor = await Major.findById(major._id);
      expect(deletedMajor?.isActive).toBe(false);
    });
  });

  describe('MBTI Compatibility Operations', () => {
    let majorId: mongoose.Types.ObjectId;

    beforeEach(async () => {
      const major = await Major.create({
        code: 'CNTT',
        name: 'Công nghệ thông tin',
        description: 'IT major',
        duration: 4,
        degreeLevel: 'Bachelor',
        salaryRange: { min: 8000000, max: 50000000 }
      });
      majorId = major._id;
    });

    it('should get majors by MBTI compatibility', async () => {
      await MBTICompatibility.create({
        majorId,
        mbtiType: 'INTJ',
        compatibilityScore: 95,
        description: 'High compatibility'
      });

      const result = await MajorService.getMajorsByMBTICompatibility('INTJ', 5);

      expect(result).toHaveLength(1);
      expect(result[0].compatibilityScore).toBe(95);
    });

    it('should throw error for invalid MBTI type', async () => {
      await expect(MajorService.getMajorsByMBTICompatibility('INVALID', 5))
        .rejects.toThrow('Invalid MBTI type format');
    });

    it('should get compatibility by major and type', async () => {
      await MBTICompatibility.create({
        majorId,
        mbtiType: 'INTJ',
        compatibilityScore: 95,
        description: 'High compatibility'
      });

      const result = await MajorService.getCompatibilityByMajorAndType(
        majorId.toString(),
        'INTJ'
      );

      expect(result).toBeTruthy();
      expect(result.mbtiType).toBe('INTJ');
      expect(result.compatibilityScore).toBe(95);
    });

    it('should create MBTI compatibility record', async () => {
      const compatibilityData = {
        majorId,
        mbtiType: 'INTJ',
        compatibilityScore: 95,
        description: 'High compatibility',
        strengths: ['Logic', 'Problem solving'],
        challenges: ['Communication'],
        careerExamples: ['Software Engineer']
      };

      const result = await MajorService.createMBTICompatibility(compatibilityData);

      expect(result).toBeTruthy();
      expect(result.mbtiType).toBe('INTJ');
      expect(result.compatibilityScore).toBe(95);

      // Verify compatibility was created
      const compatibility = await MBTICompatibility.findOne({ majorId, mbtiType: 'INTJ' });
      expect(compatibility).toBeTruthy();
    });

    it('should throw error for duplicate compatibility record', async () => {
      await MBTICompatibility.create({
        majorId,
        mbtiType: 'INTJ',
        compatibilityScore: 95,
        description: 'Existing compatibility'
      });

      const compatibilityData = {
        majorId,
        mbtiType: 'INTJ',
        compatibilityScore: 90,
        description: 'Duplicate compatibility'
      };

      await expect(MajorService.createMBTICompatibility(compatibilityData))
        .rejects.toThrow('Compatibility record already exists for this major-MBTI combination');
    });

    it('should update MBTI compatibility record', async () => {
      const compatibility = await MBTICompatibility.create({
        majorId,
        mbtiType: 'INTJ',
        compatibilityScore: 95,
        description: 'Original description'
      });

      const updateData = {
        compatibilityScore: 90,
        description: 'Updated description'
      };

      const result = await MajorService.updateMBTICompatibility(
        compatibility._id.toString(),
        updateData
      );

      expect(result.compatibilityScore).toBe(90);
      expect(result.description).toBe('Updated description');
    });

    it('should delete MBTI compatibility record', async () => {
      const compatibility = await MBTICompatibility.create({
        majorId,
        mbtiType: 'INTJ',
        compatibilityScore: 95,
        description: 'Test compatibility'
      });

      // Add compatibility reference to major
      await Major.findByIdAndUpdate(majorId, {
        $addToSet: { mbtiCompatibility: compatibility._id }
      });

      const result = await MajorService.deleteMBTICompatibility(compatibility._id.toString());

      expect(result.message).toBe('Compatibility record deleted successfully');

      // Check if compatibility was soft deleted
      const deletedCompatibility = await MBTICompatibility.findById(compatibility._id);
      expect(deletedCompatibility?.isActive).toBe(false);
    });

    it('should get compatibility by major', async () => {
      await MBTICompatibility.create([
        {
          majorId,
          mbtiType: 'INTJ',
          compatibilityScore: 95,
          description: 'High compatibility'
        },
        {
          majorId,
          mbtiType: 'ENFP',
          compatibilityScore: 70,
          description: 'Medium compatibility'
        }
      ]);

      const result = await MajorService.getCompatibilityByMajor(majorId.toString());

      expect(result).toHaveLength(2);
      expect(result[0].compatibilityScore).toBe(95); // Should be sorted by score desc
      expect(result[1].compatibilityScore).toBe(70);
    });

    it('should get compatibility by MBTI type', async () => {
      await MBTICompatibility.create({
        majorId,
        mbtiType: 'INTJ',
        compatibilityScore: 95,
        description: 'High compatibility'
      });

      const result = await MajorService.getCompatibilityByMBTIType('INTJ');

      expect(result).toHaveLength(1);
      expect(result[0].mbtiType).toBe('INTJ');
      expect(result[0].compatibilityScore).toBe(95);
    });
  });

  describe('Analytics and Statistics', () => {
    beforeEach(async () => {
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
    });

    it('should get major statistics', async () => {
      const stats = await MajorService.getMajorStatistics();

      expect(stats.totalMajors).toBe(2);
      expect(stats.avgDuration).toBe(4);
      expect(stats.avgMinSalary).toBe(7500000);
      expect(stats.avgMaxSalary).toBe(65000000);
    });

    it('should get compatibility statistics', async () => {
      const major1 = await Major.findOne({ code: 'CNTT' });
      const major2 = await Major.findOne({ code: 'QTKD' });

      await MBTICompatibility.create([
        {
          majorId: major1!._id,
          mbtiType: 'INTJ',
          compatibilityScore: 95,
          description: 'High compatibility'
        },
        {
          majorId: major2!._id,
          mbtiType: 'INTJ',
          compatibilityScore: 80,
          description: 'Good compatibility'
        }
      ]);

      const stats = await MajorService.getCompatibilityStatistics();

      expect(stats).toHaveLength(1);
      expect(stats[0]._id).toBe('INTJ');
      expect(stats[0].count).toBe(2);
      expect(stats[0].avgCompatibility).toBe(87.5);
    });
  });
});