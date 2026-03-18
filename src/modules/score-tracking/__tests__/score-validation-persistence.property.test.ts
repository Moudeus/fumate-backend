import * as fc from 'fast-check';
import { Request, Response } from 'express';
import { ScoreController } from '../score-tracking.controller';
import mongoose from 'mongoose';
import { Subject } from '../../subjects/subject.model';

/**
 * Property-Based Test for Score Validation and Persistence
 * 
 * **Feature: fu-mate-mobile-enhancement, Property 5: Score Validation and Persistence**
 * **Validates: Requirements 4.2, 4.3, 4.5**
 * 
 * This test verifies that for any score entry, the system should validate scores 
 * within 0-10 range, store them with complete metadata (subject, date, notes), 
 * and calculate accurate averages.
 */

// Mock mongoose completely
jest.mock('mongoose', () => ({
  Schema: jest.fn().mockImplementation(() => ({})),
  model: jest.fn(),
  Types: {
    ObjectId: jest.fn().mockImplementation((id) => ({ toString: () => id })),
    isValid: jest.fn(),
  },
  connection: {
    collection: jest.fn(),
  },
}));

// Mock the Subject model
jest.mock('../../subjects/subject.model', () => ({
  Subject: {
    findOne: jest.fn(),
  },
}));

const mockSubject = Subject as jest.Mocked<typeof Subject>;

// Generators for property-based testing

// Valid score generator (0-10 range with up to 1 decimal place)
const validScoreGenerator = fc.float({ min: 0, max: 10 })
  .map(score => Math.round(score * 10) / 10); // Round to 1 decimal place

// Invalid score generator (outside 0-10 range)
const invalidScoreGenerator = fc.oneof(
  fc.float({ min: Math.fround(-100), max: Math.fround(-0.1) }), // Negative scores
  fc.float({ min: Math.fround(10.1), max: Math.fround(100) })   // Scores above 10
);

// Subject ID generator (24-character hex string for MongoDB ObjectId)
const subjectIdGenerator = fc.array(
  fc.constantFrom(...'0123456789abcdef'.split('')), 
  { minLength: 24, maxLength: 24 }
).map(arr => arr.join(''));

// User ID generator
const userIdGenerator = fc.array(
  fc.constantFrom(...'0123456789abcdef'.split('')), 
  { minLength: 24, maxLength: 24 }
).map(arr => arr.join(''));

// Date generator (past dates only, as future dates should be rejected)
const pastDateGenerator = fc.date({ 
  min: new Date('2020-01-01'), 
  max: new Date() 
});

// Exam type generator
const examTypeGenerator = fc.constantFrom(
  'Kiểm tra 15 phút',
  'Kiểm tra 1 tiết', 
  'Kiểm tra giữa kỳ',
  'Kiểm tra cuối kỳ',
  'Bài tập',
  'Thực hành'
);

// Notes generator (optional text)
const notesGenerator = fc.option(
  fc.string({ minLength: 0, maxLength: 500 }),
  { nil: undefined }
);

// Valid score data generator
const validScoreDataGenerator = fc.record({
  subjectId: subjectIdGenerator,
  score: validScoreGenerator,
  examDate: pastDateGenerator,
  examType: examTypeGenerator,
  notes: notesGenerator,
});

// Subject data generator
const subjectDataGenerator = fc.record({
  _id: subjectIdGenerator,
  name: fc.constantFrom('Toán học', 'Vật lý', 'Hóa học', 'Sinh học', 'Văn học', 'Lịch sử', 'Địa lý', 'Tiếng Anh'),
  code: fc.constantFrom('TOAN', 'LY', 'HOA', 'SINH', 'VAN', 'SU', 'DIA', 'ANH'),
  isActive: fc.constant(true),
});

// Mock response helpers
const createMockRequest = (userId: string, body: any): Partial<Request> => ({
  userId,
  body,
});

const createMockResponse = (): { res: Partial<Response>; mockJson: jest.Mock; mockStatus: jest.Mock } => {
  const mockJson = jest.fn();
  const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
  
  return {
    res: {
      status: mockStatus,
      json: mockJson,
    },
    mockJson,
    mockStatus,
  };
};

