import { Router } from 'express';
import { MajorController } from './major.controller';
import { authenticate } from '../../middlewares/authMiddleware';
import { authorize } from '../../middlewares/roleMiddleware';

const router = Router();

// ==================== Public Routes ====================
// Get all majors with pagination and search
router.get('/', MajorController.getAllMajors);

// Get major by ID
router.get('/:id', MajorController.getMajorById);

// Get majors ranked by MBTI compatibility
router.get('/recommendations/:mbtiType', MajorController.getMajorsByMBTICompatibility);

// Get compatibility data for a specific major and MBTI type
router.get('/:majorId/compatibility/:mbtiType', MajorController.getCompatibilityByMajorAndType);

// Get all compatibility records for a major
router.get('/:majorId/compatibility', MajorController.getCompatibilityByMajor);

// Get all compatibility records for an MBTI type
router.get('/compatibility/mbti/:mbtiType', MajorController.getCompatibilityByMBTIType);

// ==================== Protected Routes (Authenticated Users) ====================
// These routes require authentication but are accessible to all authenticated users

// ==================== Admin Only Routes ====================
// Create a new major
router.post('/', authenticate, authorize('admin'), MajorController.createMajor);

// Update major by ID
router.put('/:id', authenticate, authorize('admin'), MajorController.updateMajor);

// Delete major by ID
router.delete('/:id', authenticate, authorize('admin'), MajorController.deleteMajor);

// Create MBTI compatibility record
router.post('/compatibility', authenticate, authorize('admin'), MajorController.createMBTICompatibility);

// Update MBTI compatibility record
router.put('/compatibility/:id', authenticate, authorize('admin'), MajorController.updateMBTICompatibility);

// Delete MBTI compatibility record
router.delete('/compatibility/:id', authenticate, authorize('admin'), MajorController.deleteMBTICompatibility);

// Get major statistics
router.get('/analytics/statistics', authenticate, authorize('admin'), MajorController.getMajorStatistics);

// Get compatibility statistics
router.get('/analytics/compatibility', authenticate, authorize('admin'), MajorController.getCompatibilityStatistics);

export default router;