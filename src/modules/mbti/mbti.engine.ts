import { MBTIQuestion, MBTIType } from "./mbti.model";
import mongoose from "mongoose";

// ==================== MBTI Calculation Engine ====================

export interface MBTICalculationInput {
  answers: Array<{
    questionId: string;
    choice: "a" | "b";
  }>;
}

export interface MBTICalculationResult {
  resultType: string;
  scores: {
    "E-I": number;
    "S-N": number;
    "T-F": number;
    "J-P": number;
  };
  percentages: {
    E: number;
    I: number;
    S: number;
    N: number;
    T: number;
    F: number;
    J: number;
    P: number;
  };
  typeInfo: {
    type: string;
    name: string;
    description: string;
    strengths: string[];
    weaknesses: string[];
    majors: any[];
  };
  confidence: number; // 0-100, based on how decisive the scores are
}

export class MBTICalculationEngine {
  
  /**
   * Calculate MBTI personality type from user answers
   * @param input User answers to MBTI questions
   * @returns Complete MBTI calculation result
   */
  static async calculateMBTIType(input: MBTICalculationInput): Promise<MBTICalculationResult> {
    // Step 1: Validate input
    if (!input.answers || input.answers.length === 0) {
      throw new Error("No answers provided");
    }

    // Step 2: Get all active questions to map answers to categories
    const questions = await MBTIQuestion.find({ isActive: true }).lean();
    
    if (questions.length === 0) {
      throw new Error("No active questions found in the system");
    }

    // Step 3: Create question lookup map
    const questionMap = new Map<string, { category: string; inverted: boolean }>();
    questions.forEach(q => {
      questionMap.set(q._id.toString(), { 
        category: q.category, 
        inverted: q.inverted 
      });
    });

    // Step 4: Validate all answers reference valid questions
    const validQuestionIds = new Set(questionMap.keys());
    for (const answer of input.answers) {
      if (!validQuestionIds.has(answer.questionId)) {
        throw new Error(`Invalid question ID: ${answer.questionId}`);
      }
      if (!["a", "b"].includes(answer.choice)) {
        throw new Error(`Invalid choice: ${answer.choice}. Must be 'a' or 'b'`);
      }
    }

    // Step 5: Calculate raw scores for each dimension
    const rawScores = { "E-I": 0, "S-N": 0, "T-F": 0, "J-P": 0 };
    const dimensionCounts = { "E-I": 0, "S-N": 0, "T-F": 0, "J-P": 0 };
    
    for (const answer of input.answers) {
      const qInfo = questionMap.get(answer.questionId);
      if (!qInfo) continue;

      // Calculate score change: "a" = +1, "b" = -1
      let scoreChange = answer.choice === "a" ? 1 : -1;
      
      // Apply inversion if question is inverted
      if (qInfo.inverted) {
        scoreChange = -scoreChange;
      }
      
      rawScores[qInfo.category as keyof typeof rawScores] += scoreChange;
      dimensionCounts[qInfo.category as keyof typeof dimensionCounts] += 1;
    }

    // Step 6: Calculate percentages for each trait
    const percentages = {
      E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0
    };

    // Calculate percentages based on raw scores and question counts
    if (dimensionCounts["E-I"] > 0) {
      const eScore = (rawScores["E-I"] + dimensionCounts["E-I"]) / (2 * dimensionCounts["E-I"]);
      percentages.E = Math.round(eScore * 100);
      percentages.I = 100 - percentages.E;
    }

    if (dimensionCounts["S-N"] > 0) {
      const sScore = (rawScores["S-N"] + dimensionCounts["S-N"]) / (2 * dimensionCounts["S-N"]);
      percentages.S = Math.round(sScore * 100);
      percentages.N = 100 - percentages.S;
    }

    if (dimensionCounts["T-F"] > 0) {
      const tScore = (rawScores["T-F"] + dimensionCounts["T-F"]) / (2 * dimensionCounts["T-F"]);
      percentages.T = Math.round(tScore * 100);
      percentages.F = 100 - percentages.T;
    }

    if (dimensionCounts["J-P"] > 0) {
      const jScore = (rawScores["J-P"] + dimensionCounts["J-P"]) / (2 * dimensionCounts["J-P"]);
      percentages.J = Math.round(jScore * 100);
      percentages.P = 100 - percentages.J;
    }

    // Step 7: Determine MBTI type based on raw scores
    const resultType = 
      (rawScores["E-I"] >= 0 ? "E" : "I") +
      (rawScores["S-N"] >= 0 ? "S" : "N") +
      (rawScores["T-F"] >= 0 ? "T" : "F") +
      (rawScores["J-P"] >= 0 ? "J" : "P");

    // Step 8: Calculate confidence level
    const confidence = this.calculateConfidence(rawScores, dimensionCounts);

    // Step 9: Get MBTI type information from database
    const mbtiTypeInfo = await MBTIType.findOne({ 
      type: resultType, 
      isActive: true 
    }).lean();

    if (!mbtiTypeInfo) {
      throw new Error(`MBTI type information not found for type: ${resultType}`);
    }

    // Step 10: Get recommended majors from MBTICompatibility
    const { MBTICompatibility } = await import('../majors/major.model');
    const compatibilities = await MBTICompatibility.find({
      mbtiType: resultType,
      isActive: true
    })
    .populate('majorId', '_id name code description')
    .sort({ compatibilityScore: -1 })
    .limit(10)
    .lean();

    const majorsArray = compatibilities
      .filter(c => c.majorId)
      .map(c => c.majorId);

    return {
      resultType,
      scores: rawScores,
      percentages,
      typeInfo: {
        type: mbtiTypeInfo.type,
        name: mbtiTypeInfo.name,
        description: mbtiTypeInfo.description,
        strengths: mbtiTypeInfo.strengths,
        weaknesses: mbtiTypeInfo.weaknesses,
        majors: majorsArray
      },
      confidence
    };
  }