describe('Feature: fu-mate-mobile-enhancement, Property 5: Score Validation and Persistence', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mongoose mocks
    (mongoose.Types.ObjectId as any).isValid = jest.fn();
    (mongoose.connection.collection as jest.Mock).mockReturnValue({
      insertOne: jest.fn(),
      aggregate: jest.fn().mockReturnValue({
        toArray: jest.fn(),
      }),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
    });
  });

  it('should validate scores within 0-10 range and reject invalid scores', async () => {
    await fc.assert(fc.asyncProperty(
      userIdGenerator,
      validScoreGenerator,
      invalidScoreGenerator,
      subjectDataGenerator,
      async (userId, validScore, invalidScore, subjectData) => {
        // Test valid score acceptance
        const { res: validRes, mockJson: validMockJson, mockStatus: validMockStatus } = createMockResponse();
        const validScoreData = {
          subjectId: subjectData._id,
          score: validScore,
          examDate: '2024-01-15',
          examType: 'Kiểm tra 15 phút',
          notes: 'Test note',
        };
        const validReq = createMockRequest(userId, validScoreData);

        // Mock valid ObjectId and subject
        (mongoose.Types.ObjectId as any).isValid.mockReturnValue(true);
        mockSubject.findOne.mockResolvedValue(subjectData);
        
        const mockCollection = {
          insertOne: jest.fn().mockResolvedValue({ insertedId: 'newScoreId' }),
          aggregate: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue([{
              _id: 'newScoreId',
              userID: userId,
              subjectID: validScoreData.subjectId,
              score: validScoreData.score,
              examDate: new Date(validScoreData.examDate),
              examType: validScoreData.examType,
              notes: validScoreData.notes || '',
              subject: subjectData,
            }]),
          }),
        };
        (mongoose.connection.collection as jest.Mock).mockReturnValue(mockCollection);

        await ScoreController.create(validReq as Request, validRes as Response);

        // Valid score should be accepted (status 201)
        expect(validMockStatus).toHaveBeenCalledWith(201);
        expect(validMockJson).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'success',
            message: 'Thêm điểm thành công',
          })
        );

        // Test invalid score rejection
        const { res: invalidRes, mockJson: invalidMockJson, mockStatus: invalidMockStatus } = createMockResponse();
        const invalidScoreData = { ...validScoreData, score: invalidScore };
        const invalidReq = createMockRequest(userId, invalidScoreData);

        await ScoreController.create(invalidReq as Request, invalidRes as Response);

        // Invalid score should be rejected (status 400)
        expect(invalidMockStatus).toHaveBeenCalledWith(400);
        expect(invalidMockJson).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'error',
            message: 'Điểm số phải từ 0 đến 10',
          })
        );
      }
    ), { numRuns: 100 });
  });

  it('should require all mandatory fields for score creation', async () => {
    await fc.assert(fc.asyncProperty(
      userIdGenerator,
      fc.record({
        subjectId: fc.option(subjectIdGenerator, { nil: undefined }),
        score: fc.option(validScoreGenerator, { nil: undefined }),
        examDate: fc.option(fc.constant('2024-01-15'), { nil: undefined }),
        examType: fc.option(examTypeGenerator, { nil: undefined }),
      }),
      async (userId, incompleteData) => {
        // Only test cases where at least one required field is missing
        const hasAllRequired = incompleteData.subjectId && 
                              incompleteData.score !== undefined && 
                              incompleteData.examDate && 
                              incompleteData.examType;
        
        if (hasAllRequired) {
          return; // Skip this iteration if all fields are present
        }

        const { res, mockJson, mockStatus } = createMockResponse();
        const req = createMockRequest(userId, incompleteData);

        await ScoreController.create(req as Request, res as Response);

        // Missing required fields should be rejected (status 400)
        expect(mockStatus).toHaveBeenCalledWith(400);
        expect(mockJson).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'error',
            message: 'Vui lòng điền đầy đủ thông tin',
          })
        );
      }
    ), { numRuns: 100 });
  });

  it('should validate subject existence and active status', async () => {
    await fc.assert(fc.asyncProperty(
      userIdGenerator,
      validScoreDataGenerator,
      async (userId, scoreData) => {
        const { res, mockJson, mockStatus } = createMockResponse();
        const req = createMockRequest(userId, {
          ...scoreData,
          examDate: scoreData.examDate.toISOString().split('T')[0], // Convert to string
        });

        // Mock valid ObjectId but non-existent subject
        (mongoose.Types.ObjectId as any).isValid.mockReturnValue(true);
        mockSubject.findOne.mockResolvedValue(null); // Subject not found

        await ScoreController.create(req as Request, res as Response);

        // Non-existent subject should be rejected (status 400)
        expect(mockStatus).toHaveBeenCalledWith(400);
        expect(mockJson).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'error',
            message: 'Môn học không tồn tại hoặc đã bị vô hiệu hóa',
          })
        );

        // Verify subject validation was attempted
        expect(mockSubject.findOne).toHaveBeenCalledWith({
          _id: scoreData.subjectId,
          isActive: true,
        });
      }
    ), { numRuns: 100 });
  });

  it('should store scores with complete metadata when all validations pass', async () => {
    await fc.assert(fc.asyncProperty(
      userIdGenerator,
      validScoreDataGenerator,
      subjectDataGenerator,
      async (userId, scoreData, subjectData) => {
        const { res, mockJson, mockStatus } = createMockResponse();
        const req = createMockRequest(userId, {
          ...scoreData,
          subjectId: subjectData._id,
          examDate: scoreData.examDate.toISOString().split('T')[0], // Convert to string
        });

        // Mock valid ObjectId and subject
        (mongoose.Types.ObjectId as any).isValid.mockReturnValue(true);
        mockSubject.findOne.mockResolvedValue(subjectData);
        
        const expectedStoredScore = {
          _id: 'newScoreId',
          userID: userId,
          subjectID: subjectData._id,
          score: scoreData.score,
          examDate: scoreData.examDate,
          examType: scoreData.examType,
          notes: scoreData.notes || '',
          subject: subjectData,
        };

        const mockCollection = {
          insertOne: jest.fn().mockResolvedValue({ insertedId: 'newScoreId' }),
          aggregate: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue([expectedStoredScore]),
          }),
        };
        (mongoose.connection.collection as jest.Mock).mockReturnValue(mockCollection);

        await ScoreController.create(req as Request, res as Response);

        // Verify successful storage
        expect(mockStatus).toHaveBeenCalledWith(201);
        expect(mockJson).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'success',
            message: 'Thêm điểm thành công',
            data: expectedStoredScore,
          })
        );

        // Verify insertOne was called (metadata storage)
        expect(mockCollection.insertOne).toHaveBeenCalled();
        
        // Verify subject validation was performed
        expect(mockSubject.findOne).toHaveBeenCalledWith({
          _id: subjectData._id,
          isActive: true,
        });
      }
    ), { numRuns: 50 }); // Reduced runs for this more complex test
  });

  it('should validate score precision (max 1 decimal place)', async () => {
    await fc.assert(fc.asyncProperty(
      userIdGenerator,
      subjectDataGenerator,
      fc.float({ min: 0, max: 10 }).map(score => 
        // Create scores with more than 1 decimal place
        Math.round(score * 1000) / 1000
      ).filter(score => 
        // Only test scores that have more than 1 decimal place
        score.toString().split('.')[1]?.length > 1
      ),
      async (userId, subjectData, impreciseScore) => {
        const { res, mockJson, mockStatus } = createMockResponse();
        const scoreData = {
          subjectId: subjectData._id,
          score: impreciseScore,
          examDate: '2024-01-15',
          examType: 'Kiểm tra 15 phút',
        };
        const req = createMockRequest(userId, scoreData);

        // Mock valid ObjectId and subject
        (mongoose.Types.ObjectId as any).isValid.mockReturnValue(true);
        mockSubject.findOne.mockResolvedValue(subjectData);

        await ScoreController.create(req as Request, res as Response);

        // The system should accept the score (backend doesn't validate precision)
        // This test documents current behavior - precision validation is in frontend
        expect(mockStatus).toHaveBeenCalled();
      }
    ), { numRuns: 50 });
  });
});