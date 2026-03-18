import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import UniversityService from '../university.service';
import { University, AdmissionRequirement } from '../university.model';
import { Major } from '../../majors/major.model';
import { Sector } from '../sector.model';
import { Subject } from '../../subjects/subject.model';
import User from '../../users/user.model';

describe('UniversityService', () => {
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
    // Clear all collections
    await University.deleteMany({});
    await Major.deleteMany({});
    await AdmissionRequirement.deleteMany({});
    await Sector.deleteMany({});
    await Subject.deleteMany({});
    await User.deleteMany({});
  });

  describe('getUniversities', () => {
    it('should return paginated universities', async () => {
      // Create test data
      const university = new University({
        name: 'Test University',
        code: 'TU001',
        logo: 'test-logo.png',
        website: 'https://test.edu.vn',
        location: { city: 'Ho Chi Minh', region: 'South' },
        admissionMethods: ['Thi THPT'],
        strengths: ['Engineering', 'Technology'],
        majors: []
      });
      await university.save();

      const result = await UniversityService.getUniversities({ page: 1, limit: 10 });

      expect(result.universities).toHaveLength(1);
      expect(result.universities[0].name).toBe('Test University');
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should filter universities by search term', async () => {
      // Create test universities
      const university1 = new University({
        name: 'Ho Chi Minh University',
        code: 'HCMU001',
        logo: 'hcmu-logo.png',
        website: 'https://hcmu.edu.vn',
        location: { city: 'Ho Chi Minh', region: 'South' },
        admissionMethods: ['Thi THPT'],
        strengths: ['Medicine'],
        majors: []
      });

      const university2 = new University({
        name: 'Hanoi University',
        code: 'HU001',
        logo: 'hu-logo.png',
        website: 'https://hu.edu.vn',
        location: { city: 'Hanoi', region: 'North' },
        admissionMethods: ['Thi THPT'],
        strengths: ['Law'],
        majors: []
      });

      await university1.save();
      await university2.save();

      const result = await UniversityService.getUniversities({ 
        page: 1, 
        limit: 10, 
        search: 'Ho Chi Minh' 
      });

      expect(result.universities).toHaveLength(1);
      expect(result.universities[0].name).toBe('Ho Chi Minh University');
    });

    it('should filter universities by major', async () => {
      // Create test major
      const major = new Major({
        name: 'Computer Science',
        code: 'CS001',
        description: 'Computer Science program',
        careerProspects: ['Software Engineer', 'Data Scientist'],
        universities: []
      });
      await major.save();

      // Create test university with the major
      const university = new University({
        name: 'Tech University',
        code: 'TECH001',
        logo: 'tech-logo.png',
        website: 'https://tech.edu.vn',
        location: { city: 'Ho Chi Minh', region: 'South' },
        admissionMethods: ['Thi THPT'],
        strengths: ['Technology'],
        majors: [major._id]
      });
      await university.save();

      const result = await UniversityService.getUniversities({ 
        page: 1, 
        limit: 10, 
        majorId: major._id.toString() 
      });

      expect(result.universities).toHaveLength(1);
      expect(result.universities[0].name).toBe('Tech University');
    });
  });

  describe('getUniversityById', () => {
    it('should return university by valid ID', async () => {
      const university = new University({
        name: 'Test University',
        code: 'TU001',
        logo: 'test-logo.png',
        website: 'https://test.edu.vn',
        location: { city: 'Ho Chi Minh', region: 'South' },
        admissionMethods: ['Thi THPT'],
        strengths: ['Engineering'],
        majors: []
      });
      await university.save();

      const result = await UniversityService.getUniversityById(university._id.toString());

      expect(result.name).toBe('Test University');
      expect(result.code).toBe('TU001');
    });

    it('should throw error for invalid ID', async () => {
      await expect(UniversityService.getUniversityById('invalid-id'))
        .rejects.toThrow('Invalid university ID');
    });

    it('should throw error for non-existent university', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      await expect(UniversityService.getUniversityById(nonExistentId))
        .rejects.toThrow('University not found');
    });
  });

  describe('getUniversitiesByMajor', () => {
    it('should return universities offering specific major', async () => {
      // Create test major
      const major = new Major({
        name: 'Computer Science',
        code: 'CS001',
        description: 'Computer Science program',
        careerProspects: ['Software Engineer'],
        universities: []
      });
      await major.save();

      // Create universities
      const university1 = new University({
        name: 'Tech University 1',
        code: 'TECH001',
        logo: 'tech1-logo.png',
        website: 'https://tech1.edu.vn',
        location: { city: 'Ho Chi Minh', region: 'South' },
        admissionMethods: ['Thi THPT'],
        strengths: ['Technology'],
        majors: [major._id]
      });

      const university2 = new University({
        name: 'Tech University 2',
        code: 'TECH002',
        logo: 'tech2-logo.png',
        website: 'https://tech2.edu.vn',
        location: { city: 'Hanoi', region: 'North' },
        admissionMethods: ['Thi THPT'],
        strengths: ['Technology'],
        majors: [major._id]
      });

      const university3 = new University({
        name: 'Medical University',
        code: 'MED001',
        logo: 'med-logo.png',
        website: 'https://med.edu.vn',
        location: { city: 'Ho Chi Minh', region: 'South' },
        admissionMethods: ['Thi THPT'],
        strengths: ['Medicine'],
        majors: [] // No CS major
      });

      await university1.save();
      await university2.save();
      await university3.save();

      const result = await UniversityService.getUniversitiesByMajor(major._id.toString());

      expect(result.universities).toHaveLength(2);
      expect(result.universities.map(u => u.name)).toContain('Tech University 1');
      expect(result.universities.map(u => u.name)).toContain('Tech University 2');
      expect(result.universities.map(u => u.name)).not.toContain('Medical University');
    });

    it('should throw error for invalid major ID', async () => {
      await expect(UniversityService.getUniversitiesByMajor('invalid-id'))
        .rejects.toThrow('Invalid major ID');
    });
  });

  describe('calculateAdmissionProbability', () => {
    it('should calculate admission probability correctly', async () => {
      // Create test subjects
      const subject1 = new Subject({ name: 'Toán', code: 'TOAN', description: 'Mathematics' });
      const subject2 = new Subject({ name: 'Lý', code: 'LY', description: 'Physics' });
      const subject3 = new Subject({ name: 'Hóa', code: 'HOA', description: 'Chemistry' });
      await subject1.save();
      await subject2.save();
      await subject3.save();

      // Create test sector
      const sector = new Sector({
        name: 'Khối A00',
        code: 'A00',
        description: 'Toán - Lý - Hóa',
        subjects: [subject1._id, subject2._id, subject3._id]
      });
      await sector.save();

      // Create test major
      const major = new Major({
        name: 'Computer Science',
        code: 'CS001',
        description: 'Computer Science program',
        careerProspects: ['Software Engineer'],
        universities: []
      });
      await major.save();

      // Create test university
      const university = new University({
        name: 'Tech University',
        code: 'TECH001',
        logo: 'tech-logo.png',
        website: 'https://tech.edu.vn',
        location: { city: 'Ho Chi Minh', region: 'South' },
        admissionMethods: ['Thi THPT'],
        strengths: ['Technology'],
        majors: [major._id]
      });
      await university.save();

      // Create admission requirement
      const admissionReq = new AdmissionRequirement({
        universityId: university._id,
        majorId: major._id,
        sectorId: sector._id,
        minimumScore: 24, // 8+8+8 = 24
        academicYear: 2024
      });
      await admissionReq.save();

      // Test with high scores (should get high probability)
      const highScores = {
        [subject1._id.toString()]: 9,
        [subject2._id.toString()]: 9,
        [subject3._id.toString()]: 8
      };

      const highResult = await UniversityService.calculateAdmissionProbability(
        university._id.toString(),
        major._id.toString(),
        highScores
      );

      expect(highResult.hasResults).toBe(true);
      expect(highResult.bestResult?.probability).toBe('high');
      expect(highResult.bestResult?.message).toBe('Khả năng đỗ cao');

      // Test with low scores (should get low probability)
      const lowScores = {
        [subject1._id.toString()]: 6,
        [subject2._id.toString()]: 6,
        [subject3._id.toString()]: 6
      };

      const lowResult = await UniversityService.calculateAdmissionProbability(
        university._id.toString(),
        major._id.toString(),
        lowScores
      );

      expect(lowResult.hasResults).toBe(true);
      expect(lowResult.bestResult?.probability).toBe('low');
      expect(lowResult.bestResult?.message).toBe('Cần cố gắng');
    });

    it('should handle missing scores gracefully', async () => {
      // Create test data similar to above but with incomplete scores
      const subject1 = new Subject({ name: 'Toán', code: 'TOAN' });
      await subject1.save();

      const major = new Major({
        name: 'Computer Science',
        code: 'CS001',
        description: 'Computer Science program',
        careerProspects: ['Software Engineer'],
        universities: []
      });
      await major.save();

      const university = new University({
        name: 'Tech University',
        code: 'TECH001',
        logo: 'tech-logo.png',
        website: 'https://tech.edu.vn',
        location: { city: 'Ho Chi Minh', region: 'South' },
        admissionMethods: ['Thi THPT'],
        strengths: ['Technology'],
        majors: [major._id]
      });
      await university.save();

      const incompleteScores = {
        [subject1._id.toString()]: 8
        // Missing other subjects
      };

      const result = await UniversityService.calculateAdmissionProbability(
        university._id.toString(),
        major._id.toString(),
        incompleteScores
      );

      // Should return a result but with no valid calculations
      expect(result.hasResults).toBe(false);
    });
  });

  describe('Favorites functionality', () => {
    let testUser: any;
    let testUniversity: any;

    beforeEach(async () => {
      // Create test user
      testUser = new User({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        favoriteUniversities: []
      });
      await testUser.save();

      // Create test university
      testUniversity = new University({
        name: 'Test University',
        code: 'TU001',
        logo: 'test-logo.png',
        website: 'https://test.edu.vn',
        location: { city: 'Ho Chi Minh', region: 'South' },
        admissionMethods: ['Thi THPT'],
        strengths: ['Engineering'],
        majors: []
      });
      await testUniversity.save();
    });

    it('should add university to favorites successfully', async () => {
      const result = await UniversityService.addToFavorites(
        testUser._id.toString(),
        testUniversity._id.toString()
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('University added to favorites');

      // Verify user's favorites were updated
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser?.favoriteUniversities).toContainEqual(testUniversity._id);
    });

    it('should throw error when university not found for favorites', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      
      await expect(UniversityService.addToFavorites(testUser._id.toString(), nonExistentId))
        .rejects.toThrow('University not found');
    });

    it('should throw error when user not found for favorites', async () => {
      const nonExistentUserId = new mongoose.Types.ObjectId().toString();
      
      await expect(UniversityService.addToFavorites(nonExistentUserId, testUniversity._id.toString()))
        .rejects.toThrow('User not found');
    });

    it('should remove university from favorites successfully', async () => {
      // First add to favorites
      await UniversityService.addToFavorites(
        testUser._id.toString(),
        testUniversity._id.toString()
      );

      // Then remove
      const result = await UniversityService.removeFromFavorites(
        testUser._id.toString(),
        testUniversity._id.toString()
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('University removed from favorites');

      // Verify user's favorites were updated
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser?.favoriteUniversities).not.toContainEqual(testUniversity._id);
    });

    it('should get favorite universities successfully', async () => {
      // Add university to favorites
      await UniversityService.addToFavorites(
        testUser._id.toString(),
        testUniversity._id.toString()
      );

      const result = await UniversityService.getFavoriteUniversities(testUser._id.toString(), {
        page: 1,
        limit: 10
      });

      expect(result.universities).toHaveLength(1);
      expect(result.universities[0].name).toBe('Test University');
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should return empty list when user has no favorites', async () => {
      const result = await UniversityService.getFavoriteUniversities(testUser._id.toString());

      expect(result.universities).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it('should filter favorite universities by search', async () => {
      // Create another university
      const university2 = new University({
        name: 'Another University',
        code: 'AU001',
        logo: 'au-logo.png',
        website: 'https://au.edu.vn',
        location: { city: 'Hanoi', region: 'North' },
        admissionMethods: ['Thi THPT'],
        strengths: ['Medicine'],
        majors: []
      });
      await university2.save();

      // Add both to favorites
      await UniversityService.addToFavorites(testUser._id.toString(), testUniversity._id.toString());
      await UniversityService.addToFavorites(testUser._id.toString(), university2._id.toString());

      // Search for specific university
      const result = await UniversityService.getFavoriteUniversities(testUser._id.toString(), {
        page: 1,
        limit: 10,
        search: 'Test'
      });

      expect(result.universities).toHaveLength(1);
      expect(result.universities[0].name).toBe('Test University');
    });

    it('should check if university is favorite correctly', async () => {
      // Initially not favorite
      let isFavorite = await UniversityService.isFavorite(
        testUser._id.toString(),
        testUniversity._id.toString()
      );
      expect(isFavorite).toBe(false);

      // Add to favorites
      await UniversityService.addToFavorites(
        testUser._id.toString(),
        testUniversity._id.toString()
      );

      // Now should be favorite
      isFavorite = await UniversityService.isFavorite(
        testUser._id.toString(),
        testUniversity._id.toString()
      );
      expect(isFavorite).toBe(true);
    });

    it('should return false when user not found for favorite check', async () => {
      const nonExistentUserId = new mongoose.Types.ObjectId().toString();
      
      const result = await UniversityService.isFavorite(
        nonExistentUserId,
        testUniversity._id.toString()
      );

      expect(result).toBe(false);
    });

    it('should throw error for invalid user ID in favorites', async () => {
      await expect(UniversityService.addToFavorites('invalid-id', testUniversity._id.toString()))
        .rejects.toThrow('Invalid user or university ID');
    });

    it('should throw error for invalid university ID in favorites', async () => {
      await expect(UniversityService.addToFavorites(testUser._id.toString(), 'invalid-id'))
        .rejects.toThrow('Invalid user or university ID');
    });

    it('should handle duplicate favorites gracefully', async () => {
      // Add to favorites twice
      await UniversityService.addToFavorites(
        testUser._id.toString(),
        testUniversity._id.toString()
      );
      
      const result = await UniversityService.addToFavorites(
        testUser._id.toString(),
        testUniversity._id.toString()
      );

      expect(result.success).toBe(true);

      // Should still only have one instance
      const user = await User.findById(testUser._id);
      const favoriteCount = user?.favoriteUniversities.filter(
        (id: any) => id.toString() === testUniversity._id.toString()
      ).length;
      expect(favoriteCount).toBe(1);
    });
  });
});