  /**
   * Calculate confidence level based on how decisive the scores are
   * @param scores Raw scores for each dimension
   * @param counts Number of questions answered for each dimension
   * @returns Confidence percentage (0-100)
   */
  private static calculateConfidence(
    scores: { "E-I": number; "S-N": number; "T-F": number; "J-P": number },
    counts: { "E-I": number; "S-N": number; "T-F": number; "J-P": number }
  ): number {
    let totalConfidence = 0;
    let dimensionsWithData = 0;

    Object.keys(scores).forEach(dimension => {
      const dim = dimension as keyof typeof scores;
      if (counts[dim] > 0) {
        // Calculate how decisive this dimension is (0-1)
        const maxPossibleScore = counts[dim];
        const actualScore = Math.abs(scores[dim]);
        const dimensionConfidence = actualScore / maxPossibleScore;
        
        totalConfidence += dimensionConfidence;
        dimensionsWithData++;
      }
    });

    if (dimensionsWithData === 0) return 0;

    // Convert to percentage and ensure it's at least 25% (since we have 4 dimensions)
    const averageConfidence = totalConfidence / dimensionsWithData;
    return Math.max(25, Math.round(averageConfidence * 100));
  }

  /**
   * Validate MBTI answers before processing
   * @param answers Array of user answers
   * @returns Validation result
   */
  static validateAnswers(answers: Array<{ questionId: string; choice: "a" | "b" }>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!answers || !Array.isArray(answers)) {
      errors.push("Answers must be an array");
      return { isValid: false, errors };
    }

    if (answers.length === 0) {
      errors.push("At least one answer is required");
      return { isValid: false, errors };
    }

    // Check for duplicate question IDs
    const questionIds = answers.map(a => a.questionId);
    const uniqueQuestionIds = new Set(questionIds);
    if (questionIds.length !== uniqueQuestionIds.size) {
      errors.push("Duplicate answers for the same question are not allowed");
    }

    // Validate each answer
    answers.forEach((answer, index) => {
      if (!answer.questionId) {
        errors.push(`Answer ${index + 1}: questionId is required`);
      }

      if (!mongoose.Types.ObjectId.isValid(answer.questionId)) {
        errors.push(`Answer ${index + 1}: questionId must be a valid MongoDB ObjectId`);
      }

      if (!["a", "b"].includes(answer.choice)) {
        errors.push(`Answer ${index + 1}: choice must be 'a' or 'b'`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get recommended minimum number of questions per dimension for reliable results
   */
  static getRecommendedMinimumQuestions(): number {
    return 4; // At least 4 questions per dimension for reliable results
  }

  /**
   * Check if the number of answered questions is sufficient for reliable results
   * @param answers User answers
   * @returns Analysis of answer completeness
   */
  static async analyzeAnswerCompleteness(answers: Array<{ questionId: string; choice: "a" | "b" }>): Promise<{
    isComplete: boolean;
    dimensionCounts: { "E-I": number; "S-N": number; "T-F": number; "J-P": number };
    recommendations: string[];
  }> {
    const questions = await MBTIQuestion.find({ isActive: true }).lean();
    const questionMap = new Map<string, string>();
    
    questions.forEach(q => {
      questionMap.set(q._id.toString(), q.category);
    });

    const dimensionCounts = { "E-I": 0, "S-N": 0, "T-F": 0, "J-P": 0 };
    
    answers.forEach(answer => {
      const category = questionMap.get(answer.questionId);
      if (category) {
        dimensionCounts[category as keyof typeof dimensionCounts]++;
      }
    });

    const minQuestions = this.getRecommendedMinimumQuestions();
    const recommendations: string[] = [];
    let isComplete = true;

    Object.entries(dimensionCounts).forEach(([dimension, count]) => {
      if (count < minQuestions) {
        isComplete = false;
        recommendations.push(
          `Dimension ${dimension}: ${count}/${minQuestions} questions answered. Consider answering more questions for better accuracy.`
        );
      }
    });

    if (isComplete) {
      recommendations.push("Great! You have answered enough questions for reliable results.");
    }

    return {
      isComplete,
      dimensionCounts,
      recommendations
    };
  }
}

export default MBTICalculationEngine;