import * as fc from 'fast-check';
import { MBTICalculationEngine } from '../mbti.engine';
import { MBTIQuestion, MBTIType, MBTITestResult } from '../mbti.model';
import mongoose from 'mongoose';

/**
 * Property-Based Test for MBTI State Management
 * 
 * **Feature: fu-mate-mobile-enhancement, Property 4: MBTI Test State Management**
 * **Validates: Requirements 3.3, 3.6**
 * 
 * This property test verifies universal properties about MBTI test state management:
 * - Answer selections should enable proper navigation to the next question (3.3)
 * - Retake requests should completely reset all answers and restart from the first question (3.6)
 */

// Mock the models
jest.mock('../mbti.model');
jest.mock('../../universities/university.model');

const mockMBTIQuestion = MBTIQuestion as jest.Mocked<typeof MBTIQuestion>;
const mockMBTIType = MBTIType as jest.Mocked<typeof MBTIType>;
const mockMBTITestResult = MBTITestResult as jest.Mocked<typeof MBTITestResult>;

// Mock test state management class
class MBTITestStateManager {
  private currentQuestionIndex: number = 0;
  private answers: Array<{ questionId: string; choice: 'a' | 'b' }> = [];
  private questions: Array<{ _id: mongoose.Types.ObjectId; category: string; order: number }> = [];
  private isCompleted: boolean = false;

  constructor(questions: Array<{ _id: mongoose.Types.ObjectId; category: string; order: number }>) {
    this.questions = [...questions].sort((a, b) => a.order - b.order);
    this.currentQuestionIndex = 0;
    this.answers = [];
    this.isCompleted = false;
  }

  // Requirement 3.3: Answer selections should enable proper navigation
  selectAnswer(questionId: string, choice: 'a' | 'b'): {
    success: boolean;
    canNavigateNext: boolean;
    nextQuestionIndex: number;
    currentAnswers: Array<{ questionId: string; choice: 'a' | 'b' }>;
  } {
    // Validate the answer is for the current question only (strict navigation)
    const currentQuestion = this.questions[this.currentQuestionIndex];
    if (!currentQuestion || currentQuestion._id.toString() !== questionId) {
      return {
        success: false,
        canNavigateNext: false,
        nextQuestionIndex: this.currentQuestionIndex,
        currentAnswers: [...this.answers]
      };
    }

    // Remove any existing answer for this question
    this.answers = this.answers.filter(a => a.questionId !== questionId);
    
    // Add the new answer
    this.answers.push({ questionId, choice });

    // Check if we can navigate to next question
    const canNavigateNext = this.currentQuestionIndex < this.questions.length - 1;
    const nextQuestionIndex = canNavigateNext ? this.currentQuestionIndex + 1 : this.currentQuestionIndex;

    // Update current question index if navigating
    if (canNavigateNext) {
      this.currentQuestionIndex = nextQuestionIndex;
    } else {
      this.isCompleted = true;
    }

    return {
      success: true,
      canNavigateNext,
      nextQuestionIndex,
      currentAnswers: [...this.answers]
    };
  }

  // Requirement 3.6: Retake should completely reset all answers and restart from first question
  retakeTest(): {
    success: boolean;
    currentQuestionIndex: number;
    answers: Array<{ questionId: string; choice: 'a' | 'b' }>;
    isCompleted: boolean;
    totalQuestions: number;
  } {
    // Complete reset of all state
    this.currentQuestionIndex = 0;
    this.answers = [];
    this.isCompleted = false;

    return {
      success: true,
      currentQuestionIndex: this.currentQuestionIndex,
      answers: [...this.answers],
      isCompleted: this.isCompleted,
      totalQuestions: this.questions.length
    };
  }

  getCurrentState() {
    return {
      currentQuestionIndex: this.currentQuestionIndex,
      answers: [...this.answers],
      isCompleted: this.isCompleted,
      totalQuestions: this.questions.length,
      progress: this.questions.length > 0 ? (this.answers.length / this.questions.length) * 100 : 0
    };
  }

  canNavigateTo(questionIndex: number): boolean {
    // Can only navigate to questions that have been answered or the current question
    return questionIndex <= this.currentQuestionIndex && questionIndex >= 0 && questionIndex < this.questions.length;
  }

  getAnswerForQuestion(questionId: string): { questionId: string; choice: 'a' | 'b' } | null {
    return this.answers.find(a => a.questionId === questionId) || null;
  }
}

