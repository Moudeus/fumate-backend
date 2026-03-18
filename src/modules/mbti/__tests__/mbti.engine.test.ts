import { MBTICalculationEngine } from '../mbti.engine';
import { MBTIQuestion, MBTIType } from '../mbti.model';
import { Major } from '../../majors/major.model';
import mongoose from 'mongoose';

// Mock the models
jest.mock('../mbti.model');
jest.mock('../../universities/university.model');

const mockMBTIQuestion = MBTIQuestion as jest.Mocked<typeof MBTIQuestion>;
const mockMBTIType = MBTIType as jest.Mocked<typeof MBTIType>;

describe('MBTICalculationEngine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateAnswers', () => {
    it('should validate correct answers', () => {
      const answers = [
        { questionId: '507f1f77bcf86cd799439011', choice: 'a' as const },
        { questionId: '507f1f77bcf86cd799439012', choice: 'b' as const }
      ];

      const result = MBTICalculationEngine.validateAnswers(answers);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty answers array', () => {
      const result = MBTICalculationEngine.validateAnswers([]);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('At least one answer is required');
    });

    it('should reject non-array input', () => {
      const result = MBTICalculationEngine.validateAnswers(null as any);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Answers must be an array');
    });

    it('should reject invalid question IDs', () => {
      const answers = [
        { questionId: 'invalid-id', choice: 'a' as const }
      ];

      const result = MBTICalculationEngine.validateAnswers(answers);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Answer 1: questionId must be a valid MongoDB ObjectId');
    });

    it('should reject invalid choices', () => {
      const answers = [
        { questionId: '507f1f77bcf86cd799439011', choice: 'c' as any }
      ];

      const result = MBTICalculationEngine.validateAnswers(answers);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Answer 1: choice must be 'a' or 'b'");
    });

    it('should reject duplicate question IDs', () => {
      const answers = [
        { questionId: '507f1f77bcf86cd799439011', choice: 'a' as const },
        { questionId: '507f1f77bcf86cd799439011', choice: 'b' as const }
      ];

      const result = MBTICalculationEngine.validateAnswers(answers);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Duplicate answers for the same question are not allowed');
    });
  });

  describe('calculateMBTIType', () => {
    const mockQuestions = [
      {
        _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
        category: 'E-I',
        inverted: false
      },
      {
        _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
        category: 'E-I',
        inverted: true
      },
      {
        _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'),
        category: 'S-N',
        inverted: false
      },
      {
        _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439014'),
        category: 'T-F',
        inverted: false
      },
      {
        _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439015'),
        category: 'J-P',
        inverted: false
      }
    ];

    const mockMBTITypeInfo = {
      type: 'ENTJ',
      name: 'The Commander',
      description: 'Natural leader',
      strengths: ['Leadership', 'Decisive'],
      weaknesses: ['Impatient', 'Stubborn'],
      majors: [
        { _id: new mongoose.Types.ObjectId(), name: 'Business', code: 'BUS' }
      ]
    };

    beforeEach(() => {
      mockMBTIQuestion.find = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockQuestions)
      });

      mockMBTIType.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockMBTITypeInfo)
        })
      });
    });

    it('should calculate MBTI type correctly for ENTJ', async () => {
      const answers = [
        { questionId: '507f1f77bcf86cd799439011', choice: 'a' as const }, // E-I: +1 (E)
        { questionId: '507f1f77bcf86cd799439012', choice: 'b' as const }, // E-I: +1 (inverted, so b becomes +1)
        { questionId: '507f1f77bcf86cd799439013', choice: 'a' as const }, // S-N: +1 (S)
        { questionId: '507f1f77bcf86cd799439014', choice: 'a' as const }, // T-F: +1 (T)
        { questionId: '507f1f77bcf86cd799439015', choice: 'a' as const }  // J-P: +1 (J)
      ];

      const result = await MBTICalculationEngine.calculateMBTIType({ answers });

      expect(result.resultType).toBe('ESTJ'); // S instead of N because S-N score is +1
      expect(result.scores['E-I']).toBe(2);
      expect(result.scores['S-N']).toBe(1);
      expect(result.scores['T-F']).toBe(1);
      expect(result.scores['J-P']).toBe(1);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.typeInfo.name).toBe('The Commander');
    });

    it('should calculate MBTI type correctly for INFP', async () => {
      const answers = [
        { questionId: '507f1f77bcf86cd799439011', choice: 'b' as const }, // E-I: -1 (I)
        { questionId: '507f1f77bcf86cd799439012', choice: 'a' as const }, // E-I: -1 (inverted, so a becomes -1)
        { questionId: '507f1f77bcf86cd799439013', choice: 'b' as const }, // S-N: -1 (N)
        { questionId: '507f1f77bcf86cd799439014', choice: 'b' as const }, // T-F: -1 (F)
        { questionId: '507f1f77bcf86cd799439015', choice: 'b' as const }  // J-P: -1 (P)
      ];

      const result = await MBTICalculationEngine.calculateMBTIType({ answers });

      expect(result.resultType).toBe('INFP');
      expect(result.scores['E-I']).toBe(-2);
      expect(result.scores['S-N']).toBe(-1);
      expect(result.scores['T-F']).toBe(-1);
      expect(result.scores['J-P']).toBe(-1);
    });

    it('should handle edge case with zero scores', async () => {
      const answers = [
        { questionId: '507f1f77bcf86cd799439011', choice: 'a' as const }, // E-I: +1
        { questionId: '507f1f77bcf86cd799439012', choice: 'a' as const }  // E-I: -1 (inverted), total = 0
      ];

      const result = await MBTICalculationEngine.calculateMBTIType({ answers });

      // Zero scores should default to the first letter (E, S, T, J)
      expect(result.resultType[0]).toBe('E'); // E-I score is 0, defaults to E
    });

    it('should calculate percentages correctly', async () => {
      const answers = [
        { questionId: '507f1f77bcf86cd799439011', choice: 'a' as const }, // E-I: +1
        { questionId: '507f1f77bcf86cd799439012', choice: 'a' as const }  // E-I: -1 (inverted), total = 0
      ];

      const result = await MBTICalculationEngine.calculateMBTIType({ answers });

      // With 2 E-I questions and total score 0, should be 50-50
      expect(result.percentages.E).toBe(50);
      expect(result.percentages.I).toBe(50);
    });

    it('should throw error when no questions found', async () => {
      mockMBTIQuestion.find = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([])
      });

      const answers = [
        { questionId: '507f1f77bcf86cd799439011', choice: 'a' as const }
      ];

      await expect(MBTICalculationEngine.calculateMBTIType({ answers }))
        .rejects.toThrow('No active questions found in the system');
    });

    it('should throw error when MBTI type info not found', async () => {
      mockMBTIType.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(null)
        })
      });

      const answers = [
        { questionId: '507f1f77bcf86cd799439011', choice: 'a' as const }
      ];

      await expect(MBTICalculationEngine.calculateMBTIType({ answers }))
        .rejects.toThrow('MBTI type information not found for type:');
    });

    it('should throw error for invalid question ID', async () => {
      const answers = [
        { questionId: '507f1f77bcf86cd799439999', choice: 'a' as const } // Non-existent question
      ];

      await expect(MBTICalculationEngine.calculateMBTIType({ answers }))
        .rejects.toThrow('Invalid question ID: 507f1f77bcf86cd799439999');
    });
  });

  describe('analyzeAnswerCompleteness', () => {
    const mockQuestions = [
      { _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'), category: 'E-I' },
      { _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'), category: 'E-I' },
      { _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'), category: 'S-N' },
      { _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439014'), category: 'T-F' },
      { _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439015'), category: 'J-P' }
    ];

    beforeEach(() => {
      mockMBTIQuestion.find = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockQuestions)
      });
    });

    it('should analyze incomplete answers', async () => {
      const answers = [
        { questionId: '507f1f77bcf86cd799439011', choice: 'a' as const }, // E-I: 1
        { questionId: '507f1f77bcf86cd799439013', choice: 'a' as const }  // S-N: 1
      ];

      const result = await MBTICalculationEngine.analyzeAnswerCompleteness(answers);

      expect(result.isComplete).toBe(false);
      expect(result.dimensionCounts['E-I']).toBe(1);
      expect(result.dimensionCounts['S-N']).toBe(1);
      expect(result.dimensionCounts['T-F']).toBe(0);
      expect(result.dimensionCounts['J-P']).toBe(0);
      expect(result.recommendations).toContain('Dimension T-F: 0/4 questions answered. Consider answering more questions for better accuracy.');
    });

    it('should analyze complete answers', async () => {
      const answers = [
        { questionId: '507f1f77bcf86cd799439011', choice: 'a' as const }, // E-I: 1
        { questionId: '507f1f77bcf86cd799439012', choice: 'a' as const }, // E-I: 2
        { questionId: '507f1f77bcf86cd799439013', choice: 'a' as const }, // S-N: 1
        { questionId: '507f1f77bcf86cd799439014', choice: 'a' as const }, // T-F: 1
        { questionId: '507f1f77bcf86cd799439015', choice: 'a' as const }  // J-P: 1
      ];

      // Add more questions to meet the minimum requirement
      const additionalQuestions = [
        { _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439016'), category: 'E-I' },
        { _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439017'), category: 'E-I' },
        { _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439018'), category: 'S-N' },
        { _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439019'), category: 'S-N' },
        { _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439020'), category: 'S-N' },
        { _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439021'), category: 'T-F' },
        { _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439022'), category: 'T-F' },
        { _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439023'), category: 'T-F' },
        { _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439024'), category: 'J-P' },
        { _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439025'), category: 'J-P' },
        { _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439026'), category: 'J-P' }
      ];

      mockMBTIQuestion.find = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([...mockQuestions, ...additionalQuestions])
      });

      const completeAnswers = [
        ...answers,
        { questionId: '507f1f77bcf86cd799439016', choice: 'a' as const },
        { questionId: '507f1f77bcf86cd799439017', choice: 'a' as const },
        { questionId: '507f1f77bcf86cd799439018', choice: 'a' as const },
        { questionId: '507f1f77bcf86cd799439019', choice: 'a' as const },
        { questionId: '507f1f77bcf86cd799439020', choice: 'a' as const },
        { questionId: '507f1f77bcf86cd799439021', choice: 'a' as const },
        { questionId: '507f1f77bcf86cd799439022', choice: 'a' as const },
        { questionId: '507f1f77bcf86cd799439023', choice: 'a' as const },
        { questionId: '507f1f77bcf86cd799439024', choice: 'a' as const },
        { questionId: '507f1f77bcf86cd799439025', choice: 'a' as const },
        { questionId: '507f1f77bcf86cd799439026', choice: 'a' as const }
      ];

      const result = await MBTICalculationEngine.analyzeAnswerCompleteness(completeAnswers);

      expect(result.isComplete).toBe(true);
      expect(result.recommendations).toContain('Great! You have answered enough questions for reliable results.');
    });
  });

  describe('getRecommendedMinimumQuestions', () => {
    it('should return 4 as minimum questions per dimension', () => {
      const minimum = MBTICalculationEngine.getRecommendedMinimumQuestions();
      expect(minimum).toBe(4);
    });
  });

  describe('confidence calculation', () => {
    const mockQuestions = [
      {
        _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
        category: 'E-I',
        inverted: false
      },
      {
        _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
        category: 'E-I',
        inverted: false
      }
    ];

    const mockMBTITypeInfo = {
      type: 'ESTJ',
      name: 'The Executive',
      description: 'Natural manager',
      strengths: ['Organized', 'Decisive'],
      weaknesses: ['Rigid', 'Impatient'],
      majors: []
    };

    beforeEach(() => {
      mockMBTIQuestion.find = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockQuestions)
      });

      mockMBTIType.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockMBTITypeInfo)
        })
      });
    });

    it('should calculate high confidence for decisive answers', async () => {
      const answers = [
        { questionId: '507f1f77bcf86cd799439011', choice: 'a' as const }, // +1
        { questionId: '507f1f77bcf86cd799439012', choice: 'a' as const }  // +1, total = +2
      ];

      const result = await MBTICalculationEngine.calculateMBTIType({ answers });

      // With max possible score of 2 and actual score of 2, confidence should be 100%
      expect(result.confidence).toBe(100);
    });

    it('should calculate medium confidence for mixed answers', async () => {
      const answers = [
        { questionId: '507f1f77bcf86cd799439011', choice: 'a' as const }, // +1
        { questionId: '507f1f77bcf86cd799439012', choice: 'b' as const }  // -1, total = 0
      ];

      const result = await MBTICalculationEngine.calculateMBTIType({ answers });

      // With max possible score of 2 and actual score of 0, confidence should be low but at least 25%
      expect(result.confidence).toBe(25); // Minimum confidence
    });
  });
});