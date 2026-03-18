import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Major, MBTICompatibility, IMajor, IMBTICompatibility } from '../major.model';

describe('Major Model Tests', () => {
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

  describe('Major Model', () => {
    it('should create a valid major', async () => {
      const majorData = {
        code: 'CNTT',
        name: 'Công nghệ thông tin',
        description: 'Ngành học về công nghệ thông tin',
        duration: 4,
        degreeLevel: 'Bachelor',
        careerPaths: ['Lập trình viên', 'Kỹ sư phần mềm'],
        requiredSkills: ['Lập trình', 'Tư duy logic'],
        salaryRange: { min: 8000000, max: 50000000 }
      };

      const major = new Major(majorData);
      const savedMajor = await major.save();

      expect(savedMajor._id).toBeDefined();
      expect(savedMajor.code).toBe('CNTT');
      expect(savedMajor.name).toBe('Công nghệ thông tin');
      expect(savedMajor.isActive).toBe(true);
      expect(savedMajor.createdAt).toBeDefined();
      expect(savedMajor.updatedAt).toBeDefined();
    });

    it('should enforce unique major codes', async () => {
      const majorData = {
        code: 'CNTT',
        name: 'Công nghệ thông tin',
        description: 'Ngành học về công nghệ thông tin',
        duration: 4,
        degreeLevel: 'Bachelor',
        salaryRange: { min: 8000000, max: 50000000 }
      };

      await Major.create(majorData);

      // Try to create another major with the same code
      const duplicateMajor = new Major({
        ...majorData,
        name: 'Computer Science'
      });

      await expect(duplicateMajor.save()).rejects.toThrow();
    });

    it('should validate required fields', async () => {
      const invalidMajor = new Major({});

      await expect(invalidMajor.save()).rejects.toThrow();
    });

    it('should validate salary range', async () => {
      const majorData = {
        code: 'TEST',
        name: 'Test Major',
        description: 'Test description',
        duration: 4,
        degreeLevel: 'Bachelor',
        salaryRange: { min: 50000000, max: 8000000 } // Invalid: min > max
      };

      const major = new Major(majorData);
      await expect(major.save()).rejects.toThrow('Minimum salary cannot be greater than maximum salary');
    });

    it('should validate degree level enum', async () => {
      const majorData = {
        code: 'TEST',
        name: 'Test Major',
        description: 'Test description',
        duration: 4,
        degreeLevel: 'InvalidLevel', // Invalid degree level
        salaryRange: { min: 8000000, max: 50000000 }
      };

      const major = new Major(majorData);
      await expect(major.save()).rejects.toThrow();
    });

    it('should validate duration range', async () => {
      const majorData = {
        code: 'TEST',
        name: 'Test Major',
        description: 'Test description',
        duration: 15, // Invalid: > 10
        degreeLevel: 'Bachelor',
        salaryRange: { min: 8000000, max: 50000000 }
      };

      const major = new Major(majorData);
      await expect(major.save()).rejects.toThrow();
    });
  });

  describe('MBTI Compatibility Model', () => {
    let majorId: mongoose.Types.ObjectId;

    beforeEach(async () => {
      const major = await Major.create({
        code: 'CNTT',
        name: 'Công nghệ thông tin',
        description: 'Test description',
        duration: 4,
        degreeLevel: 'Bachelor',
        salaryRange: { min: 8000000, max: 50000000 }
      });
      majorId = major._id;
    });

    it('should create a valid compatibility record', async () => {
      const compatibilityData = {
        majorId,
        mbtiType: 'INTJ',
        compatibilityScore: 95,
        description: 'INTJ fits well with IT',
        strengths: ['Logic', 'Problem solving'],
        challenges: ['Communication'],
        careerExamples: ['Software Engineer', 'System Architect']
      };

      const compatibility = new MBTICompatibility(compatibilityData);
      const savedCompatibility = await compatibility.save();

      expect(savedCompatibility._id).toBeDefined();
      expect(savedCompatibility.mbtiType).toBe('INTJ');
      expect(savedCompatibility.compatibilityScore).toBe(95);
      expect(savedCompatibility.isActive).toBe(true);
    });

    it('should enforce unique major-MBTI combination', async () => {
      const compatibilityData = {
        majorId,
        mbtiType: 'INTJ',
        compatibilityScore: 95,
        description: 'Test description'
      };

      await MBTICompatibility.create(compatibilityData);

      // Try to create another compatibility for the same major-MBTI combination
      const duplicateCompatibility = new MBTICompatibility(compatibilityData);
      await expect(duplicateCompatibility.save()).rejects.toThrow();
    });

    it('should validate MBTI type format', async () => {
      const compatibilityData = {
        majorId,
        mbtiType: 'INVALID', // Invalid MBTI type
        compatibilityScore: 95,
        description: 'Test description'
      };

      const compatibility = new MBTICompatibility(compatibilityData);
      await expect(compatibility.save()).rejects.toThrow();
    });

    it('should validate compatibility score range', async () => {
      const compatibilityData = {
        majorId,
        mbtiType: 'INTJ',
        compatibilityScore: 150, // Invalid: > 100
        description: 'Test description'
      };

      const compatibility = new MBTICompatibility(compatibilityData);
      await expect(compatibility.save()).rejects.toThrow();
    });

    it('should validate required fields', async () => {
      const invalidCompatibility = new MBTICompatibility({});
      await expect(invalidCompatibility.save()).rejects.toThrow();
    });
  });

  describe('Static Methods', () => {
    let majorId: mongoose.Types.ObjectId;

    beforeEach(async () => {
      const major = await Major.create({
        code: 'CNTT',
        name: 'Công nghệ thông tin',
        description: 'Test description',
        duration: 4,
        degreeLevel: 'Bachelor',
        salaryRange: { min: 8000000, max: 50000000 }
      });
      majorId = major._id;

      await MBTICompatibility.create({
        majorId,
        mbtiType: 'INTJ',
        compatibilityScore: 95,
        description: 'High compatibility'
      });
    });

    it('should get majors by MBTI compatibility', async () => {
      const majors = await (Major as any).getMajorsByMBTICompatibility('INTJ', 5);
      
      expect(majors).toHaveLength(1);
      expect(majors[0].compatibilityScore).toBe(95);
      expect(majors[0].name).toBe('Công nghệ thông tin');
    });

    it('should get compatibility by major and type', async () => {
      const compatibility = await (MBTICompatibility as any).getCompatibilityByMajorAndType(
        majorId.toString(),
        'INTJ'
      );
      
      expect(compatibility).toBeTruthy();
      expect(compatibility.mbtiType).toBe('INTJ');
      expect(compatibility.compatibilityScore).toBe(95);
    });

    it('should return null for non-existent compatibility', async () => {
      const compatibility = await (MBTICompatibility as any).getCompatibilityByMajorAndType(
        majorId.toString(),
        'ENFP'
      );
      
      expect(compatibility).toBeNull();
    });
  });
});