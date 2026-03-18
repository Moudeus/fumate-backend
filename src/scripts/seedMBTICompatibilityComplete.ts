import mongoose from 'mongoose';
import { MBTICompatibility } from '../modules/majors/major.model';
import { Major } from '../modules/majors/major.model';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Complete MBTI Compatibility mapping for all 16 personality types
 * Maps each MBTI type to suitable majors with compatibility scores
 */
const mbtiMajorMapping = [
  // Analysts (NT)
  {
    mbtiType: 'INTJ',
    name: 'The Architect',
    majors: [
      { code: 'CS', score: 95, description: 'Tư duy logic và khả năng giải quyết vấn đề phức tạp phù hợp với lập trình' },
      { code: 'CIVIL', score: 90, description: 'Khả năng lập kế hoạch chiến lược và tư duy hệ thống' },
      { code: 'LAW', score: 85, description: 'Phân tích logic và tư duy độc lập' },
      { code: 'BUS', score: 80, description: 'Tầm nhìn chiến lược và khả năng quản lý' }
    ]
  },
  {
    mbtiType: 'INTP',
    name: 'The Logician',
    majors: [
      { code: 'CS', score: 95, description: 'Tư duy phân tích và khả năng giải quyết vấn đề trừu tượng' },
      { code: 'PSYC', score: 85, description: 'Tò mò về hành vi con người và phân tích sâu' },
      { code: 'ENG', score: 75, description: 'Khả năng phân tích ngôn ngữ và cấu trúc' }
    ]
  },
  {
    mbtiType: 'ENTJ',
    name: 'The Commander',
    majors: [
      { code: 'BUS', score: 95, description: 'Khả năng lãnh đạo và tư duy chiến lược kinh doanh' },
      { code: 'LAW', score: 90, description: 'Quyết đoán và khả năng tranh luận' },
      { code: 'CS', score: 85, description: 'Tư duy logic và quản lý dự án công nghệ' }
    ]
  },
  {
    mbtiType: 'ENTP',
    name: 'The Debater',
    majors: [
      { code: 'LAW', score: 90, description: 'Khả năng tranh luận và tư duy phản biện' },
      { code: 'JOUR', score: 85, description: 'Sáng tạo và khả năng giao tiếp' },
      { code: 'BUS', score: 80, description: 'Đổi mới và khởi nghiệp' }
    ]
  },

  // Diplomats (NF)
  {
    mbtiType: 'INFJ',
    name: 'The Advocate',
    majors: [
      { code: 'PSYC', score: 95, description: 'Đồng cảm sâu sắc và hiểu biết về con người' },
      { code: 'MED', score: 85, description: 'Mong muốn giúp đỡ và chăm sóc người khác' },
      { code: 'ENG', score: 80, description: 'Khả năng giao tiếp và truyền đạt ý tưởng' }
    ]
  },
  {
    mbtiType: 'INFP',
    name: 'The Mediator',
    majors: [
      { code: 'ART', score: 95, description: 'Sáng tạo và thể hiện cảm xúc qua nghệ thuật' },
      { code: 'PSYC', score: 85, description: 'Đồng cảm và hiểu biết về tâm lý con người' },
      { code: 'ENG', score: 80, description: 'Khả năng viết và truyền đạt ý nghĩa sâu sắc' }
    ]
  },
  {
    mbtiType: 'ENFJ',
    name: 'The Protagonist',
    majors: [
      { code: 'PSYC', score: 90, description: 'Khả năng lãnh đạo và truyền cảm hứng' },
      { code: 'MED', score: 85, description: 'Chăm sóc và hỗ trợ người khác' },
      { code: 'BUS', score: 80, description: 'Quản lý nhân sự và phát triển tổ chức' }
    ]
  },
  {
    mbtiType: 'ENFP',
    name: 'The Campaigner',
    majors: [
      { code: 'JOUR', score: 90, description: 'Nhiệt tình và khả năng giao tiếp sáng tạo' },
      { code: 'ART', score: 85, description: 'Sáng tạo và thể hiện cá tính' },
      { code: 'BUS', score: 80, description: 'Marketing và quan hệ công chúng' }
    ]
  },

  // Sentinels (SJ)
  {
    mbtiType: 'ISTJ',
    name: 'The Logistician',
    majors: [
      { code: 'ACC', score: 95, description: 'Tính cẩn thận và chú ý đến chi tiết' },
      { code: 'CIVIL', score: 90, description: 'Thực tế và có tổ chức trong công việc' },
      { code: 'LAW', score: 85, description: 'Tuân thủ quy tắc và logic' }
    ]
  },
  {
    mbtiType: 'ISFJ',
    name: 'The Defender',
    majors: [
      { code: 'MED', score: 95, description: 'Chu đáo và quan tâm đến người khác' },
      { code: 'PSYC', score: 85, description: 'Đồng cảm và hỗ trợ' },
      { code: 'ACC', score: 75, description: 'Cẩn thận và đáng tin cậy' }
    ]
  },
  {
    mbtiType: 'ESTJ',
    name: 'The Executive',
    majors: [
      { code: 'BUS', score: 95, description: 'Khả năng quản lý và tổ chức' },
      { code: 'ACC', score: 90, description: 'Thực tế và có hệ thống' },
      { code: 'LAW', score: 85, description: 'Quyết đoán và tuân thủ quy tắc' }
    ]
  },
  {
    mbtiType: 'ESFJ',
    name: 'The Consul',
    majors: [
      { code: 'MED', score: 90, description: 'Quan tâm và chăm sóc người khác' },
      { code: 'PSYC', score: 85, description: 'Kỹ năng xã hội và đồng cảm' },
      { code: 'BUS', score: 80, description: 'Quản lý nhân sự và dịch vụ khách hàng' }
    ]
  },

  // Explorers (SP)
  {
    mbtiType: 'ISTP',
    name: 'The Virtuoso',
    majors: [
      { code: 'CIVIL', score: 90, description: 'Kỹ năng thực hành và giải quyết vấn đề' },
      { code: 'CS', score: 85, description: 'Tư duy logic và khả năng debug' },
      { code: 'ART', score: 75, description: 'Sáng tạo với tay nghề thủ công' }
    ]
  },
  {
    mbtiType: 'ISFP',
    name: 'The Adventurer',
    majors: [
      { code: 'ART', score: 95, description: 'Sáng tạo nghệ thuật và thẩm mỹ' },
      { code: 'MED', score: 80, description: 'Chăm sóc và hỗ trợ thực tế' },
      { code: 'PSYC', score: 75, description: 'Đồng cảm và linh hoạt' }
    ]
  },
  {
    mbtiType: 'ESTP',
    name: 'The Entrepreneur',
    majors: [
      { code: 'BUS', score: 95, description: 'Năng động và khả năng kinh doanh' },
      { code: 'CIVIL', score: 85, description: 'Thực tế và hành động' },
      { code: 'JOUR', score: 80, description: 'Giao tiếp và phản ứng nhanh' }
    ]
  },
  {
    mbtiType: 'ESFP',
    name: 'The Entertainer',
    majors: [
      { code: 'ART', score: 90, description: 'Biểu diễn và giải trí' },
      { code: 'JOUR', score: 85, description: 'Giao tiếp và thu hút công chúng' },
      { code: 'BUS', score: 80, description: 'Marketing và quan hệ khách hàng' }
    ]
  }
];

