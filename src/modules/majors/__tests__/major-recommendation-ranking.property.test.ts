import * as fc from 'fast-check';
import { MajorService } from '../major.service';
import { Major, MBTICompatibility } from '../major.model';
import mongoose from 'mongoose';

/**
 * Property-Based Test for Major Recommendation Ranking
 * 
 * **Feature: fu-mate-mobile-enhancement, Property 7: Major Recommendation Ranking**
 * **Validates: Requirements 5.1, 5.2, 5.4**
 * 
 * This test verifies that for any MBTI result, majors should be ranked by 
 * compatibility percentage and display complete information including 
 * descriptions and career paths.
 */

// Mock the models
jest.mock('../major.model');

const mockMajor = Major as jest.Mocked<typeof Major>;
const mockMBTICompatibility = MBTICompatibility as jest.Mocked<typeof MBTICompatibility>;

describe('Feature: fu-mate-mobile-enhancement, Property 7: Major Recommendation Ranking', () => {
  
  // Generator for valid MBTI types (16 personality types)
  const mbtiTypeGenerator = fc.constantFrom(
    'INTJ', 'INTP', 'ENTJ', 'ENTP',
    'INFJ', 'INFP', 'ENFJ', 'ENFP', 
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
    'ISTP', 'ISFP', 'ESTP', 'ESFP'
  );

  // Generator for MongoDB ObjectIds
  const objectIdGenerator = fc.integer().map(() => new mongoose.Types.ObjectId());

  // Generator for compatibility scores (0-100)
  const compatibilityScoreGenerator = fc.integer({ min: 0, max: 100 });

  // Generator for major names (Vietnamese university majors)
  const majorNameGenerator = fc.constantFrom(
    'Công nghệ thông tin',
    'Quản trị kinh doanh', 
    'Kế toán',
    'Marketing',
    'Tài chính - Ngân hàng',
    'Luật kinh tế',
    'Ngôn ngữ Anh',
    'Thiết kế đồ họa',
    'Kiến trúc',
    'Y học',
    'Dược học',
    'Kỹ thuật cơ khí',
    'Kỹ thuật điện',
    'Kỹ thuật xây dựng',
    'Tâm lý học',
    'Giáo dục học',
    'Báo chí - Truyền thông',
    'Du lịch',
    'Khách sạn - Nhà hàng',
    'Nông nghiệp'
  );

  // Generator for major codes
  const majorCodeGenerator = fc.string({ minLength: 2, maxLength: 8 }).map(s => s.toUpperCase());

  // Generator for career paths
  const careerPathsGenerator = fc.array(
    fc.constantFrom(
      'Lập trình viên', 'Phân tích hệ thống', 'Quản lý dự án IT',
      'Giám đốc điều hành', 'Trưởng phòng kinh doanh', 'Chuyên viên tư vấn',
      'Kế toán trưởng', 'Kiểm toán viên', 'Chuyên viên tài chính',
      'Chuyên viên marketing', 'Quản lý thương hiệu', 'Nhà nghiên cứu thị trường',
      'Chuyên viên ngân hàng', 'Phân tích tài chính', 'Quản lý rủi ro',
      'Luật sư', 'Tư vấn pháp lý', 'Chuyên viên pháp chế',
      'Giảng viên', 'Biên dịch viên', 'Hướng dẫn viên du lịch',
      'Nhà thiết kế', 'Nghệ sĩ đồ họa', 'Creative Director',
      'Kiến trúc sư', 'Thiết kế nội thất', 'Quy hoạch đô thị',
      'Bác sĩ', 'Y tá', 'Chuyên gia y tế',
      'Dược sĩ', 'Nghiên cứu dược phẩm', 'Quản lý chất lượng dược',
      'Kỹ sư cơ khí', 'Thiết kế sản phẩm', 'Quản lý sản xuất',
      'Kỹ sư điện', 'Thiết kế mạch điện', 'Quản lý năng lượng',
      'Kỹ sư xây dựng', 'Giám sát công trình', 'Quản lý dự án xây dựng',
      'Nhà tâm lý học', 'Tư vấn tâm lý', 'Nghiên cứu hành vi',
      'Giáo viên', 'Chuyên gia giáo dục', 'Quản lý giáo dục',
      'Nhà báo', 'Biên tập viên', 'Chuyên gia truyền thông',
      'Hướng dẫn viên du lịch', 'Quản lý tour', 'Chuyên viên lữ hành',
      'Quản lý khách sạn', 'Đầu bếp', 'Chuyên viên dịch vụ',
      'Kỹ sư nông nghiệp', 'Chuyên gia dinh dưỡng', 'Quản lý trang trại'
    ),
    { minLength: 2, maxLength: 8 }
  );

  // Generator for major descriptions
  const majorDescriptionGenerator = fc.string({ minLength: 50, maxLength: 300 });

  // Generator for compatibility descriptions
  const compatibilityDescriptionGenerator = fc.string({ minLength: 30, maxLength: 200 });

  // Generator for strengths and challenges
  const strengthsGenerator = fc.array(
    fc.constantFrom(
      'Tư duy logic mạnh mẽ', 'Khả năng phân tích tốt', 'Sáng tạo và đổi mới',
      'Kỹ năng giao tiếp xuất sắc', 'Lãnh đạo tự nhiên', 'Tổ chức và quản lý tốt',
      'Kiên nhẫn và tỉ mỉ', 'Khả năng làm việc nhóm', 'Tư duy chiến lược',
      'Khả năng giải quyết vấn đề', 'Tính độc lập cao', 'Khả năng thích ứng nhanh',
      'Tư duy phê phán', 'Khả năng nghiên cứu', 'Kỹ năng thuyết trình',
      'Tính cẩn thận và chính xác', 'Khả năng đa nhiệm', 'Tư duy sáng tạo'
    ),
    { minLength: 2, maxLength: 6 }
  );

  const challengesGenerator = fc.array(
    fc.constantFrom(
      'Có thể quá cầu toàn', 'Khó khăn trong giao tiếp', 'Thiếu kiên nhẫn',
      'Có thể quá tự tin', 'Khó chấp nhận phê bình', 'Thiếu tính linh hoạt',
      'Có thể quá chi tiết', 'Khó đưa ra quyết định nhanh', 'Thiếu tính thực tế',
      'Có thể quá nhạy cảm', 'Khó làm việc dưới áp lực', 'Thiếu tính tổ chức',
      'Có thể quá bảo thủ', 'Khó thích ứng với thay đổi', 'Thiếu tự tin',
      'Có thể quá cạnh tranh', 'Khó kiểm soát cảm xúc', 'Thiếu kinh nghiệm thực tế'
    ),
    { minLength: 1, maxLength: 4 }
  );

  // Generator for career examples
  const careerExamplesGenerator = fc.array(
    fc.constantFrom(
      'Software Engineer tại Google', 'Product Manager tại Microsoft',
      'CEO của startup công nghệ', 'Giám đốc Marketing tại Unilever',
      'Kế toán trưởng tại Big 4', 'Luật sư tại công ty luật hàng đầu',
      'Bác sĩ chuyên khoa', 'Kiến trúc sư nổi tiếng',
      'Nhà thiết kế thời trang', 'Nhà báo điều tra',
      'Giáo sư đại học', 'Nhà tâm lý học lâm sàng',
      'Chuyên gia tư vấn quản lý', 'Nhà nghiên cứu khoa học',
      'Doanh nhân thành công', 'Chuyên gia phân tích dữ liệu'
    ),
    { minLength: 2, maxLength: 5 }
  );

  // Generator for complete major data
  const majorDataGenerator = fc.record({
    _id: objectIdGenerator,
    code: majorCodeGenerator,
    name: majorNameGenerator,
    description: majorDescriptionGenerator,
    careerPaths: careerPathsGenerator,
    duration: fc.integer({ min: 2, max: 6 }),
    degreeLevel: fc.constantFrom('Bachelor', 'Master', 'PhD'),
    salaryRange: fc.record({
      min: fc.integer({ min: 5000000, max: 15000000 }),
      max: fc.integer({ min: 20000000, max: 100000000 })
    }),
    isActive: fc.constant(true)
  });

  // Generator for MBTI compatibility data
  const mbtiCompatibilityGenerator = (majorId: mongoose.Types.ObjectId, mbtiType: string) => 
    fc.record({
      _id: objectIdGenerator,
      majorId: fc.constant(majorId),
      mbtiType: fc.constant(mbtiType),
      compatibilityScore: compatibilityScoreGenerator,
      description: compatibilityDescriptionGenerator,
      strengths: strengthsGenerator,
      challenges: challengesGenerator,
      careerExamples: careerExamplesGenerator,
      isActive: fc.constant(true)
    });

  // Generator for test data with majors and their compatibility scores
  const testDataGenerator = fc.record({
    mbtiType: mbtiTypeGenerator,
    majorCount: fc.integer({ min: 3, max: 10 })
  }).chain(({ mbtiType, majorCount }) => {
    return fc.array(majorDataGenerator, { minLength: majorCount, maxLength: majorCount })
      .chain(majors => {
        // Ensure unique major codes
        const uniqueMajors = majors.map((major, index) => ({
          ...major,
          code: `${major.code}${index}` // Make codes unique by appending index
        }));

        return fc.array(
          fc.tuple(
            fc.constantFrom(...uniqueMajors.map(m => m._id)),
            mbtiCompatibilityGenerator(uniqueMajors[0]._id, mbtiType)
          ),
          { minLength: majorCount, maxLength: majorCount }
        ).map(compatibilityPairs => {
          const compatibilities = compatibilityPairs.map(([majorId, compatibilityTemplate], index) => ({
            ...compatibilityTemplate,
            majorId: uniqueMajors[index]._id
          }));

          return {
            mbtiType,
            majors: uniqueMajors,
            compatibilities
          };
        });
      });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should rank majors by MBTI compatibility percentage in descending order', async () => {
    await fc.assert(fc.asyncProperty(
      testDataGenerator,
      async ({ mbtiType, majors, compatibilities }) => {
        // Mock the aggregation pipeline to return majors with compatibility scores
        const expectedResults = majors.map((major, index) => {
          const compatibility = compatibilities[index];
          return {
            _id: major._id,
            code: major.code,
            name: major.name,
            description: major.description,
            careerPaths: major.careerPaths,
            compatibilityScore: compatibility.compatibilityScore,
            compatibilityDescription: compatibility.description,
            strengths: compatibility.strengths,
            challenges: compatibility.challenges,
            careerExamples: compatibility.careerExamples
          };
        }).sort((a, b) => b.compatibilityScore - a.compatibilityScore); // Sort by compatibility score descending

        mockMajor.aggregate = jest.fn().mockResolvedValue(expectedResults);

        // Call the service method
        const result = await MajorService.getMajorsByMBTICompatibility(mbtiType, 10);

        // Property 1: Majors should be ranked by compatibility percentage (Requirement 5.1)
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(expectedResults.length);
        
        // Verify ranking is in descending order of compatibility score
        for (let i = 0; i < result.length - 1; i++) {
          expect(result[i].compatibilityScore).toBeGreaterThanOrEqual(result[i + 1].compatibilityScore);
        }

        // Verify the aggregation pipeline was called correctly
        expect(mockMajor.aggregate).toHaveBeenCalledWith([
          {
            $lookup: {
              from: 'mbti_compatibility',
              localField: '_id',
              foreignField: 'majorId',
              as: 'compatibility'
            }
          },
          {
            $unwind: '$compatibility'
          },
          {
            $match: {
              'compatibility.mbtiType': mbtiType.toUpperCase(),
              'compatibility.isActive': true,
              'isActive': true
            }
          },
          {
            $sort: { 'compatibility.compatibilityScore': -1 }
          },
          {
            $limit: 10
          },
          {
            $project: {
              code: 1,
              name: 1,
              description: 1,
              careerPaths: 1,
              compatibilityScore: '$compatibility.compatibilityScore',
              compatibilityDescription: '$compatibility.description',
              strengths: '$compatibility.strengths',
              challenges: '$compatibility.challenges',
              careerExamples: '$compatibility.careerExamples'
            }
          }
        ]);
      }
    ), { numRuns: 100 });
  });

  it('should display complete major information including descriptions and career paths', async () => {
    await fc.assert(fc.asyncProperty(
      testDataGenerator,
      async ({ mbtiType, majors, compatibilities }) => {
        // Create expected results with complete information
        const expectedResults = majors.map((major, index) => {
          const compatibility = compatibilities[index];
          return {
            _id: major._id,
            code: major.code,
            name: major.name,
            description: major.description,
            careerPaths: major.careerPaths,
            compatibilityScore: compatibility.compatibilityScore,
            compatibilityDescription: compatibility.description,
            strengths: compatibility.strengths,
            challenges: compatibility.challenges,
            careerExamples: compatibility.careerExamples
          };
        }).sort((a, b) => b.compatibilityScore - a.compatibilityScore);

        mockMajor.aggregate = jest.fn().mockResolvedValue(expectedResults);

        const result = await MajorService.getMajorsByMBTICompatibility(mbtiType, 10);

        // Property 2: Display complete information including descriptions (Requirement 5.2)
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        
        result.forEach((major, index) => {
          const expectedMajor = expectedResults[index];
          
          // Verify all required major information is present
          expect(major.code).toBeDefined();
          expect(major.name).toBeDefined();
          expect(major.description).toBeDefined();
          expect(major.description).toBe(expectedMajor.description);
          
          // Verify compatibility information is complete
          expect(major.compatibilityScore).toBeDefined();
          expect(major.compatibilityScore).toBe(expectedMajor.compatibilityScore);
          expect(major.compatibilityDescription).toBeDefined();
          expect(major.compatibilityDescription).toBe(expectedMajor.compatibilityDescription);
          
          // Verify strengths and challenges are provided
          expect(Array.isArray(major.strengths)).toBe(true);
          expect(major.strengths.length).toBeGreaterThan(0);
          expect(major.strengths).toEqual(expectedMajor.strengths);
          
          expect(Array.isArray(major.challenges)).toBe(true);
          expect(major.challenges).toEqual(expectedMajor.challenges);
        });
      }
    ), { numRuns: 100 });
  });

  it('should display complete career path information', async () => {
    await fc.assert(fc.asyncProperty(
      testDataGenerator,
      async ({ mbtiType, majors, compatibilities }) => {
        const expectedResults = majors.map((major, index) => {
          const compatibility = compatibilities[index];
          return {
            _id: major._id,
            code: major.code,
            name: major.name,
            description: major.description,
            careerPaths: major.careerPaths,
            compatibilityScore: compatibility.compatibilityScore,
            compatibilityDescription: compatibility.description,
            strengths: compatibility.strengths,
            challenges: compatibility.challenges,
            careerExamples: compatibility.careerExamples
          };
        }).sort((a, b) => b.compatibilityScore - a.compatibilityScore);

        mockMajor.aggregate = jest.fn().mockResolvedValue(expectedResults);

        const result = await MajorService.getMajorsByMBTICompatibility(mbtiType, 10);

        // Property 3: Display complete career path information (Requirement 5.4)
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        
        result.forEach((major, index) => {
          const expectedMajor = expectedResults[index];
          
          // Verify career paths are provided and complete
          expect(Array.isArray(major.careerPaths)).toBe(true);
          expect(major.careerPaths.length).toBeGreaterThan(0);
          expect(major.careerPaths).toEqual(expectedMajor.careerPaths);
          
          // Verify career examples are provided
          expect(Array.isArray(major.careerExamples)).toBe(true);
          expect(major.careerExamples.length).toBeGreaterThan(0);
          expect(major.careerExamples).toEqual(expectedMajor.careerExamples);
          
          // Verify career information is meaningful (not empty strings)
          major.careerPaths.forEach(career => {
            expect(typeof career).toBe('string');
            expect(career.trim().length).toBeGreaterThan(0);
          });
          
          major.careerExamples.forEach(example => {
            expect(typeof example).toBe('string');
            expect(example.trim().length).toBeGreaterThan(0);
          });
        });
      }
    ), { numRuns: 100 });
  });

  it('should handle edge cases with minimal and maximal data', async () => {
    await fc.assert(fc.asyncProperty(
      fc.record({
        mbtiType: mbtiTypeGenerator,
        scenario: fc.constantFrom('empty', 'single', 'many')
      }),
      async ({ mbtiType, scenario }) => {
        let expectedResults: any[] = [];
        
        if (scenario === 'empty') {
          // No majors found for this MBTI type
          expectedResults = [];
        } else if (scenario === 'single') {
          // Single major with minimal data
          expectedResults = [{
            _id: new mongoose.Types.ObjectId(),
            code: 'TEST',
            name: 'Test Major',
            description: 'A test major for validation purposes',
            careerPaths: ['Test Career'],
            compatibilityScore: 50,
            compatibilityDescription: 'Moderate compatibility',
            strengths: ['Test Strength'],
            challenges: ['Test Challenge'],
            careerExamples: ['Test Example']
          }];
        } else {
          // Many majors (stress test)
          expectedResults = Array.from({ length: 20 }, (_, i) => ({
            _id: new mongoose.Types.ObjectId(),
            code: `TEST${i}`,
            name: `Test Major ${i}`,
            description: `Description for test major ${i}`,
            careerPaths: [`Career ${i}A`, `Career ${i}B`],
            compatibilityScore: 100 - i, // Descending scores
            compatibilityDescription: `Compatibility description ${i}`,
            strengths: [`Strength ${i}A`, `Strength ${i}B`],
            challenges: [`Challenge ${i}`],
            careerExamples: [`Example ${i}A`, `Example ${i}B`]
          }));
        }

        mockMajor.aggregate = jest.fn().mockResolvedValue(expectedResults);

        const result = await MajorService.getMajorsByMBTICompatibility(mbtiType, 10);

        // Verify edge case handling
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(Math.min(expectedResults.length, 10)); // Respect limit

        if (result.length > 0) {
          // Verify ranking is maintained even in edge cases
          for (let i = 0; i < result.length - 1; i++) {
            expect(result[i].compatibilityScore).toBeGreaterThanOrEqual(result[i + 1].compatibilityScore);
          }

          // Verify all required fields are present
          result.forEach(major => {
            expect(major.code).toBeDefined();
            expect(major.name).toBeDefined();
            expect(major.description).toBeDefined();
            expect(major.compatibilityScore).toBeDefined();
            expect(Array.isArray(major.careerPaths)).toBe(true);
            expect(Array.isArray(major.careerExamples)).toBe(true);
          });
        }
      }
    ), { numRuns: 50 });
  });

  it('should validate MBTI type format and handle invalid inputs', async () => {
    await fc.assert(fc.asyncProperty(
      fc.oneof(
        fc.string({ minLength: 1, maxLength: 3 }), // Too short
        fc.string({ minLength: 5, maxLength: 10 }), // Too long
        fc.constant(''), // Empty string
        fc.constant('XXXX'), // Invalid characters
        fc.constant('intj'), // Lowercase (should be converted)
        fc.constant(null as any), // Null
        fc.constant(undefined as any) // Undefined
      ),
      async (invalidMbtiType) => {
        // Test invalid MBTI type handling
        if (!invalidMbtiType || typeof invalidMbtiType !== 'string' || invalidMbtiType.length !== 4) {
          await expect(MajorService.getMajorsByMBTICompatibility(invalidMbtiType, 10))
            .rejects.toThrow('Invalid MBTI type format');
        } else if (invalidMbtiType === 'intj') {
          // Test case conversion
          mockMajor.aggregate = jest.fn().mockResolvedValue([]);
          
          await MajorService.getMajorsByMBTICompatibility(invalidMbtiType, 10);
          
          // Verify the MBTI type was converted to uppercase
          expect(mockMajor.aggregate).toHaveBeenCalledWith(
            expect.arrayContaining([
              expect.objectContaining({
                $match: expect.objectContaining({
                  'compatibility.mbtiType': 'INTJ'
                })
              })
            ])
          );
        }
      }
    ), { numRuns: 50 });
  });

  it('should maintain consistency across multiple calls with same MBTI type', async () => {
    await fc.assert(fc.asyncProperty(
      testDataGenerator,
      async ({ mbtiType, majors, compatibilities }) => {
        const expectedResults = majors.map((major, index) => {
          const compatibility = compatibilities[index];
          return {
            _id: major._id,
            code: major.code,
            name: major.name,
            description: major.description,
            careerPaths: major.careerPaths,
            compatibilityScore: compatibility.compatibilityScore,
            compatibilityDescription: compatibility.description,
            strengths: compatibility.strengths,
            challenges: compatibility.challenges,
            careerExamples: compatibility.careerExamples
          };
        }).sort((a, b) => b.compatibilityScore - a.compatibilityScore);

        mockMajor.aggregate = jest.fn().mockResolvedValue(expectedResults);

        // Call the service multiple times with the same MBTI type
        const result1 = await MajorService.getMajorsByMBTICompatibility(mbtiType, 10);
        const result2 = await MajorService.getMajorsByMBTICompatibility(mbtiType, 10);

        // Results should be identical (deterministic)
        expect(result1).toEqual(result2);
        
        // Verify both calls used the same parameters
        expect(mockMajor.aggregate).toHaveBeenCalledTimes(2);
        
        const calls = (mockMajor.aggregate as jest.Mock).mock.calls;
        expect(calls[0]).toEqual(calls[1]);
      }
    ), { numRuns: 30 });
  });

  it('should respect the limit parameter for result count', async () => {
    await fc.assert(fc.asyncProperty(
      testDataGenerator,
      fc.integer({ min: 1, max: 20 }),
      async ({ mbtiType, majors, compatibilities }, limit) => {
        const expectedResults = majors.map((major, index) => {
          const compatibility = compatibilities[index];
          return {
            _id: major._id,
            code: major.code,
            name: major.name,
            description: major.description,
            careerPaths: major.careerPaths,
            compatibilityScore: compatibility.compatibilityScore,
            compatibilityDescription: compatibility.description,
            strengths: compatibility.strengths,
            challenges: compatibility.challenges,
            careerExamples: compatibility.careerExamples
          };
        }).sort((a, b) => b.compatibilityScore - a.compatibilityScore);

        mockMajor.aggregate = jest.fn().mockResolvedValue(expectedResults.slice(0, limit));

        const result = await MajorService.getMajorsByMBTICompatibility(mbtiType, limit);

        // Verify the limit is respected
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeLessThanOrEqual(limit);
        expect(result.length).toBeLessThanOrEqual(expectedResults.length);

        // Verify the limit was passed to the aggregation pipeline
        expect(mockMajor.aggregate).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              $limit: limit
            })
          ])
        );
      }
    ), { numRuns: 50 });
  });
});