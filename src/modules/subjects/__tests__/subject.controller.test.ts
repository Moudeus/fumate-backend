import { Request, Response } from "express";
import { SubjectController } from "../subject.controller";
import mongoose from "mongoose";

// Mock mongoose completely
jest.mock("mongoose", () => ({
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
jest.mock("../subject.model", () => ({
  Subject: {
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
    prototype: {
      save: jest.fn(),
    },
  },
}));

import { Subject } from "../subject.model";
const mockSubject = Subject as jest.Mocked<typeof Subject>;

describe("SubjectController", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    
    mockRequest = {};
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };

    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("should return all active subjects successfully", async () => {
      const mockSubjects = [
        { _id: "1", name: "Toán học", code: "TOAN", description: "Môn Toán" },
        { _id: "2", name: "Vật lý", code: "LY", description: "Môn Lý" },
      ];

      mockRequest.query = { page: "1", limit: "50" };

      // Mock Subject.find chain
      const mockFind = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              sort: jest.fn().mockResolvedValue(mockSubjects),
            }),
          }),
        }),
      });
      mockSubject.find = mockFind;
      mockSubject.countDocuments = jest.fn().mockResolvedValue(2);

      await SubjectController.getAll(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        status: "success",
        message: "Lấy danh sách môn học thành công",
        data: {
          items: mockSubjects,
          pagination: { total: 2, page: 1, limit: 50 },
        },
      });
    });

    it("should handle search functionality", async () => {
      mockRequest.query = { page: "1", limit: "50", search: "Toán" };

      const mockFind = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              sort: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      });
      mockSubject.find = mockFind;
      mockSubject.countDocuments = jest.fn().mockResolvedValue(0);

      await SubjectController.getAll(mockRequest as Request, mockResponse as Response);

      expect(mockFind).toHaveBeenCalledWith({
        isActive: true,
        $text: { $search: "Toán" },
      });
    });
  });

  describe("create", () => {
    it("should create a new subject successfully", async () => {
      const newSubjectData = {
        name: "Hóa học",
        code: "HOA",
        description: "Môn Hóa học",
      };

      mockRequest.body = newSubjectData;

      const mockSavedSubject = {
        _id: "123",
        ...newSubjectData,
        code: "HOA",
        isActive: true,
      };

      mockSubject.findOne = jest.fn().mockResolvedValue(null); // No existing subject
      
      // Mock the Subject constructor and save method
      const mockSave = jest.fn().mockResolvedValue(mockSavedSubject);
      const MockSubjectConstructor = jest.fn().mockImplementation(() => ({
        ...mockSavedSubject,
        save: mockSave,
      }));
      
      // Replace the Subject import with our mock constructor
      const SubjectModule = require("../subject.model");
      SubjectModule.Subject = MockSubjectConstructor;

      await SubjectController.create(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        status: "success",
        message: "Tạo môn học thành công",
        data: expect.objectContaining({
          name: "Hóa học",
          code: "HOA",
        }),
      });
    });

    it("should reject creation with duplicate code", async () => {
      mockRequest.body = {
        name: "Hóa học",
        code: "TOAN", // Duplicate code
        description: "Môn Hóa học",
      };

      const existingSubject = { _id: "1", code: "TOAN" };
      mockSubject.findOne = jest.fn().mockResolvedValue(existingSubject);

      await SubjectController.create(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        status: "error",
        message: "Mã môn học đã tồn tại",
      });
    });

    it("should reject creation with missing required fields", async () => {
      mockRequest.body = {
        description: "Môn học không có tên",
      };

      await SubjectController.create(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        status: "error",
        message: "Tên và mã môn học là bắt buộc",
      });
    });
  });

  describe("getById", () => {
    it("should return subject by valid ID", async () => {
      const subjectId = "507f1f77bcf86cd799439011";
      const mockSubjectData = {
        _id: subjectId,
        name: "Toán học",
        code: "TOAN",
        description: "Môn Toán",
      };

      mockRequest.params = { id: subjectId };
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
      mockSubject.findById = jest.fn().mockResolvedValue(mockSubjectData);

      await SubjectController.getById(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        status: "success",
        message: "Lấy thông tin môn học thành công",
        data: mockSubjectData,
      });
    });

    it("should return 400 for invalid ID format", async () => {
      mockRequest.params = { id: "invalid-id" };
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(false);

      await SubjectController.getById(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        status: "error",
        message: "ID môn học không hợp lệ",
      });
    });

    it("should return 404 for non-existent subject", async () => {
      const subjectId = "507f1f77bcf86cd799439011";
      mockRequest.params = { id: subjectId };
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
      mockSubject.findById = jest.fn().mockResolvedValue(null);

      await SubjectController.getById(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        status: "error",
        message: "Không tìm thấy môn học",
      });
    });
  });

  describe("update", () => {
    it("should update subject successfully", async () => {
      const subjectId = "507f1f77bcf86cd799439011";
      const updateData = {
        name: "Toán học nâng cao",
        description: "Môn Toán nâng cao",
      };

      mockRequest.params = { id: subjectId };
      mockRequest.body = updateData;

      const mockExistingSubject = {
        _id: subjectId,
        name: "Toán học",
        code: "TOAN",
        description: "Môn Toán",
        save: jest.fn().mockResolvedValue(true),
      };

      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
      mockSubject.findById = jest.fn().mockResolvedValue(mockExistingSubject);

      await SubjectController.update(mockRequest as Request, mockResponse as Response);

      expect(mockExistingSubject.name).toBe(updateData.name);
      expect(mockExistingSubject.description).toBe(updateData.description);
      expect(mockExistingSubject.save).toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(200);
    });
  });

  describe("delete", () => {
    it("should soft delete subject with associated scores", async () => {
      const subjectId = "507f1f77bcf86cd799439011";
      mockRequest.params = { id: subjectId };

      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);

      // Mock mongoose connection for checking scores
      const mockCollection = {
        findOne: jest.fn().mockResolvedValue({ _id: "score1" }), // Has scores
      };
      (mongoose.connection.collection as jest.Mock).mockReturnValue(mockCollection);

      mockSubject.findByIdAndUpdate = jest.fn().mockResolvedValue(true);

      await SubjectController.delete(mockRequest as Request, mockResponse as Response);

      expect(mockSubject.findByIdAndUpdate).toHaveBeenCalledWith(subjectId, { isActive: false });
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        status: "success",
        message: "Môn học đã được vô hiệu hóa do có dữ liệu điểm liên quan",
      });
    });

    it("should hard delete subject without associated scores", async () => {
      const subjectId = "507f1f77bcf86cd799439011";
      mockRequest.params = { id: subjectId };

      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);

      // Mock mongoose connection for checking scores
      const mockCollection = {
        findOne: jest.fn().mockResolvedValue(null), // No scores
      };
      (mongoose.connection.collection as jest.Mock).mockReturnValue(mockCollection);

      mockSubject.findByIdAndDelete = jest.fn().mockResolvedValue(true);

      await SubjectController.delete(mockRequest as Request, mockResponse as Response);

      expect(mockSubject.findByIdAndDelete).toHaveBeenCalledWith(subjectId);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        status: "success",
        message: "Xóa môn học thành công",
      });
    });
  });
});