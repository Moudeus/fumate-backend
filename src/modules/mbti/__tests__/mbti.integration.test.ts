import { MBTICalculationEngine } from '../mbti.engine';
import { MBTIQuestion, MBTIType } from '../mbti.model';
import { Major } from '../../majors/major.model';
import mongoose from 'mongoose';

/**
 * Integration Test for MBTI Calculation Engine
 * 
 * This test demonstrates the complete MBTI calculation workflow:
 * 1. Validate user answers
 * 2. Calculate MBTI personality type
 * 3. Provide comprehensive results with confidence scoring
 * 
 * **Validates: Requirements 3.4, 3.5**
 */

describe('MBTI Calculation Engine Integration', () => {
  // Mock database data that would normally come from MongoDB
  const mockQuestions = [
    // E-I Questions
    { _id: new mongoose.Types.ObjectId(), category: 'E-I', inverted: false },
    { _id: new mongoose.Types.ObjectId(), category: 'E-I', inverted: true },
    { _id: new mongoose.Types.ObjectId(), category: 'E-I', inverted: false },
    { _id: new mongoose.Types.ObjectId(), category: 'E-I', inverted: false },
    
    // S-N Questions  
    { _id: new mongoose.Types.ObjectId(), category: 'S-N', inverted: false },
    { _id: new mongoose.Types.ObjectId(), category: 'S-N', inverted: true },
    { _id: new mongoose.Types.ObjectId(), category: 'S-N', inverted: false },
    { _id: new mongoose.Types.ObjectId(), category: 'S-N', inverted: false },
    
    // T-F Questions
    { _id: new mongoose.Types.ObjectId(), category: 'T-F', inverted: false },
    { _id: new mongoose.Types.ObjectId(), category: 'T-F', inverted: false },
    { _id: new mongoose.Types.ObjectId(), category: 'T-F', inverted: true },
    { _id: new mongoose.Types.ObjectId(), category: 'T-F', inverted: false },
    
    // J-P Questions
    { _id: new mongoose.Types.ObjectId(), category: 'J-P', inverted: false },
    { _id: new mongoose.Types.ObjectId(), category: 'J-P', inverted: false },
    { _id: new mongoose.Types.ObjectId(), category: 'J-P', inverted: true },
    { _id: new mongoose.Types.ObjectId(), category: 'J-P', inverted: false }
  ];

  const mockMajors = [
    { _id: new mongoose.Types.ObjectId(), name: 'Computer Science', code: 'CS', description: 'Technology and programming' },
    { _id: new mongoose.Types.ObjectId(), name: 'Business Administration', code: 'BA', description: 'Management and leadership' },
    { _id: new mongoose.Types.ObjectId(), name: 'Psychology', code: 'PSY', description: 'Human behavior and mental processes' }
  ];

  const mockMBTIType = {
    type: 'ENTJ',
    name: 'The Commander',
    description: 'Natural-born leaders. They embody the gifts of charisma and confidence, and project authority in a way that draws crowds together behind a common goal.',
    strengths: [
      'Efficient and energetic',
      'Self-confident and strong-willed', 
      'Strategic thinking',
      'Charismatic and inspiring'
    ],
    weaknesses: [
      'Stubborn and dominant',
      'Intolerant of inefficiency',
      'Impatient with emotional considerations',
      'Can be ruthless in pursuit of goals'
    ],
    majors: mockMajors
  };

  beforeEach(() => {
    // Mock the database calls
    jest.spyOn(MBTIQuestion, 'find').mockReturnValue({
      lean: jest.fn().mockResolvedValue(mockQuestions)
    } as any);

    jest.spyOn(MBTIType, 'findOne').mockReturnValue({
      populate: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockMBTIType)
      })
    } as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Complete MBTI Assessment Workflow', () => {
    it('should calculate ENTJ personality type with high confidence', async () => {
      // Simulate user answers that strongly indicate ENTJ
      const userAnswers = [
        // E-I: Strong Extraversion (3 out of 4 = 75% E)
        { questionId: mockQuestions[0]._id.toString(), choice: 'a' as const }, // +1 E
        { questionId: mockQuestions[1]._id.toString(), choice: 'b' as const }, // +1 E (inverted)
        { questionId: mockQuestions[2]._id.toString(), choice: 'a' as const }, // +1 E
        { questionId: mockQuestions[3]._id.toString(), choice: 'b' as const }, // -1 I
        
        // S-N: Moderate Intuition (2 out of 4 = 50% N)
        { questionId: mockQuestions[4]._id.toString(), choice: 'b' as const }, // -1 N
        { questionId: mockQuestions[5]._id.toString(), choice: 'a' as const }, // -1 N (inverted)
        { questionId: mockQuestions[6]._id.toString(), choice: 'a' as const }, // +1 S
        { questionId: mockQuestions[7]._id.toString(), choice: 'b' as const }, // -1 N
        
        // T-F: Strong Thinking (3 out of 4 = 75% T)
        { questionId: mockQuestions[8]._id.toString(), choice: 'a' as const },  // +1 T
        { questionId: mockQuestions[9]._id.toString(), choice: 'a' as const },  // +1 T
        { questionId: mockQuestions[10]._id.toString(), choice: 'b' as const }, // +1 T (inverted)
        { questionId: mockQuestions[11]._id.toString(), choice: 'b' as const }, // -1 F
        
        // J-P: Strong Judging (3 out of 4 = 75% J)
        { questionId: mockQuestions[12]._id.toString(), choice: 'a' as const }, // +1 J
        { questionId: mockQuestions[13]._id.toString(), choice: 'a' as const }, // +1 J
        { questionId: mockQuestions[14]._id.toString(), choice: 'b' as const }, // +1 J (inverted)
        { questionId: mockQuestions[15]._id.toString(), choice: 'b' as const }  // -1 P
      ];

      // Step 1: Validate answers
      const validation = MBTICalculationEngine.validateAnswers(userAnswers);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);

      // Step 2: Analyze completeness
      const completeness = await MBTICalculationEngine.analyzeAnswerCompleteness(userAnswers);
      expect(completeness.isComplete).toBe(true);
      expect(completeness.dimensionCounts['E-I']).toBe(4);
      expect(completeness.dimensionCounts['S-N']).toBe(4);
      expect(completeness.dimensionCounts['T-F']).toBe(4);
      expect(completeness.dimensionCounts['J-P']).toBe(4);

      // Step 3: Calculate MBTI type
      const result = await MBTICalculationEngine.calculateMBTIType({ answers: userAnswers });

      // Verify the calculated personality type
      expect(result.resultType).toBe('ENTJ');
      
      // Verify raw scores
      expect(result.scores['E-I']).toBe(2);  // 3 E answers - 1 I answer = +2 (Extraversion)
      expect(result.scores['S-N']).toBe(-2); // 1 S answer - 3 N answers = -2 (Intuition)
      expect(result.scores['T-F']).toBe(2);  // 3 T answers - 1 F answer = +2 (Thinking)
      expect(result.scores['J-P']).toBe(2);  // 3 J answers - 1 P answer = +2 (Judging)

      // Verify percentages
      expect(result.percentages.E).toBe(75); // (2+4)/(2*4) = 75%
      expect(result.percentages.I).toBe(25);
      expect(result.percentages.S).toBe(25); // (-2+4)/(2*4) = 25%
      expect(result.percentages.N).toBe(75);
      expect(result.percentages.T).toBe(75);
      expect(result.percentages.F).toBe(25);
      expect(result.percentages.J).toBe(75);
      expect(result.percentages.P).toBe(25);

      // Verify high confidence (should be moderate due to mixed answers)
      expect(result.confidence).toBeGreaterThan(40);
      expect(result.confidence).toBeLessThanOrEqual(100);

      // Verify type information
      expect(result.typeInfo.type).toBe('ENTJ');
      expect(result.typeInfo.name).toBe('The Commander');
      expect(result.typeInfo.description).toContain('Natural-born leaders');
      expect(result.typeInfo.strengths).toContain('Strategic thinking');
      expect(result.typeInfo.weaknesses).toContain('Stubborn and dominant');
      expect(result.typeInfo.majors).toHaveLength(3);
      expect(result.typeInfo.majors[0].name).toBe('Computer Science');
    });

    it('should calculate INFP personality type with moderate confidence', async () => {
      // Simulate user answers that indicate INFP with some mixed responses
      const userAnswers = [
        // E-I: Strong Introversion
        { questionId: mockQuestions[0]._id.toString(), choice: 'b' as const }, // -1 I
        { questionId: mockQuestions[1]._id.toString(), choice: 'a' as const }, // -1 I (inverted)
        { questionId: mockQuestions[2]._id.toString(), choice: 'b' as const }, // -1 I
        { questionId: mockQuestions[3]._id.toString(), choice: 'a' as const }, // +1 E (mixed response)
        
        // S-N: Strong Intuition
        { questionId: mockQuestions[4]._id.toString(), choice: 'b' as const }, // -1 N
        { questionId: mockQuestions[5]._id.toString(), choice: 'a' as const }, // -1 N (inverted)
        { questionId: mockQuestions[6]._id.toString(), choice: 'b' as const }, // -1 N
        { questionId: mockQuestions[7]._id.toString(), choice: 'b' as const }, // -1 N
        
        // T-F: Strong Feeling
        { questionId: mockQuestions[8]._id.toString(), choice: 'b' as const },  // -1 F
        { questionId: mockQuestions[9]._id.toString(), choice: 'b' as const },  // -1 F
        { questionId: mockQuestions[10]._id.toString(), choice: 'a' as const }, // -1 F (inverted)
        { questionId: mockQuestions[11]._id.toString(), choice: 'b' as const }, // -1 F
        
        // J-P: Strong Perceiving
        { questionId: mockQuestions[12]._id.toString(), choice: 'b' as const }, // -1 P
        { questionId: mockQuestions[13]._id.toString(), choice: 'b' as const }, // -1 P
        { questionId: mockQuestions[14]._id.toString(), choice: 'a' as const }, // -1 P (inverted)
        { questionId: mockQuestions[15]._id.toString(), choice: 'a' as const }  // +1 J (mixed response)
      ];

      // Update mock to return INFP type info
      const mockINFPType = {
        ...mockMBTIType,
        type: 'INFP',
        name: 'The Mediator',
        description: 'Mediators are true idealists, always looking for the hint of good in even the worst of people and events.',
        strengths: ['Empathetic and compassionate', 'Creative and imaginative', 'Open-minded and flexible', 'Passionate and energetic'],
        weaknesses: ['Too idealistic', 'Too altruistic', 'Impractical', 'Dislike dealing with data']
      };

      jest.spyOn(MBTIType, 'findOne').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockINFPType)
        })
      } as any);

      const result = await MBTICalculationEngine.calculateMBTIType({ answers: userAnswers });

      // Verify the calculated personality type
      expect(result.resultType).toBe('INFP');
      
      // Verify raw scores (mostly negative indicating I, N, F, P)
      expect(result.scores['E-I']).toBe(-2); // More I than E
      expect(result.scores['S-N']).toBe(-4); // Strong N
      expect(result.scores['T-F']).toBe(-4); // Strong F
      expect(result.scores['J-P']).toBe(-2); // More P than J

      // Verify type information
      expect(result.typeInfo.type).toBe('INFP');
      expect(result.typeInfo.name).toBe('The Mediator');
      expect(result.typeInfo.description).toContain('true idealists');
      expect(result.typeInfo.strengths).toContain('Empathetic and compassionate');

      // Confidence should be moderate due to some mixed responses
      expect(result.confidence).toBeGreaterThan(25);
      expect(result.confidence).toBeLessThan(100);
    });

    it('should handle edge case with balanced scores', async () => {
      // Simulate perfectly balanced answers (should default to first letters: ESTJ)
      const userAnswers = [
        // E-I: Perfectly balanced (2 E, 2 I = 0 total)
        { questionId: mockQuestions[0]._id.toString(), choice: 'a' as const }, // +1 E
        { questionId: mockQuestions[1]._id.toString(), choice: 'a' as const }, // -1 I (inverted)
        { questionId: mockQuestions[2]._id.toString(), choice: 'b' as const }, // -1 I
        { questionId: mockQuestions[3]._id.toString(), choice: 'a' as const }, // +1 E
        
        // S-N: Perfectly balanced (2 S, 2 N = 0 total)
        { questionId: mockQuestions[4]._id.toString(), choice: 'a' as const }, // +1 S
        { questionId: mockQuestions[5]._id.toString(), choice: 'b' as const }, // +1 S (inverted)
        { questionId: mockQuestions[6]._id.toString(), choice: 'b' as const }, // -1 N
        { questionId: mockQuestions[7]._id.toString(), choice: 'b' as const }, // -1 N
        
        // T-F: Perfectly balanced (2 T, 2 F = 0 total)
        { questionId: mockQuestions[8]._id.toString(), choice: 'a' as const },  // +1 T
        { questionId: mockQuestions[9]._id.toString(), choice: 'a' as const },  // +1 T
        { questionId: mockQuestions[10]._id.toString(), choice: 'a' as const }, // -1 F (inverted)
        { questionId: mockQuestions[11]._id.toString(), choice: 'b' as const }, // -1 F
        
        // J-P: Perfectly balanced (2 J, 2 P = 0 total)
        { questionId: mockQuestions[12]._id.toString(), choice: 'a' as const }, // +1 J
        { questionId: mockQuestions[13]._id.toString(), choice: 'a' as const }, // +1 J
        { questionId: mockQuestions[14]._id.toString(), choice: 'a' as const }, // -1 P (inverted)
        { questionId: mockQuestions[15]._id.toString(), choice: 'b' as const }  // -1 P
      ];

      // Update mock to return ESTJ type info
      const mockESTJType = {
        ...mockMBTIType,
        type: 'ESTJ',
        name: 'The Executive',
        description: 'Executives are excellent organizers, unsurpassed at managing things or people.'
      };

      jest.spyOn(MBTIType, 'findOne').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockESTJType)
        })
      } as any);

      const result = await MBTICalculationEngine.calculateMBTIType({ answers: userAnswers });

      // With all scores at 0, should default to first letters (E, S, T, J)
      expect(result.resultType).toBe('ESTJ');
      
      // All scores should be 0
      expect(result.scores['E-I']).toBe(0);
      expect(result.scores['S-N']).toBe(0);
      expect(result.scores['T-F']).toBe(0);
      expect(result.scores['J-P']).toBe(0);

      // Percentages should be 50-50 for all dimensions
      expect(result.percentages.E).toBe(50);
      expect(result.percentages.I).toBe(50);
      expect(result.percentages.S).toBe(50);
      expect(result.percentages.N).toBe(50);
      expect(result.percentages.T).toBe(50);
      expect(result.percentages.F).toBe(50);
      expect(result.percentages.J).toBe(50);
      expect(result.percentages.P).toBe(50);

      // Confidence should be minimum (25%) due to indecisive answers
      expect(result.confidence).toBe(25);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle insufficient questions gracefully', async () => {
      const incompleteAnswers = [
        { questionId: mockQuestions[0]._id.toString(), choice: 'a' as const },
        { questionId: mockQuestions[4]._id.toString(), choice: 'b' as const }
      ];

      const completeness = await MBTICalculationEngine.analyzeAnswerCompleteness(incompleteAnswers);
      
      expect(completeness.isComplete).toBe(false);
      expect(completeness.dimensionCounts['E-I']).toBe(1);
      expect(completeness.dimensionCounts['S-N']).toBe(1);
      expect(completeness.dimensionCounts['T-F']).toBe(0);
      expect(completeness.dimensionCounts['J-P']).toBe(0);
      expect(completeness.recommendations.some(rec => rec.includes('Consider answering more questions'))).toBe(true);
    });

    it('should validate minimum question requirements', () => {
      const minQuestions = MBTICalculationEngine.getRecommendedMinimumQuestions();
      expect(minQuestions).toBe(4);
    });
  });
});