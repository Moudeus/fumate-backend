import { Request, Response } from "express";
import { ApiResponseWrapper } from "../../interfaces/ApiResponseWrapper";
import mongoose from "mongoose";
import { body, validationResult } from "express-validator";
import { MBTIQuestion, MBTIType, MBTITestResult } from "./mbti.model";
import { Major } from "../majors/major.model";
import { MBTICalculationEngine } from "./mbti.engine";

// ==================== TypeScript Interfaces ====================
interface MBTIAnswerInput {
  questionId: string;
  choice: "a" | "b";
}

interface MBTIAnswerDb {
  questionID: mongoose.Types.ObjectId;
  choice: "a" | "b";
}

interface SubmitTestRequest {
  answers: MBTIAnswerInput[];
}

interface AddQuestionRequest {
  question: string;
  category: "E-I" | "S-N" | "T-F" | "J-P";
  firstAnswer: string;
  secondAnswer: string;
  order: number;
  inverted?: boolean;
}

interface BulkAddQuestionsRequest {
  questions: AddQuestionRequest[];
}

interface AddMBTITypeRequest {
  type: string;
  name: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  majors: string[]; // Array of Major IDs
}

// ==================== MBTI Controller ====================
export class MBTIController {
  
  // ==================== GET /questions ====================
  static async getQuestions(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const skip = (page - 1) * limit;
      const category = req.query.category as string | undefined;

      // Build query
      const queryFilter: Record<string, unknown> = { isActive: true };
      if (category && ["E-I", "S-N", "T-F", "J-P"].includes(category)) {
        queryFilter.category = category;
      }

      // Fetch questions
      const [questions, total] = await Promise.all([
        MBTIQuestion.find(queryFilter)
          .select("-createdAt -updatedAt")
          .sort({ category: 1, order: 1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        MBTIQuestion.countDocuments(queryFilter)
      ]);

      return res.status(200).json(
        ApiResponseWrapper.success("Lấy danh sách câu hỏi thành công", {
          items: questions,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        })
      );
    } catch (error) {
      console.error("Get MBTI questions error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // ==================== GET /types ====================
  static async getMBTITypes(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const skip = (page - 1) * limit;

      const [types, total] = await Promise.all([
        MBTIType.find({ isActive: true })
          .populate('majors', 'name code description')
          .sort({ type: 1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        MBTIType.countDocuments({ isActive: true })
      ]);

      return res.status(200).json(
        ApiResponseWrapper.success("Lấy danh sách MBTI types thành công", {
          items: types,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        })
      );
    } catch (error) {
      console.error("Get MBTI types error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // ==================== GET /types/:type ====================
  static async getMBTITypeByType(req: Request, res: Response) {
    try {
      const { type } = req.params;
      
      if (!type || typeof type !== 'string' || type.length !== 4) {
        return res.status(400).json(ApiResponseWrapper.error("MBTI type không hợp lệ"));
      }

      const mbtiType = await MBTIType.findOne({ 
        type: type.toUpperCase(), 
        isActive: true 
      }).populate('majors', 'name code description').lean();

      if (!mbtiType) {
        return res.status(404).json(ApiResponseWrapper.error("Không tìm thấy MBTI type"));
      }

      return res.status(200).json(
        ApiResponseWrapper.success("Lấy MBTI type thành công", mbtiType)
      );
    } catch (error) {
      console.error("Get MBTI type by type error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // ==================== POST /questions (Admin) ====================
  static async addQuestion(req: Request, res: Response) {
    try {
      const validationErrors = validationResult(req);
      if (!validationErrors.isEmpty()) {
        return res.status(400).json(
          ApiResponseWrapper.error("Dữ liệu không hợp lệ", validationErrors.array() as any)
        );
      }

      const { question, category, firstAnswer, secondAnswer, order, inverted } = req.body as AddQuestionRequest;

      // Check for duplicate order within category
      const existingQuestion = await MBTIQuestion.findOne({ category, order });
      if (existingQuestion) {
        return res.status(409).json(
          ApiResponseWrapper.error(`Câu hỏi với order ${order} đã tồn tại trong category ${category}`)
        );
      }

      const newQuestion = new MBTIQuestion({
        question,
        category,
        firstAnswer,
        secondAnswer,
        order,
        inverted: inverted || false
      });

      await newQuestion.save();

      return res.status(201).json(
        ApiResponseWrapper.success("Thêm câu hỏi thành công", newQuestion)
      );
    } catch (error) {
      console.error("Add MBTI question error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // ==================== POST /questions/bulk (Admin) ====================
  static async bulkAddQuestions(req: Request, res: Response) {
    try {
      const validationErrors = validationResult(req);
      if (!validationErrors.isEmpty()) {
        return res.status(400).json(
          ApiResponseWrapper.error("Dữ liệu không hợp lệ", validationErrors.array() as any)
        );
      }

      const { questions } = req.body as BulkAddQuestionsRequest;

      if (!questions || !Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json(
          ApiResponseWrapper.error("Danh sách câu hỏi không được để trống")
        );
      }

      if (questions.length > 100) {
        return res.status(400).json(
          ApiResponseWrapper.error("Số lượng câu hỏi không được vượt quá 100")
        );
      }

      // Check for duplicates before inserting
      const existingOrders = await MBTIQuestion.find({
        $or: questions.map(q => ({ category: q.category, order: q.order }))
      }).select("category order").lean();

      if (existingOrders.length > 0) {
        const duplicates = existingOrders.map(e => `${e.category}-${e.order}`);
        return res.status(409).json(
          ApiResponseWrapper.error(
            `Các order đã tồn tại: ${duplicates.join(", ")}`,
            duplicates as any
          )
        );
      }

      // Execute bulk insert
      const insertedQuestions = await MBTIQuestion.insertMany(questions);

      return res.status(201).json(
        ApiResponseWrapper.success(`Đã thêm ${insertedQuestions.length} câu hỏi thành công`, {
          insertedCount: insertedQuestions.length
        })
      );
    } catch (error) {
      console.error("Bulk add MBTI questions error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // ==================== POST /types (Admin) ====================
  static async addMBTIType(req: Request, res: Response) {
    try {
      const validationErrors = validationResult(req);
      if (!validationErrors.isEmpty()) {
        return res.status(400).json(
          ApiResponseWrapper.error("Dữ liệu không hợp lệ", validationErrors.array() as any)
        );
      }

      const { type, name, description, strengths, weaknesses, majors } = req.body as AddMBTITypeRequest;

      // Check if type already exists
      const existingType = await MBTIType.findOne({ type: type.toUpperCase() });
      if (existingType) {
        return res.status(409).json(
          ApiResponseWrapper.error(`MBTI type ${type} đã tồn tại`)
        );
      }

      // Validate major IDs
      if (majors && majors.length > 0) {
        const validMajors = await Major.find({ 
          _id: { $in: majors.map(id => new mongoose.Types.ObjectId(id)) } 
        });
        if (validMajors.length !== majors.length) {
          return res.status(400).json(
            ApiResponseWrapper.error("Một số major ID không hợp lệ")
          );
        }
      }

      const newMBTIType = new MBTIType({
        type: type.toUpperCase(),
        name,
        description,
        strengths,
        weaknesses,
        majors: majors?.map(id => new mongoose.Types.ObjectId(id)) || []
      });

      await newMBTIType.save();

      // Populate majors for response
      await newMBTIType.populate('majors', 'name code description');

      return res.status(201).json(
        ApiResponseWrapper.success("Thêm MBTI type thành công", newMBTIType)
      );
    } catch (error) {
      console.error("Add MBTI type error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // ==================== POST /results ====================
  static async submitTest(req: Request, res: Response) {
    try {
      const validationErrors = validationResult(req);
      if (!validationErrors.isEmpty()) {
        return res.status(400).json(
          ApiResponseWrapper.error("Dữ liệu không hợp lệ", validationErrors.array() as any)
        );
      }

      const { answers } = req.body as SubmitTestRequest;
      const userId = req.userId!;

      // Step 1: Validate answers using the calculation engine
      const validation = MBTICalculationEngine.validateAnswers(answers);
      if (!validation.isValid) {
        return res.status(400).json(
          ApiResponseWrapper.error("Dữ liệu câu trả lời không hợp lệ", validation.errors)
        );
      }

      // Step 2: Analyze answer completeness
      const completenessAnalysis = await MBTICalculationEngine.analyzeAnswerCompleteness(answers);
      
      // Step 3: Calculate MBTI type using the calculation engine
      const calculationResult = await MBTICalculationEngine.calculateMBTIType({ answers });

      // Step 4: Convert answers to database format
      const validatedAnswers: MBTIAnswerDb[] = answers.map(answer => ({
        questionID: new mongoose.Types.ObjectId(answer.questionId),
        choice: answer.choice
      }));

      // Step 5: Save result to database
      const result = new MBTITestResult({
        userId: new mongoose.Types.ObjectId(userId),
        answers: validatedAnswers,
        resultType: calculationResult.resultType,
        scores: calculationResult.scores,
        description: calculationResult.typeInfo.description,
        strengths: calculationResult.typeInfo.strengths,
        weaknesses: calculationResult.typeInfo.weaknesses,
        majors: calculationResult.typeInfo.majors.map((major: any) => major._id || major)
      });

      await result.save();

      // Step 6: Update user's MBTI type
      await mongoose.connection.collection("users").updateOne(
        { _id: new mongoose.Types.ObjectId(userId) },
        { $set: { mbtiType: calculationResult.resultType } }
      );

      // Step 7: Return comprehensive result
      return res.status(200).json(
        ApiResponseWrapper.success("Hoàn thành bài trắc nghiệm MBTI", {
          resultId: result._id.toString(),
          resultType: calculationResult.resultType,
          typeName: calculationResult.typeInfo.name,
          description: calculationResult.typeInfo.description,
          strengths: calculationResult.typeInfo.strengths,
          weaknesses: calculationResult.typeInfo.weaknesses,
          majors: calculationResult.typeInfo.majors,
          scores: calculationResult.scores,
          percentages: calculationResult.percentages,
          confidence: calculationResult.confidence,
          completenessAnalysis: {
            isComplete: completenessAnalysis.isComplete,
            dimensionCounts: completenessAnalysis.dimensionCounts,
            recommendations: completenessAnalysis.recommendations
          }
        })
      );
    } catch (error) {
      console.error("Submit MBTI test error:", error);
      
      // Handle specific calculation engine errors
      if (error instanceof Error && error.message) {
        if (error.message.includes("No active questions found")) {
          return res.status(400).json(
            ApiResponseWrapper.error("Không có câu hỏi nào trong hệ thống")
          );
        }
        if (error.message.includes("Invalid question ID")) {
          return res.status(400).json(
            ApiResponseWrapper.error("Một số câu hỏi không hợp lệ")
          );
        }
        if (error.message.includes("MBTI type information not found")) {
          return res.status(500).json(
            ApiResponseWrapper.error("Không tìm thấy thông tin loại tính cách")
          );
        }
      }
      
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // ==================== GET /results ====================
  static async getResults(req: Request, res: Response) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(Math.max(1, parseInt(req.query.limit as string) || 10), 50);
      const skip = (page - 1) * limit;
      const userId = req.userId!;

      const [results, total] = await Promise.all([
        MBTITestResult.find({ userId: new mongoose.Types.ObjectId(userId) })
          .populate('majors', 'name code description')
          .select("-answers.questionID") // Exclude question IDs for cleaner response
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        MBTITestResult.countDocuments({ userId: new mongoose.Types.ObjectId(userId) })
      ]);

      return res.status(200).json(
        ApiResponseWrapper.success("Lấy lịch sử kết quả thành công", {
          items: results,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        })
      );
    } catch (error) {
      console.error("Get MBTI results error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // ==================== GET /results/:id ====================
  static async getResultById(req: Request, res: Response) {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(ApiResponseWrapper.error("ID kết quả không hợp lệ"));
      }

      const result = await MBTITestResult.findOne({
        _id: new mongoose.Types.ObjectId(id),
        userId: new mongoose.Types.ObjectId(userId)
      }).lean();

      if (!result) {
        return res.status(404).json(ApiResponseWrapper.error("Không tìm thấy kết quả"));
      }

      return res.status(200).json(
        ApiResponseWrapper.success("Lấy kết quả thành công", result)
      );
    } catch (error) {
      console.error("Get MBTI result by ID error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // ==================== POST /calculate ====================
  static async calculatePreview(req: Request, res: Response) {
    try {
      const validationErrors = validationResult(req);
      if (!validationErrors.isEmpty()) {
        return res.status(400).json(
          ApiResponseWrapper.error("Dữ liệu không hợp lệ", validationErrors.array() as any)
        );
      }

      const { answers } = req.body as SubmitTestRequest;

      // Step 1: Validate answers using the calculation engine
      const validation = MBTICalculationEngine.validateAnswers(answers);
      if (!validation.isValid) {
        return res.status(400).json(
          ApiResponseWrapper.error("Dữ liệu câu trả lời không hợp lệ", validation.errors)
        );
      }

      // Step 2: Analyze answer completeness
      const completenessAnalysis = await MBTICalculationEngine.analyzeAnswerCompleteness(answers);
      
      // Step 3: Calculate MBTI type using the calculation engine
      const calculationResult = await MBTICalculationEngine.calculateMBTIType({ answers });

      // Step 4: Return calculation result without saving
      return res.status(200).json(
        ApiResponseWrapper.success("Tính toán MBTI type thành công", {
          resultType: calculationResult.resultType,
          typeName: calculationResult.typeInfo.name,
          description: calculationResult.typeInfo.description,
          strengths: calculationResult.typeInfo.strengths,
          weaknesses: calculationResult.typeInfo.weaknesses,
          majors: calculationResult.typeInfo.majors,
          scores: calculationResult.scores,
          percentages: calculationResult.percentages,
          confidence: calculationResult.confidence,
          completenessAnalysis: {
            isComplete: completenessAnalysis.isComplete,
            dimensionCounts: completenessAnalysis.dimensionCounts,
            recommendations: completenessAnalysis.recommendations
          }
        })
      );
    } catch (error) {
      console.error("Calculate MBTI preview error:", error);
      
      // Handle specific calculation engine errors
      if (error instanceof Error && error.message) {
        if (error.message.includes("No active questions found")) {
          return res.status(400).json(
            ApiResponseWrapper.error("Không có câu hỏi nào trong hệ thống")
          );
        }
        if (error.message.includes("Invalid question ID")) {
          return res.status(400).json(
            ApiResponseWrapper.error("Một số câu hỏi không hợp lệ")
          );
        }
        if (error.message.includes("MBTI type information not found")) {
          return res.status(500).json(
            ApiResponseWrapper.error("Không tìm thấy thông tin loại tính cách")
          );
        }
      }
      
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }
}

// ==================== Validation Rules ====================
export const addQuestionValidation = [
  body("question")
    .trim()
    .notEmpty().withMessage("Câu hỏi không được để trống")
    .isLength({ max: 500 }).withMessage("Câu hỏi không được vượt quá 500 ký tự"),
  body("category")
    .isIn(["E-I", "S-N", "T-F", "J-P"]).withMessage("Category không hợp lệ"),
  body("firstAnswer")
    .trim()
    .notEmpty().withMessage("Câu trả lời đầu tiên không được để trống")
    .isLength({ max: 200 }).withMessage("Câu trả lời không được vượt quá 200 ký tự"),
  body("secondAnswer")
    .trim()
    .notEmpty().withMessage("Câu trả lời thứ hai không được để trống")
    .isLength({ max: 200 }).withMessage("Câu trả lời không được vượt quá 200 ký tự"),
  body("order")
    .isInt({ min: 0 }).withMessage("Order phải là số nguyên >= 0"),
  body("inverted")
    .optional()
    .isBoolean().withMessage("inverted phải là boolean")
];

export const bulkAddQuestionsValidation = [
  body("questions")
    .isArray({ min: 1, max: 100 }).withMessage("Số lượng câu hỏi phải từ 1-100"),
  body("questions.*.question")
    .trim()
    .notEmpty().withMessage("Câu hỏi không được để trống")
    .isLength({ max: 500 }).withMessage("Câu hỏi không được vượt quá 500 ký tự"),
  body("questions.*.category")
    .isIn(["E-I", "S-N", "T-F", "J-P"]).withMessage("Category không hợp lệ"),
  body("questions.*.firstAnswer")
    .trim()
    .notEmpty().withMessage("Câu trả lời đầu tiên không được để trống")
    .isLength({ max: 200 }).withMessage("Câu trả lời không được vượt quá 200 ký tự"),
  body("questions.*.secondAnswer")
    .trim()
    .notEmpty().withMessage("Câu trả lời thứ hai không được để trống")
    .isLength({ max: 200 }).withMessage("Câu trả lời không được vượt quá 200 ký tự"),
  body("questions.*.order")
    .isInt({ min: 0 }).withMessage("Order phải là số nguyên >= 0"),
  body("questions.*.inverted")
    .optional()
    .isBoolean().withMessage("inverted phải là boolean")
];

export const addMBTITypeValidation = [
  body("type")
    .trim()
    .notEmpty().withMessage("MBTI type không được để trống")
    .isLength({ min: 4, max: 4 }).withMessage("MBTI type phải có đúng 4 ký tự")
    .matches(/^[EINTSFPJ]{4}$/).withMessage("MBTI type không hợp lệ"),
  body("name")
    .trim()
    .notEmpty().withMessage("Tên type không được để trống")
    .isLength({ max: 100 }).withMessage("Tên không được vượt quá 100 ký tự"),
  body("description")
    .trim()
    .notEmpty().withMessage("Mô tả không được để trống")
    .isLength({ max: 1000 }).withMessage("Mô tả không được vượt quá 1000 ký tự"),
  body("strengths")
    .isArray({ min: 1 }).withMessage("Phải có ít nhất 1 điểm mạnh"),
  body("strengths.*")
    .trim()
    .notEmpty().withMessage("Điểm mạnh không được để trống")
    .isLength({ max: 100 }).withMessage("Điểm mạnh không được vượt quá 100 ký tự"),
  body("weaknesses")
    .isArray({ min: 1 }).withMessage("Phải có ít nhất 1 điểm yếu"),
  body("weaknesses.*")
    .trim()
    .notEmpty().withMessage("Điểm yếu không được để trống")
    .isLength({ max: 100 }).withMessage("Điểm yếu không được vượt quá 100 ký tự"),
  body("majors")
    .optional()
    .isArray().withMessage("Majors phải là mảng"),
  body("majors.*")
    .optional()
    .isMongoId().withMessage("Major ID không hợp lệ")
];

export const submitTestValidation = [
  body("answers")
    .isArray({ min: 1 }).withMessage("Answers phải là mảng và có ít nhất 1 câu trả lời"),
  body("answers.*.questionId")
    .isMongoId().withMessage("questionId phải là MongoDB ObjectId"),
  body("answers.*.choice")
    .isIn(["a", "b"]).withMessage("Choice phải là 'a' hoặc 'b'")
];

export default MBTIController;
