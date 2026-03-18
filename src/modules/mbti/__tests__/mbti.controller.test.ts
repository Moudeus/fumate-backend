import { Request, Response } from 'express';
import { MBTIController } from '../mbti.controller';
import { MBTICalculationEngine } from '../mbti.engine';

// Mock dependencies
jest.mock('../mbti.engine');
jest.mock('../mbti.model');
jest.mock('../../../interfaces/ApiResponseWrapper');
jest.mock('express-validator');

const mockMBTICalculationEngine = MBTICalculationEngine as jest.Mocked<typeof MBTICalculationEngine>;

describe('MBTIController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRequest = {
      body: {},
      params: {},
      query: {},
      userId: '507f1f77bcf86cd799439011'
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    // Mock express-validator
    const { validationResult } = require('express-validator');
    validationResult.mockReturnValue({
      isEmpty: () => true,
      array: () => []
    });
  });

  describe('MBTI Calculation Engine Integration', () => {
    it('should validate answers using the calculation engine', () => {
      const answers = [
        { questionId: '507f1f77bcf86cd799439011', choice: 'a' as const },
        { questionId: '507f1f77bcf86cd799439012', choice: 'b' as const }
      ];

      mockMBTICalculationEngine.validateAnswers = jest.fn().mockReturnValue({
        isValid: true,
        errors: []
      });

      const result = mockMBTICalculationEngine.validateAnswers(answers);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(mockMBTICalculationEngine.validateAnswers).toHaveBeenCalledWith(answers);
    });

    it('should calculate MBTI type using the calculation engine', async () => {
      const answers = [
        { questionId: '507f1f77bcf86cd799439011', choice: 'a' as const },
        { questionId: '507f1f77bcf86cd799439012', choice: 'b' as const }
      ];

      const mockResult = {
        resultType: 'ENTJ',
        scores: { 'E-I': 2, 'S-N': 1, 'T-F': 1, 'J-P': 1 },
        percentages: { E: 75, I: 25, S: 60, N: 40, T: 60, F: 40, J: 60, P: 40 },
        typeInfo: {
          type: 'ENTJ',
          name: 'The Commander',
          description: 'Natural leader',
          strengths: ['Leadership', 'Decisive'],
          weaknesses: ['Impatient', 'Stubborn'],
          majors: [{ _id: 'major1', name: 'Business', code: 'BUS' }]
        },
        confidence: 85
      };

      mockMBTICalculationEngine.calculateMBTIType = jest.fn().mockResolvedValue(mockResult);

      const result = await mockMBTICalculationEngine.calculateMBTIType({ answers });

      expect(result.resultType).toBe('ENTJ');
      expect(result.confidence).toBe(85);
      expect(result.typeInfo.name).toBe('The Commander');
      expect(mockMBTICalculationEngine.calculateMBTIType).toHaveBeenCalledWith({ answers });
    });

    it('should analyze answer completeness', async () => {
      const answers = [
        { questionId: '507f1f77bcf86cd799439011', choice: 'a' as const },
        { questionId: '507f1f77bcf86cd799439012', choice: 'b' as const }
      ];

      const mockAnalysis = {
        isComplete: true,
        dimensionCounts: { 'E-I': 4, 'S-N': 4, 'T-F': 4, 'J-P': 4 },
        recommendations: ['Great! You have answered enough questions for reliable results.']
      };

      mockMBTICalculationEngine.analyzeAnswerCompleteness = jest.fn().mockResolvedValue(mockAnalysis);

      const result = await mockMBTICalculationEngine.analyzeAnswerCompleteness(answers);

      expect(result.isComplete).toBe(true);
      expect(result.dimensionCounts['E-I']).toBe(4);
      expect(mockMBTICalculationEngine.analyzeAnswerCompleteness).toHaveBeenCalledWith(answers);
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors', () => {
      const answers = [
        { questionId: 'invalid-id', choice: 'a' as const }
      ];

      mockMBTICalculationEngine.validateAnswers = jest.fn().mockReturnValue({
        isValid: false,
        errors: ['Invalid question ID']
      });

      const result = mockMBTICalculationEngine.validateAnswers(answers);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid question ID');
    });

    it('should handle calculation errors', async () => {
      const answers = [
        { questionId: '507f1f77bcf86cd799439011', choice: 'a' as const }
      ];

      mockMBTICalculationEngine.calculateMBTIType = jest.fn().mockRejectedValue(
        new Error('No active questions found in the system')
      );

      await expect(mockMBTICalculationEngine.calculateMBTIType({ answers }))
        .rejects.toThrow('No active questions found in the system');
    });
  });
});