describe('Feature: fu-mate-mobile-enhancement, Property 4: MBTI Test State Management', () => {
  
  // Generator for valid MBTI categories
  const mbtiCategoryArb = fc.constantFrom('E-I', 'S-N', 'T-F', 'J-P');
  
  // Generator for valid choices
  const choiceArb = fc.constantFrom('a', 'b');
  
  // Generator for valid MongoDB ObjectIds
  const objectIdArb = fc.integer().map(() => new mongoose.Types.ObjectId());
  
  // Generator for MBTI questions with proper ordering
  const mbtiQuestionArb = fc.record({
    _id: objectIdArb,
    category: mbtiCategoryArb,
    order: fc.integer({ min: 0, max: 100 }),
    question: fc.string({ minLength: 10, maxLength: 200 }),
    firstAnswer: fc.string({ minLength: 5, maxLength: 100 }),
    secondAnswer: fc.string({ minLength: 5, maxLength: 100 }),
    isActive: fc.constant(true),
    inverted: fc.boolean()
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should enable proper navigation after answer selection', async () => {
    await fc.assert(fc.asyncProperty(
      fc.array(mbtiQuestionArb, { minLength: 3, maxLength: 20 })
        .map(questions => {
          // Ensure unique orders for proper sequencing
          return questions.map((q, index) => ({ ...q, order: index }));
        }),
      async (questions) => {
        // Property 1: Answer selections should enable proper navigation (Requirement 3.3)
        
        const stateManager = new MBTITestStateManager(questions);
        const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);
        
        // Test navigation through all questions
        for (let i = 0; i < sortedQuestions.length; i++) {
          const currentQuestion = sortedQuestions[i];
          const choice = fc.sample(choiceArb, 1)[0];
          
          // Get state before answer selection
          const stateBefore = stateManager.getCurrentState();
          expect(stateBefore.currentQuestionIndex).toBe(i);
          
          // Select answer for current question
          const result = stateManager.selectAnswer(currentQuestion._id.toString(), choice);
          
          // Verify answer selection success
          expect(result.success).toBe(true);
          
          // Verify navigation logic
          const isLastQuestion = i === sortedQuestions.length - 1;
          expect(result.canNavigateNext).toBe(!isLastQuestion);
          
          if (!isLastQuestion) {
            // Should navigate to next question
            expect(result.nextQuestionIndex).toBe(i + 1);
            expect(stateManager.getCurrentState().currentQuestionIndex).toBe(i + 1);
          } else {
            // Should stay on last question and mark as completed
            expect(result.nextQuestionIndex).toBe(i);
            expect(stateManager.getCurrentState().isCompleted).toBe(true);
          }
          
          // Verify answer is stored correctly
          expect(result.currentAnswers).toContainEqual({
            questionId: currentQuestion._id.toString(),
            choice
          });
          
          // Verify answer persistence
          const storedAnswer = stateManager.getAnswerForQuestion(currentQuestion._id.toString());
          expect(storedAnswer).toEqual({
            questionId: currentQuestion._id.toString(),
            choice
          });
          
          // Verify progress calculation (progress should reflect questions answered)
          const questionsAnswered = i + 1;
          const expectedProgress = (questionsAnswered / sortedQuestions.length) * 100;
          const actualProgress = stateManager.getCurrentState().progress;
          expect(Math.abs(actualProgress - expectedProgress)).toBeLessThan(0.01);
        }
        
        // Verify final state
        const finalState = stateManager.getCurrentState();
        expect(finalState.isCompleted).toBe(true);
        expect(finalState.answers).toHaveLength(sortedQuestions.length);
        expect(finalState.currentQuestionIndex).toBe(sortedQuestions.length - 1);
      }
    ), { numRuns: 100 });
  });

  it('should completely reset state on retake request', async () => {
    await fc.assert(fc.asyncProperty(
      fc.array(mbtiQuestionArb, { minLength: 5, maxLength: 15 })
        .map(questions => {
          return questions.map((q, index) => ({ ...q, order: index }));
        }),
      fc.integer({ min: 1, max: 10 }), // Number of answers to provide before retake
      async (questions, numAnswersBeforeRetake) => {
        // Property 2: Retake should completely reset all answers and restart from first question (Requirement 3.6)
        
        const stateManager = new MBTITestStateManager(questions);
        const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);
        const answersToProvide = Math.min(numAnswersBeforeRetake, sortedQuestions.length);
        
        // Provide some answers to establish state
        const providedAnswers: Array<{ questionId: string; choice: 'a' | 'b' }> = [];
        for (let i = 0; i < answersToProvide; i++) {
          const question = sortedQuestions[i];
          const choice = fc.sample(choiceArb, 1)[0];
          
          const result = stateManager.selectAnswer(question._id.toString(), choice);
          expect(result.success).toBe(true);
          
          providedAnswers.push({ questionId: question._id.toString(), choice });
        }
        
        // Verify state has been established
        const stateBeforeRetake = stateManager.getCurrentState();
        expect(stateBeforeRetake.answers).toHaveLength(answersToProvide);
        expect(stateBeforeRetake.currentQuestionIndex).toBe(
          answersToProvide < sortedQuestions.length ? answersToProvide : answersToProvide - 1
        );
        
        // Perform retake
        const retakeResult = stateManager.retakeTest();
        
        // Verify retake success
        expect(retakeResult.success).toBe(true);
        
        // Verify complete reset (Requirement 3.6)
        expect(retakeResult.currentQuestionIndex).toBe(0);
        expect(retakeResult.answers).toHaveLength(0);
        expect(retakeResult.isCompleted).toBe(false);
        expect(retakeResult.totalQuestions).toBe(sortedQuestions.length);
        
        // Verify state manager internal state is reset
        const stateAfterRetake = stateManager.getCurrentState();
        expect(stateAfterRetake.currentQuestionIndex).toBe(0);
        expect(stateAfterRetake.answers).toHaveLength(0);
        expect(stateAfterRetake.isCompleted).toBe(false);
        expect(stateAfterRetake.progress).toBe(0);
        
        // Verify all previous answers are cleared
        for (const prevAnswer of providedAnswers) {
          const storedAnswer = stateManager.getAnswerForQuestion(prevAnswer.questionId);
          expect(storedAnswer).toBeNull();
        }
        
        // Verify navigation is reset to first question
        expect(stateManager.canNavigateTo(0)).toBe(true);
        for (let i = 1; i < sortedQuestions.length; i++) {
          expect(stateManager.canNavigateTo(i)).toBe(false);
        }
        
        // Verify can start fresh after retake
        const firstQuestion = sortedQuestions[0];
        const newChoice = fc.sample(choiceArb, 1)[0];
        const newResult = stateManager.selectAnswer(firstQuestion._id.toString(), newChoice);
        
        expect(newResult.success).toBe(true);
        expect(newResult.currentAnswers).toHaveLength(1);
        expect(newResult.currentAnswers[0]).toEqual({
          questionId: firstQuestion._id.toString(),
          choice: newChoice
        });
      }
    ), { numRuns: 100 });
  });

  it('should handle invalid navigation attempts correctly', async () => {
    await fc.assert(fc.asyncProperty(
      fc.array(mbtiQuestionArb, { minLength: 3, maxLength: 10 })
        .map(questions => {
          return questions.map((q, index) => ({ ...q, order: index }));
        }),
      async (questions) => {
        const stateManager = new MBTITestStateManager(questions);
        const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);
        
        // Test invalid question ID
        const invalidQuestionId = new mongoose.Types.ObjectId().toString();
        const invalidResult = stateManager.selectAnswer(invalidQuestionId, 'a');
        
        expect(invalidResult.success).toBe(false);
        expect(invalidResult.canNavigateNext).toBe(false);
        expect(invalidResult.nextQuestionIndex).toBe(0); // Should stay at first question
        expect(invalidResult.currentAnswers).toHaveLength(0);
        
        // Test answering future question (should fail)
        if (sortedQuestions.length > 1) {
          const futureQuestion = sortedQuestions[1];
          const futureResult = stateManager.selectAnswer(futureQuestion._id.toString(), 'a');
          
          expect(futureResult.success).toBe(false);
          expect(futureResult.canNavigateNext).toBe(false);
        }
        
        // Test navigation bounds
        expect(stateManager.canNavigateTo(-1)).toBe(false);
        expect(stateManager.canNavigateTo(sortedQuestions.length)).toBe(false);
        expect(stateManager.canNavigateTo(sortedQuestions.length + 1)).toBe(false);
      }
    ), { numRuns: 50 });
  });

  it('should handle sequential answer selection correctly', async () => {
    await fc.assert(fc.asyncProperty(
      fc.array(mbtiQuestionArb, { minLength: 2, maxLength: 8 })
        .map(questions => {
          return questions.map((q, index) => ({ ...q, order: index }));
        }),
      async (questions) => {
        const stateManager = new MBTITestStateManager(questions);
        const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);
        
        // Answer questions sequentially
        for (let i = 0; i < sortedQuestions.length; i++) {
          const question = sortedQuestions[i];
          const choice = fc.sample(choiceArb, 1)[0];
          
          const result = stateManager.selectAnswer(question._id.toString(), choice);
          expect(result.success).toBe(true);
          
          // Verify answer is stored
          const storedAnswer = stateManager.getAnswerForQuestion(question._id.toString());
          expect(storedAnswer).toEqual({
            questionId: question._id.toString(),
            choice
          });
        }
        
        // Verify final state
        const finalState = stateManager.getCurrentState();
        expect(finalState.answers).toHaveLength(sortedQuestions.length);
        expect(finalState.isCompleted).toBe(true);
        
        // Try to answer the same question again (should fail since we're past it)
        const firstQuestion = sortedQuestions[0];
        const retryResult = stateManager.selectAnswer(firstQuestion._id.toString(), 'a');
        expect(retryResult.success).toBe(false);
      }
    ), { numRuns: 50 });
  });

  it('should maintain state consistency across multiple operations', async () => {
    await fc.assert(fc.asyncProperty(
      fc.array(mbtiQuestionArb, { minLength: 4, maxLength: 12 })
        .map(questions => {
          return questions.map((q, index) => ({ ...q, order: index }));
        }),
      fc.array(fc.record({
        operation: fc.constantFrom('answer', 'retake'),
        questionIndex: fc.integer({ min: 0, max: 11 }),
        choice: choiceArb
      }), { minLength: 5, maxLength: 20 }),
      async (questions, operations) => {
        const stateManager = new MBTITestStateManager(questions);
        const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);
        
        for (const operation of operations) {
          const stateBefore = stateManager.getCurrentState();
          
          if (operation.operation === 'retake') {
            // Test retake operation
            const retakeResult = stateManager.retakeTest();
            
            expect(retakeResult.success).toBe(true);
            expect(retakeResult.currentQuestionIndex).toBe(0);
            expect(retakeResult.answers).toHaveLength(0);
            expect(retakeResult.isCompleted).toBe(false);
            
            // Verify state is completely reset
            const stateAfterRetake = stateManager.getCurrentState();
            expect(stateAfterRetake.currentQuestionIndex).toBe(0);
            expect(stateAfterRetake.answers).toHaveLength(0);
            expect(stateAfterRetake.isCompleted).toBe(false);
            expect(stateAfterRetake.progress).toBe(0);
            
          } else if (operation.operation === 'answer') {
            // Test answer operation
            const questionIndex = Math.min(operation.questionIndex, sortedQuestions.length - 1);
            const currentQuestionIndex = stateManager.getCurrentState().currentQuestionIndex;
            
            // Only answer if it's the current question
            if (questionIndex === currentQuestionIndex && questionIndex < sortedQuestions.length) {
              const question = sortedQuestions[questionIndex];
              const result = stateManager.selectAnswer(question._id.toString(), operation.choice);
              
              if (result.success) {
                // Verify answer was recorded
                expect(result.currentAnswers.some(a => 
                  a.questionId === question._id.toString() && a.choice === operation.choice
                )).toBe(true);
                
                // Verify navigation logic
                const isLastQuestion = questionIndex === sortedQuestions.length - 1;
                expect(result.canNavigateNext).toBe(!isLastQuestion);
                
                if (!isLastQuestion) {
                  expect(result.nextQuestionIndex).toBe(questionIndex + 1);
                }
              }
            }
          }
          
          // Verify state consistency invariants
          const stateAfter = stateManager.getCurrentState();
          
          // Current question index should be within bounds
          expect(stateAfter.currentQuestionIndex).toBeGreaterThanOrEqual(0);
          expect(stateAfter.currentQuestionIndex).toBeLessThan(sortedQuestions.length);
          
          // Progress should be consistent with answers provided
          const expectedProgress = sortedQuestions.length > 0 
            ? (stateAfter.answers.length / sortedQuestions.length) * 100 
            : 0;
          expect(Math.abs(stateAfter.progress - expectedProgress)).toBeLessThan(0.01);
          
          // Answer count should not exceed total questions
          expect(stateAfter.answers.length).toBeLessThanOrEqual(sortedQuestions.length);
          
          // All answers should reference valid questions
          for (const answer of stateAfter.answers) {
            const questionExists = sortedQuestions.some(q => q._id.toString() === answer.questionId);
            expect(questionExists).toBe(true);
            expect(['a', 'b']).toContain(answer.choice);
          }
          
          // No duplicate answers for same question
          const questionIds = stateAfter.answers.map(a => a.questionId);
          const uniqueQuestionIds = new Set(questionIds);
          expect(questionIds.length).toBe(uniqueQuestionIds.size);
        }
      }
    ), { numRuns: 100 });
  });
});