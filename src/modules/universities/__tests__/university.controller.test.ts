import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import universityRoutes from '../university.route';
import { University, AdmissionRequirement } from '../university.model';
import { Major } from '../../majors/major.model';
import { Sector } from '../sector.model';
import { Subject } from '../../subjects/subject.model';

const app = express();
app.use(express.json());
app.use('/api/v1/universities', universityRoutes);

describe('University Controller', () => {
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
  });

  describe('GET /api/v1/universities', () => {
    it('should return paginated universities', async () => {
      // Create test university
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

      const response = await request(app)
        .get('/api/v1/universities')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.items[0].name).toBe('Test University');
      expect(response.body.data.pagination.total).toBe(1);
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

      const response = await request(app)
        .get('/api/v1/universities?search=Ho Chi Minh')
        .expect(200);

      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.items[0].name).toBe('Ho Chi Minh University');
    });

    it('should filter universities by major', async () => {
      // Create test major
      const major = new Major({
        name: 'Computer Science',
        code: 'CS001',
        description: 'Computer Science program',
        careerProspects: ['Software Engineer'],
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

      const response = await request(app)
        .get(`/api/v1/universities?majorId=${major._id}`)
        .expect(200);

      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.items[0].name).toBe('Tech University');
    });
  });

  describe('GET /api/v1/universities/:id', () => {
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

      const response = await request(app)
        .get(`/api/v1/universities/${university._id}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.name).toBe('Test University');
      expect(response.body.data.code).toBe('TU001');
    });

    it('should return 400 for invalid ID', async () => {
      const response = await request(app)
        .get('/api/v1/universities/invalid-id')
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('ID không hợp lệ');
    });

    it('should return 404 for non-existent university', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/v1/universities/${nonExistentId}`)
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Không tìm thấy trường đại học');
    });
  });

  describe('GET /api/v1/universities/majors/:majorId/universities', () => {
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

      const response = await request(app)
        .get(`/api/v1/universities/majors/${major._id}/universities`)
        .expect(200);

      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.items[0].name).toBe('Tech University 1');
    });

    it('should return 400 for invalid major ID', async () => {
      const response = await request(app)
        .get('/api/v1/universities/majors/invalid-id/universities')
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('ID ngành không hợp lệ');
    });
  });

  describe('GET /api/v1/universities/sectors', () => {
    it('should return all sectors', async () => {
      // Create test subjects
      const subject1 = new Subject({ name: 'Toán', code: 'TOAN' });
      const subject2 = new Subject({ name: 'Lý', code: 'LY' });
      const subject3 = new Subject({ name: 'Hóa', code: 'HOA' });
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

      const response = await request(app)
        .get('/api/v1/universities/sectors')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Khối A00');
      expect(response.body.data[0].code).toBe('A00');
    });
  });

  describe('GET /api/v1/universities/:id/requirements', () => {
    it('should return admission requirements for university', async () => {
      // Create test data
      const subject1 = new Subject({ name: 'Toán', code: 'TOAN' });
      const subject2 = new Subject({ name: 'Lý', code: 'LY' });
      const subject3 = new Subject({ name: 'Hóa', code: 'HOA' });
      await subject1.save();
      await subject2.save();
      await subject3.save();

      const sector = new Sector({
        name: 'Khối A00',
        code: 'A00',
        description: 'Toán - Lý - Hóa',
        subjects: [subject1._id, subject2._id, subject3._id]
      });
      await sector.save();

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

      const admissionReq = new AdmissionRequirement({
        universityId: university._id,
        majorId: major._id,
        sectorId: sector._id,
        minimumScore: 24,
        academicYear: 2024
      });
      await admissionReq.save();

      const response = await request(app)
        .get(`/api/v1/universities/${university._id}/requirements`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].minimumScore).toBe(24);
      expect(response.body.data[0].academicYear).toBe(2024);
    });

    it('should return 400 for invalid university ID', async () => {
      const response = await request(app)
        .get('/api/v1/universities/invalid-id/requirements')
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('ID trường không hợp lệ');
    });
  });

  describe('GET /api/v1/universities/majors/list', () => {
    it('should return all majors', async () => {
      const major = new Major({
        name: 'Computer Science',
        code: 'CS001',
        description: 'Computer Science program',
        careerProspects: ['Software Engineer'],
        universities: []
      });
      await major.save();

      const response = await request(app)
        .get('/api/v1/universities/majors/list')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.items[0].name).toBe('Computer Science');
    });
  });
});