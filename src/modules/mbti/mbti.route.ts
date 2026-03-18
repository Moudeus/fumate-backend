import { Router } from "express";
import { authenticate } from "../../middlewares/authMiddleware";
import { authorize } from "../../middlewares/roleMiddleware";
import { 
  MBTIController, 
  addQuestionValidation, 
  bulkAddQuestionsValidation, 
  addMBTITypeValidation,
  submitTestValidation 
} from "./mbti.controller";

const router = Router();

// ==================== Public Routes ====================

// GET /questions - Lấy danh sách câu hỏi (có pagination & filter by category)
router.get("/questions", MBTIController.getQuestions);

// GET /types - Lấy danh sách MBTI types
router.get("/types", MBTIController.getMBTITypes);

// GET /types/:type - Lấy thông tin chi tiết một MBTI type
router.get("/types/:type", MBTIController.getMBTITypeByType);

// ==================== Protected Routes (User) ====================

// POST /results - Nộp bài trắc nghiệm
router.post("/results", authenticate, submitTestValidation, MBTIController.submitTest);

// POST /calculate - Tính toán MBTI type mà không lưu kết quả (preview)
router.post("/calculate", authenticate, submitTestValidation, MBTIController.calculatePreview);

// GET /results - Lấy lịch sử kết quả của user
router.get("/results", authenticate, MBTIController.getResults);

// GET /results/:id - Lấy chi tiết một kết quả
router.get("/results/:id", authenticate, MBTIController.getResultById);

// ==================== Admin Routes ====================

// POST /questions - Admin: Thêm một câu hỏi
router.post("/questions", authenticate, authorize("admin"), addQuestionValidation, MBTIController.addQuestion);

// POST /questions/bulk - Admin: Bulk add nhiều câu hỏi
router.post("/questions/bulk", authenticate, authorize("admin"), bulkAddQuestionsValidation, MBTIController.bulkAddQuestions);

// POST /types - Admin: Thêm MBTI type
router.post("/types", authenticate, authorize("admin"), addMBTITypeValidation, MBTIController.addMBTIType);

export default router;
