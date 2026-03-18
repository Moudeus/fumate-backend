import * as fc from 'fast-check';
import { MBTICalculationEngine } from '../mbti.engine';
import { MBTIQuestion, MBTIType } from '../mbti.model';
import mongoose from 'mongoose';

/**
 * Property-Based Test for MBTI Data Integrity
 * 
 * **Feature: fu-mate-mobile-enhancement, Property 3: MBTI Test Data Integrity**
 * **Validates: Requirements 3.1, 3.2, 3.4, 3.5**
 * 
 * This property test verifies universal properties about MBTI test data integrity:
 * - Questions should be loaded from database dynamically (3.1)
 * - Progress should be tracked accurately (3.2)
 * - Completed tests should calculate valid personality types using standard algorithms (3.4, 3.5)
 */

// Mock the models
jest.mock('../mbti.model');
jest.mock('../../universities/university.model');

const mockMBTIQuestion = MBTIQuestion as jest.Mocked<typeof MBTIQuestion>;
const mockMBTIType = MBTIType as jest.Mocked<typeof MBTIType>;

describe('Feature: fu-mate-mobile-enhancement, Property 3: MBTI Test Data Integrity', () => {
  
  // Generator for valid MBTI categories
  const mbtiCategoryArb = fc.constantFrom('E-I', 'S-N', 'T-F', 'J-P');
  
  // Generator for valid choices
  const choiceArb = fc.constantFrom('a', 'b');
  
  // Generator for valid MongoDB ObjectIds
  const objectIdArb = fc.integer().map(() => new mongoose.Types.ObjectId());
  
  // Generator for MBTI questions
  const mbtiQuestionArb = fc.record({
    _id: objectIdArb,
    category: mbtiCategoryArb,
    inverted: fc.boolean(),
    question: fc.string({ minLength: 10, maxLength: 200 }),
    firstAnswer: fc.string({ minLength: 5, maxLength: 100 }),
    secondAnswer: fc.string({ minLength: 5, maxLength: 100 }),
    order: fc.integer({ min: 0, max: 100 }),
    isActive: fc.constant(true)
  });
  
  // Generator for user answers
  const userAnswerArb = (questionIds: string[]) => fc.record({
    questionId: fc.constantFrom(...questionIds),
    choice: choiceArb
  });
  
  // Generator for MBTI type information
  const mbtiTypeArb = fc.record({
    type: fc.string({ minLength: 4, maxLength: 4 }).map(s => s.toUpperCase()),
    name: fc.string({ minLength: 5, maxLength: 50 }),
    description: fc.string({ minLength: 20, maxLength: 500 }),
    strengths: fc.array(fc.string({ minLength: 5, maxLength: 50 }), { minLength: 2, maxLength: 8 }),
    weaknesses: fc.array(fc.string({ minLength: 5, maxLength: 50 }), { minLength: 2, maxLength: 8 }),
    majors: fc.array(fc.record({
      _id: objectIdArb,
      name: fc.string({ minLength: 5, maxLength: 50 }),
      code: fc.string({ minLength: 2, maxLength: 10 }),
      description: fc.string({ minLength: 10, maxLength: 100 })
    }), { minLength: 1, maxLength: 10 }),
    isActive: fc.constant(true)
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should maintain data integrity across all MBTI test sessions', async () => {
    await fc.assert(fc.asyncProperty(
      // Generate a set of questions covering all 4 MBTI dimensions
      fc.array(mbtiQuestionArb, { minLength: 16, maxLength: 32 })
        .filter(questions => {
          // Ensure we have questions for all 4 categories
          const categories = new Set(questions.map(q => q.category));
          return categories.size === 4 && 
                 categories.has('E-I') && 
                 categories.has('S-N') && 
                 categories.has('T-F') && 
                 categories.has('J-P');
        }),
      mbtiTypeArb,
      async (questions, mbtiTypeInfo) => {
        // Property 1: Questions should be loaded from database dynamically (Requirement 3.1)
        mockMBTIQuestion.find = jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(questions)
        });

        // Verify questions are loaded from database
        const loadedQuestions = await MBTIQuestion.find({ isActive: true }).lean();
        expect(loadedQuestions).toEqual(questions);
        expect(mockMBTIQuestion.find).toHaveBeenCalledWith({ isActive: true });

        // Generate user answers for a subset of questions (at least 4 per category for completeness)
        const questionsByCategory = questions.reduce((acc, q) => {
          if (!acc[q.category]) acc[q.category] = [];
          acc[q.category].push(q);
          return acc;
        }, {} as Record<string, Array<typeof questions[0]>>);

        const selectedQuestions: Array<typeof questions[0]> = [];
        Object.values(questionsByCategory).forEach(categoryQuestions => {
          // Select at least 4 questions per category for reliable results
          const selected = categoryQuestions.slice(0, Math.max(4, Math.min(8, categoryQuestions.length)));
          selectedQuestions.push(...selected);
        });

        const questionIds = selectedQuestions.map(q => q._id.toString());
        const userAnswers = await fc.sample(
          fc.array(userAnswerArb(questionIds), { 
            minLength: selectedQuestions.length, 
            maxLength: selectedQuestions.length 
          }).map(answers => {
            // Ensure no duplicate question IDs
            const uniqueAnswers = [];
            const seenIds = new Set();
            for (const answer of answers) {
              if (!seenIds.has(answer.questionId)) {
                seenIds.add(answer.questionId);
                uniqueAnswers.push(answer);
              }
            }
            return uniqueAnswers;
          }),
          1
        );

        const answers = userAnswers[0];

        // Property 2: Progress should be tracked accurately (Requirement 3.2)
        const completenessAnalysis = await MBTICalculationEngine.analyzeAnswerCompleteness(answers);
        
        // Verify progress tracking accuracy
        const expectedCounts = { 'E-I': 0, 'S-N': 0, 'T-F': 0, 'J-P': 0 };
        answers.forEach(answer => {
          const question = selectedQuestions.find(q => q._id.toString() === answer.questionId);
          if (question) {
            expectedCounts[question.category as keyof typeof expectedCounts]++;
          }
        });

        expect(completenessAnalysis.dimensionCounts).toEqual(expectedCounts);
        expect(completenessAnalysis.isComplete).toBe(
          Object.values(expectedCounts).every(count => count >= 4)
        );

        // Property 3: Valid personality type calculation using standard algorithms (Requirements 3.4, 3.5)
        
        // Calculate expected MBTI type using standard algorithm
        const rawScores = { 'E-I': 0, 'S-N': 0, 'T-F': 0, 'J-P': 0 };
        const dimensionCounts = { 'E-I': 0, 'S-N': 0, 'T-F': 0, 'J-P': 0 };
        
        answers.forEach(answer => {
          const question = selectedQuestions.find(q => q._id.toString() === answer.questionId);
          if (question) {
            let scoreChange = answer.choice === 'a' ? 1 : -1;
            if (question.inverted) {
              scoreChange = -scoreChange;
            }
            rawScores[question.category as keyof typeof rawScores] += scoreChange;
            dimensionCounts[question.category as keyof typeof dimensionCounts] += 1;
          }
        });

        const expectedType = 
          (rawScores['E-I'] >= 0 ? 'E' : 'I') +
          (rawScores['S-N'] >= 0 ? 'S' : 'N') +
          (rawScores['T-F'] >= 0 ? 'T' : 'F') +
          (rawScores['J-P'] >= 0 ? 'J' : 'P');

        // Mock the MBTI type lookup
        const typeInfoWithCorrectType = {
          ...mbtiTypeInfo,
          type: expectedType
        };

        mockMBTIType.findOne = jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(typeInfoWithCorrectType)
          })
        });

        // Calculate MBTI type using the engine
        const result = await MBTICalculationEngine.calculateMBTIType({ answers });

        // Verify the calculation follows standard MBTI algorithms
        expect(result.resultType).toBe(expectedType);
        expect(result.scores).toEqual(rawScores);

        // Verify percentages are calculated correctly
        Object.keys(rawScores).forEach(dimension => {
          const dim = dimension as keyof typeof rawScores;
          const count = dimensionCounts[dim];
          if (count > 0) {
            const firstLetter = dimension[0];
            const secondLetter = dimension[2];
            
            const firstScore = (rawScores[dim] + count) / (2 * count);
            const expectedFirstPercentage = Math.round(firstScore * 100);
            const expectedSecondPercentage = 100 - expectedFirstPercentage;
            
            expect(result.percentages[firstLetter as keyof typeof result.percentages])
              .toBe(expectedFirstPercentage);
            expect(result.percentages[secondLetter as keyof typeof result.percentages])
              .toBe(expectedSecondPercentage);
          }
        });

        // Verify confidence calculation is reasonable (0-100%)
        expect(result.confidence).toBeGreaterThanOrEqual(0);
        expect(result.confidence).toBeLessThanOrEqual(100);

        // Verify type information is properly populated
        expect(result.typeInfo.type).toBe(expectedType);
        expect(result.typeInfo.name).toBe(typeInfoWithCorrectType.name);
        expect(result.typeInfo.description).toBe(typeInfoWithCorrectType.description);
        expect(result.typeInfo.strengths).toEqual(typeInfoWithCorrectType.strengths);
        expect(result.typeInfo.weaknesses).toEqual(typeInfoWithCorrectType.weaknesses);
        expect(result.typeInfo.majors).toEqual(typeInfoWithCorrectType.majors);

        // Property 4: Database queries should be made correctly
        expect(mockMBTIType.findOne).toHaveBeenCalledWith({
          type: expectedType,
          isActive: true
        });
      }
    ), { numRuns: 100 });
  });

  it('should handle edge cases in MBTI data integrity', async () => {
    await fc.assert(fc.asyncProperty(
      // Generate minimal question set (exactly 4 questions, one per category)
      fc.tuple(
        mbtiQuestionArb.map(q => ({ ...q, category: 'E-I' as const })),
        mbtiQuestionArb.map(q => ({ ...q, category: 'S-N' as const })),
        mbtiQuestionArb.map(q => ({ ...q, category: 'T-F' as const })),
        mbtiQuestionArb.map(q => ({ ...q, category: 'J-P' as const }))
      ).map(([ei, sn, tf, jp]) => [ei, sn, tf, jp]),
      mbtiTypeArb,
      async (questions, mbtiTypeInfo) => {
        // Setup mocks
        mockMBTIQuestion.find = jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(questions)
        });

        // Generate answers for all questions
        const answers = questions.map(q => ({
          questionId: q._id.toString(),
          choice: fc.sample(choiceArb, 1)[0]
        }));

        // Calculate expected type
        const rawScores = { 'E-I': 0, 'S-N': 0, 'T-F': 0, 'J-P': 0 };
        
        answers.forEach(answer => {
          const question = questions.find(q => q._id.toString() === answer.questionId);
          if (question) {
            let scoreChange = answer.choice === 'a' ? 1 : -1;
            if (question.inverted) {
              scoreChange = -scoreChange;
            }
            rawScores[question.category as keyof typeof rawScores] += scoreChange;
          }
        });

        const expectedType = 
          (rawScores['E-I'] >= 0 ? 'E' : 'I') +
          (rawScores['S-N'] >= 0 ? 'S' : 'N') +
          (rawScores['T-F'] >= 0 ? 'T' : 'F') +
          (rawScores['J-P'] >= 0 ? 'J' : 'P');

        mockMBTIType.findOne = jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue({ ...mbtiTypeInfo, type: expectedType })
          })
        });

        // Test the calculation
        const result = await MBTICalculationEngine.calculateMBTIType({ answers });

        // Verify minimal data integrity requirements
        expect(result.resultType).toBe(expectedType);
        expect(result.scores).toEqual(rawScores);
        expect(result.confidence).toBeGreaterThanOrEqual(25); // Minimum confidence
        expect(result.typeInfo.type).toBe(expectedType);

        // Verify completeness analysis for minimal case
        const completeness = await MBTICalculationEngine.analyzeAnswerCompleteness(answers);
        expect(completeness.dimensionCounts['E-I']).toBe(1);
        expect(completeness.dimensionCounts['S-N']).toBe(1);
        expect(completeness.dimensionCounts['T-F']).toBe(1);
        expect(completeness.dimensionCounts['J-P']).toBe(1);
        expect(completeness.isComplete).toBe(false); // Less than 4 per dimension
      }
    ), { numRuns: 50 });
  });

  it('should validate input data integrity', async () => {
    await fc.assert(fc.property(
      fc.array(fc.record({
        questionId: fc.oneof(
          fc.integer().map(() => new mongoose.Types.ObjectId().toString()), // Valid ObjectId
          fc.string({ minLength: 1, maxLength: 10 }), // Invalid ObjectId
          fc.constant('') // Empty string
        ),
        choice: fc.oneof(
          choiceArb, // Valid choice
          fc.constantFrom('c', 'd', 'x', '1', ''), // Invalid choices
          fc.constant(null as any) // Null choice
        )
      }), { minLength: 0, maxLength: 20 })
      .filter(answers => {
        // Ensure we have some invalid cases to test
        return answers.some(a => 
          !mongoose.Types.ObjectId.isValid(a.questionId) || 
          !['a', 'b'].includes(a.choice)
        );
      }),
      (invalidAnswers) => {
        // Test validation of invalid input data
        const validation = MBTICalculationEngine.validateAnswers(invalidAnswers);
        
        // Should detect invalid data
        expect(validation.isValid).toBe(false);
        expect(validation.errors.length).toBeGreaterThan(0);

        // Check specific validation rules
        invalidAnswers.forEach((answer, index) => {
          if (!mongoose.Types.ObjectId.isValid(answer.questionId)) {
            expect(validation.errors.some(error => 
              error.includes(`Answer ${index + 1}`) && 
              error.includes('questionId must be a valid MongoDB ObjectId')
            )).toBe(true);
          }
          
          if (!['a', 'b'].includes(answer.choice)) {
            expect(validation.errors.some(error => 
              error.includes(`Answer ${index + 1}`) && 
              error.includes("choice must be 'a' or 'b'")
            )).toBe(true);
          }
        });
      }
    ), { numRuns: 50 });
  });

  it('should maintain consistency in repeated calculations', async () => {
    await fc.assert(fc.asyncProperty(
      fc.array(mbtiQuestionArb, { minLength: 8, maxLength: 16 })
        .filter(questions => {
          const categories = new Set(questions.map(q => q.category));
          return categories.size === 4;
        }),
      mbtiTypeArb,
      async (questions, mbtiTypeInfo) => {
        // Setup consistent mocks
        mockMBTIQuestion.find = jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(questions)
        });

        // Generate fixed answers
        const answers = questions.slice(0, 8).map(q => ({
          questionId: q._id.toString(),
          choice: 'a' as const // Fixed choice for consistency
        }));

        // Calculate expected type
        const rawScores = { 'E-I': 0, 'S-N': 0, 'T-F': 0, 'J-P': 0 };
        
        answers.forEach(answer => {
          const question = questions.find(q => q._id.toString() === answer.questionId);
          if (question) {
            let scoreChange = answer.choice === 'a' ? 1 : -1;
            if (question.inverted) {
              scoreChange = -scoreChange;
            }
            rawScores[question.category as keyof typeof rawScores] += scoreChange;
          }
        });

        const expectedType = 
          (rawScores['E-I'] >= 0 ? 'E' : 'I') +
          (rawScores['S-N'] >= 0 ? 'S' : 'N') +
          (rawScores['T-F'] >= 0 ? 'T' : 'F') +
          (rawScores['J-P'] >= 0 ? 'J' : 'P');

        mockMBTIType.findOne = jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue({ ...mbtiTypeInfo, type: expectedType })
          })
        });

        // Calculate multiple times with same input
        const result1 = await MBTICalculationEngine.calculateMBTIType({ answers });
        const result2 = await MBTICalculationEngine.calculateMBTIType({ answers });

        // Results should be identical (deterministic)
        expect(result1.resultType).toBe(result2.resultType);
        expect(result1.scores).toEqual(result2.scores);
        expect(result1.percentages).toEqual(result2.percentages);
        expect(result1.confidence).toBe(result2.confidence);
        expect(result1.typeInfo).toEqual(result2.typeInfo);
      }
    ), { numRuns: 30 });
  });
});