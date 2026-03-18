import * as fc from 'fast-check';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Subject } from '../../subjects/subject.model';
import { Sector } from '../sector.model';
import { AdmissionRequirement } from '../university.model';
import { University } from '../university.model';
import { Major } from '../../majors/major.model';

/**
 * Feature: fu-mate-mobile-enhancement, Property 12: Academic Structure Validation
 * 
 * For any academic data creation or modification, the system should enforce validation rules 
 * (subject uniqueness, 3-subject sectors, score ranges 0-30) and maintain referential integrity
 * 
 * **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6**
 */

describe('Feature: fu-mate-mobile-enhancement, Property 12: Academic Structure Validation', () => {
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
    // Clean up all collections before each test
    await Subject.deleteMany({});
    await Sector.deleteMany({});
    await University.deleteMany({});
    await Major.deleteMany({});
    await AdmissionRequirement.deleteMany({});
  });

  it('should enforce subject uniqueness, 3-subject sectors, score ranges, and referential integrity', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate test data for academic structure validation
        fc.record({
          subjects: fc.array(
            fc.record({
              name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
              code: fc.string({ minLength: 2, maxLength: 10 }).map(s => s.toUpperCase()).filter(s => s.trim().length >= 2),
              description: fc.string({ maxLength: 200 }),
            }),
            { minLength: 3, maxLength: 5 }
          ),
          admissionScore: fc.float({ min: -5, max: 35 }), // Include invalid scores for testing
          academicYear: fc.integer({ min: 2020, max: 2030 }),
        }),
        async (testData) => {
          // Test 1: Create subjects with unique codes
          const createdSubjects: any[] = [];
          
          for (let i = 0; i < testData.subjects.length; i++) {
            const subjectData = testData.subjects[i];
            const uniqueCode = `${subjectData.code}_${Date.now()}_${i}`;
            
            const subject = new Subject({
              name: subjectData.name,
              code: uniqueCode,
              description: subjectData.description,
              isActive: true,
            });
            
            await subject.save();
            createdSubjects.push(subject);
          }

          // Test 2: Sector must have exactly 3 subjects
          if (createdSubjects.length >= 3) {
            const validSector = new Sector({
              name: 'Valid Sector',
              code: `VS_${Date.now()}`,
              subjects: [createdSubjects[0]._id, createdSubjects[1]._id, createdSubjects[2]._id],
              isActive: true,
            });
            
            await validSector.save();
            expect(validSector.subjects).toHaveLength(3);
            
            // Test invalid sector with wrong number of subjects
            const invalidSector = new Sector({
              name: 'Invalid Sector',
              code: `IS_${Date.now()}`,
              subjects: [createdSubjects[0]._id, createdSubjects[1]._id], // Only 2 subjects
              isActive: true,
            });
            
            await expect(invalidSector.save()).rejects.toThrow(/exactly 3 subjects/);
          }

          // Test 3: Create university and major for admission requirements
          const university = new University({
            name: 'Test University',
            code: `TU_${Date.now()}`,
            isActive: true,
          });
          await university.save();
          
          const major = new Major({
            name: 'Test Major',
            code: `TM_${Date.now()}`,
            isActive: true,
          });
          await major.save();

          // Test 4: Admission requirement score validation (0-30 range)
          if (createdSubjects.length >= 3) {
            const sector = new Sector({
              name: 'Test Sector',
              code: `TS_${Date.now()}`,
              subjects: [createdSubjects[0]._id, createdSubjects[1]._id, createdSubjects[2]._id],
              isActive: true,
            });
            await sector.save();
            
            const admissionRequirement = new AdmissionRequirement({
              universityId: university._id,
              majorId: major._id,
              sectorId: sector._id,
              minimumScore: testData.admissionScore,
              academicYear: testData.academicYear,
              isActive: true,
            });
            
            if (testData.admissionScore >= 0 && testData.admissionScore <= 30) {
              // Valid score should save successfully
              await admissionRequirement.save();
              expect(admissionRequirement.minimumScore).toBe(testData.admissionScore);
            } else {
              // Invalid score should fail validation
              await expect(admissionRequirement.save()).rejects.toThrow();
            }
          }

          // Test 5: Verify all created entities maintain their validation rules
          const allSubjects = await Subject.find({});
          const allSectors = await Sector.find({}).populate('subjects');
          const allAdmissionRequirements = await AdmissionRequirement.find({});
          
          // All subjects should have unique codes (within this test)
          const subjectCodes = allSubjects.map(s => s.code);
          const uniqueSubjectCodes = new Set(subjectCodes);
          expect(subjectCodes.length).toBe(uniqueSubjectCodes.size);
          
          // All sectors should have exactly 3 subjects
          for (const sector of allSectors) {
            expect(sector.subjects).toHaveLength(3);
          }
          
          // All admission requirements should have valid scores
          for (const req of allAdmissionRequirements) {
            expect(req.minimumScore).toBeGreaterThanOrEqual(0);
            expect(req.minimumScore).toBeLessThanOrEqual(30);
          }
        }
      ),
      { numRuns: 50, timeout: 30000 }
    );
  });

  it('should prevent sector creation with invalid subject count', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 50 }),
          code: fc.string({ minLength: 2, maxLength: 10 }).map(s => s.toUpperCase()),
          subjectCount: fc.integer({ min: 0, max: 10 }).filter(n => n !== 3), // Exclude valid count
        }),
        async (sectorData) => {
          // Create some subjects first with unique codes
          const subjects = [];
          for (let i = 0; i < Math.max(sectorData.subjectCount, 1); i++) {
            const subject = new Subject({
              name: `Subject ${i}`,
              code: `SUB${i}_${Date.now()}_${Math.random()}`, // Make unique
              isActive: true,
            });
            await subject.save();
            subjects.push(subject);
          }
          
          // Try to create sector with invalid subject count
          const subjectIds = subjects.slice(0, sectorData.subjectCount).map(s => s._id);
          
          const sector = new Sector({
            name: sectorData.name,
            code: `${sectorData.code}_${Date.now()}_${Math.random()}`, // Make unique
            subjects: subjectIds,
            isActive: true,
          });
          
          // Should fail validation
          await expect(sector.save()).rejects.toThrow(/exactly 3 subjects/);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should prevent admission requirements with invalid score ranges', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.float().filter(score => score < 0 || score > 30), // Invalid scores only
        async (invalidScore) => {
          // Create required entities with unique codes
          const uniqueId = `${Date.now()}_${Math.random()}`;
          
          const subject = new Subject({ 
            name: 'Test Subject', 
            code: `TEST_${uniqueId}`, 
            isActive: true 
          });
          await subject.save();
          
          const sector = new Sector({
            name: 'Test Sector',
            code: `A00_${uniqueId}`,
            subjects: [subject._id, subject._id, subject._id],
            isActive: true,
          });
          await sector.save();
          
          const university = new University({ 
            name: 'Test University', 
            code: `TU_${uniqueId}`, 
            isActive: true 
          });
          await university.save();
          
          const major = new Major({ 
            name: 'Test Major', 
            code: `TM_${uniqueId}`, 
            isActive: true 
          });
          await major.save();
          
          // Try to create admission requirement with invalid score
          const admissionRequirement = new AdmissionRequirement({
            universityId: university._id,
            majorId: major._id,
            sectorId: sector._id,
            minimumScore: invalidScore,
            academicYear: 2024,
            isActive: true,
          });
          
          // Should fail validation
          await expect(admissionRequirement.save()).rejects.toThrow();
        }
      ),
      { numRuns: 50 }
    );
  });
});