async function seedMBTICompatibilityComplete() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    console.log('🧠 Seeding Complete MBTI Compatibility Data...\n');

    // Get all majors
    const majors = await Major.find({});
    const majorMap = majors.reduce((map, major) => {
      map[major.code] = major._id;
      return map;
    }, {} as Record<string, mongoose.Types.ObjectId>);

    console.log(`📚 Found ${majors.length} majors in database`);
    console.log(`   Available major codes: ${Object.keys(majorMap).join(', ')}\n`);

    // Clear existing compatibility data
    await MBTICompatibility.deleteMany({});
    console.log('🗑️  Cleared existing MBTI compatibility data\n');

    let totalCreated = 0;
    let skippedCount = 0;

    // Create compatibility records for each MBTI type
    for (const mbtiData of mbtiMajorMapping) {
      console.log(`📝 Processing ${mbtiData.mbtiType} (${mbtiData.name})...`);
      
      for (const majorData of mbtiData.majors) {
        const majorId = majorMap[majorData.code];
        
        if (!majorId) {
          console.log(`   ⚠️  Major ${majorData.code} not found, skipping...`);
          skippedCount++;
          continue;
        }

        await MBTICompatibility.create({
          majorId: majorId,
          mbtiType: mbtiData.mbtiType,
          compatibilityScore: majorData.score,
          description: majorData.description,
          strengths: [`Phù hợp với ${mbtiData.name}`, 'Khả năng phát triển tốt'],
          challenges: ['Cần rèn luyện kỹ năng bổ trợ', 'Đòi hỏi sự kiên trì'],
          careerExamples: [],
          isActive: true
        });

        console.log(`   ✓ ${majorData.code}: ${majorData.score}%`);
        totalCreated++;
      }
      console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Summary:');
    console.log(`   ✅ Created: ${totalCreated} compatibility records`);
    console.log(`   ⚠️  Skipped: ${skippedCount} (major not found)`);
    console.log(`   🎯 MBTI Types: ${mbtiMajorMapping.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Verify data
    console.log('🔍 Verification:');
    for (const mbtiData of mbtiMajorMapping) {
      const count = await MBTICompatibility.countDocuments({ 
        mbtiType: mbtiData.mbtiType,
        isActive: true 
      });
      console.log(`   ${mbtiData.mbtiType}: ${count} majors`);
    }

    console.log('\n🎉 MBTI Compatibility seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding MBTI compatibility:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the seeding function
if (require.main === module) {
  seedMBTICompatibilityComplete()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export default seedMBTICompatibilityComplete;
