import { Request, Response } from "express";
import { ScoreController } from "../score-tracking.controller";
import mongoose from "mongoose";

// Mock mongoose completely
jest.mock("mongoose", () => ({
  Schema: jest.fn().mockImplementation(() => ({})),
  model: jest.fn(),
  Types: {
    ObjectId: {
      isValid: jest.fn(),
    },
  },
  connection: {
    collection: jest.fn(),
  },
}));

// Mock the Subject model
jest.mock("../../subjects/subject.model", () => ({
  Subject: {
    findOne: jest.fn(),
  },
}));

import { Subject } from "../../subjects/subject.model";
const mockSubject = Subject as jest.Mocked<typeof Subject>;

describe("ScoreController", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    
    mockRequest = {
      userId: "507f1f77bcf86cd799439011", // Mock authenticated user ID
    };
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };

    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("should return user scores with subject information", async () => {
      const mockScores = [
        {
          _id: "score1",
          userID: "507f1f77bcf86cd799439011",
          subjectID: "subject1",
          score: 8.5,
          examDate: new Date("2024-01-15"),
          examType: "Kiểm tra 15 phút",
          notes: "Bài kiểm tra tốt",
          subject: {
            _id: "subject1",
            name: "Toán học",
            code: "TOAN",
            description: "Môn Toán học",
          },
        },
        {
          _id: "score2",
          userID: "507f1f77bcf86cd799439011",
          subjectID: "subject2",
          score: 7.0,
          examDate: new Date("2024-01-10"),
          examType: "Kiểm tra 1 tiết",
          notes: "",
          subject: {
            _id: "subject2",
            name: "Vật lý",
            code: "LY",
            description: "Môn Vật lý",
          },
        },
      ];

      mockRequest.query = { page: "1", limit: "10" };

      // Mock mongoose aggregation
      const mockCollection = {
        aggregate: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue(mockScores),
        }),
      };
      (mongoose.connection.collection as jest.Mock).mockReturnValue(mockCollection);

      await ScoreController.getAll(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: "Lấy danh sách điểm thành công",
        data: {
          items: mockScores,
          pagination: { total: 0, page: 1, limit: 10 },
          average: "7.8", // (8.5 + 7.0) / 2 = 7.75 rounded to 7.8
        },
      });
    });

    it("should filter scores by subject when subjectId is provided", async () => {
      mockRequest.query = { page: "1", limit: "10", subjectId: "subject1" };

      const mockCollection = {
        aggregate: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([]),
        }),
      };
      (mongoose.connection.collection as jest.Mock).mockReturnValue(mockCollection);

      await ScoreController.getAll(mockRequest as Request, mockResponse as Response);

      // Verify that the aggregation pipeline includes subject filtering
      const aggregateCalls = mockCollection.aggregate.mock.calls;
      expect(aggregateCalls.length).toBeGreaterThan(0);
      
      // Check that the pipeline includes the subject filter
      const pipeline = aggregateCalls[0][0];
      expect(pipeline[0].$match.subjectID).toBeDefined();
    });
  });

  describe("create", () => {
    it("should create a new score successfully", async () => {
      const scoreData = {
        subjectId: "507f1f77bcf86cd799439012",
        score: 8.5,
        examDate: "2024-01-15",
        examType: "Kiểm tra 15 phút",
        notes: "Bài kiểm tra tốt",
      };

      mockRequest.body = scoreData;

      const mockSubjectData = {
        _id: scoreData.subjectId,
        name: "Toán học",
        code: "TOAN",
        isActive: true,
      };

      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
      mockSubject.findOne = jest.fn().mockResolvedValue(mockSubjectData);

      const mockCreatedScore = {
        _id: "newScoreId",
        userID: mockRequest.userId,
        subjectID: scoreData.subjectId,
        score: scoreData.score,
        examDate: new Date(scoreData.examDate),
        examType: scoreData.examType,
        notes: scoreData.notes,
        subject: mockSubjectData,
      };

      const mockCollection = {
        insertOne: jest.fn().mockResolvedValue({ insertedId: "newScoreId" }),
        aggregate: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([mockCreatedScore]),
        }),
      };
      (mongoose.connection.collection as jest.Mock).mockReturnValue(mockCollection);

      await ScoreController.create(mockRequest as Request, mockResponse as Response);

      expect(mockSubject.findOne).toHaveBeenCalledWith({
        _id: scoreData.subjectId,
        isActive: true,
      });
      expect(mockCollection.insertOne).toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: "Thêm điểm thành công",
        data: mockCreatedScore,
      });
    });

    it("should reject score creation with invalid subject ID", async () => {
      mockRequest.body = {
        subjectId: "invalid-id",
        score: 8.5,
        examDate: "2024-01-15",
        examType: "Kiểm tra 15 phút",
      };

      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(false);

      await ScoreController.create(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: "ID môn học không hợp lệ",
      });
    });

    it("should reject score creation with non-existent subject", async () => {
      mockRequest.body = {
        subjectId: "507f1f77bcf86cd799439012",
        score: 8.5,
        examDate: "2024-01-15",
        examType: "Kiểm tra 15 phút",
      };

      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
      mockSubject.findOne = jest.fn().mockResolvedValue(null);

      await ScoreController.create(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: "Môn học không tồn tại hoặc đã bị vô hiệu hóa",
      });
    });

    it("should reject score creation with invalid score range", async () => {
      mockRequest.body = {
        subjectId: "507f1f77bcf86cd799439012",
        score: 11, // Invalid score > 10
        examDate: "2024-01-15",
        examType: "Kiểm tra 15 phút",
      };

      await ScoreController.create(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: "Điểm số phải từ 0 đến 10",
      });
    });

    it("should reject score creation with missing required fields", async () => {
      mockRequest.body = {
        score: 8.5,
        // Missing subjectId, examDate, examType
      };

      await ScoreController.create(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin",
      });
    });
  });

  describe("getScoresBySubject", () => {
    it("should return scores grouped by subject with averages", async () => {
      const mockGroupedScores = [
        {
          _id: "subject1",
          subject: {
            _id: "subject1",
            name: "Toán học",
            code: "TOAN",
          },
          scores: [
            { score: 8.5, examDate: new Date("2024-01-15") },
            { score: 7.5, examDate: new Date("2024-01-10") },
          ],
          averageScore: 8.0,
          totalScores: 2,
          latestScore: new Date("2024-01-15"),
        },
        {
          _id: "subject2",
          subject: {
            _id: "subject2",
            name: "Vật lý",
            code: "LY",
          },
          scores: [
            { score: 7.0, examDate: new Date("2024-01-12") },
          ],
          averageScore: 7.0,
          totalScores: 1,
          latestScore: new Date("2024-01-12"),
        },
      ];

      const mockCollection = {
        aggregate: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue(mockGroupedScores),
        }),
      };
      (mongoose.connection.collection as jest.Mock).mockReturnValue(mockCollection);

      await ScoreController.getScoresBySubject(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: "Lấy điểm theo môn học thành công",
        data: mockGroupedScores,
      });
    });
  });

  describe("update", () => {
    it("should update score successfully", async () => {
      const scoreId = "507f1f77bcf86cd799439013";
      const updateData = {
        score: 9.0,
        notes: "Cập nhật điểm",
      };

      mockRequest.params = { id: scoreId };
      mockRequest.body = updateData;

      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);

      const mockCollection = {
        updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      };
      (mongoose.connection.collection as jest.Mock).mockReturnValue(mockCollection);

      await ScoreController.update(mockRequest as Request, mockResponse as Response);

      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        {
          _id: expect.any(Object),
          userID: expect.any(Object),
        },
        {
          $set: expect.objectContaining({
            score: 9.0,
            notes: "Cập nhật điểm",
            updatedAt: expect.any(Date),
          }),
        }
      );
      expect(mockStatus).toHaveBeenCalledWith(200);
    });
  });

  describe("delete", () => {
    it("should delete score successfully", async () => {
      const scoreId = "507f1f77bcf86cd799439013";
      mockRequest.params = { id: scoreId };

      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);

      const mockCollection = {
        deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      };
      (mongoose.connection.collection as jest.Mock).mockReturnValue(mockCollection);

      await ScoreController.delete(mockRequest as Request, mockResponse as Response);

      expect(mockCollection.deleteOne).toHaveBeenCalledWith({
        _id: expect.any(Object),
        userID: expect.any(Object),
      });
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: "Xóa điểm thành công",
      });
    });
  });
});