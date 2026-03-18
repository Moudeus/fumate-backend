import mongoose from 'mongoose';
import { Major, MBTICompatibility } from '../modules/majors/major.model';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const sampleMajors = [
  {
    code: "CS",
    name: "Khoa học máy tính",
    description: "Ngành học tập trung vào lý thuyết tính toán, thiết kế hệ thống máy tính, và phát triển phần mềm. Sinh viên sẽ học về thuật toán, cấu trúc dữ liệu, lập trình, cơ sở dữ liệu, mạng máy tính, trí tuệ nhân tạo và nhiều lĩnh vực khác của công nghệ thông tin.",
    duration: 4,
    degreeLevel: "Bachelor",
    careerPaths: [
      "Lập trình viên phần mềm",
      "Kỹ sư phần mềm",
      "Nhà phát triển web",
      "Chuyên gia bảo mật thông tin",
      "Nhà khoa học dữ liệu",
      "Kỹ sư AI/Machine Learning",
      "Kiến trúc sư hệ thống",
      "Product Manager công nghệ"
    ],
    requiredSkills: [
      "Tư duy logic và giải quyết vấn đề",
      "Kỹ năng lập trình",
      "Toán học và thống kê",
      "Tiếng Anh chuyên ngành",
      "Làm việc nhóm",
      "Học hỏi liên tục",
      "Tư duy hệ thống"
    ],
    salaryRange: { min: 8000000, max: 50000000 },
    isActive: true
  },
  {
    code: "MED",
    name: "Y khoa",
    description: "Ngành đào tạo bác sĩ với kiến thức toàn diện về cơ thể con người, bệnh lý, chẩn đoán và điều trị. Chương trình học kết hợp lý thuyết và thực hành lâm sàng, chuẩn bị sinh viên trở thành những bác sĩ có năng lực chăm sóc sức khỏe cộng đồng.",
    duration: 6,
    degreeLevel: "Bachelor",
    careerPaths: [
      "Bác sĩ đa khoa",
      "Bác sĩ chuyên khoa",
      "Bác sĩ gia đình",
      "Bác sĩ cấp cứu",
      "Nghiên cứu y học",
      "Giảng viên y khoa",
      "Tư vấn y tế",
      "Quản lý bệnh viện"
    ],
    requiredSkills: [
      "Kiến thức khoa học tự nhiên vững chắc",
      "Kỹ năng giao tiếp với bệnh nhân",
      "Khả năng làm việc dưới áp lực",
      "Tính cẩn thận và chính xác",
      "Đồng cảm và kiên nhẫn",
      "Kỹ năng ra quyết định nhanh",
      "Học tập suốt đời"
    ],
    salaryRange: { min: 15000000, max: 80000000 },
    isActive: true
  },
  {
    code: "BUS",
    name: "Quản trị kinh doanh",
    description: "Ngành học cung cấp kiến thức toàn diện về quản lý doanh nghiệp, bao gồm marketing, tài chính, nhân sự, vận hành và chiến lược. Sinh viên sẽ phát triển kỹ năng lãnh đạo, phân tích kinh doanh và ra quyết định trong môi trường kinh doanh đa dạng.",
    duration: 4,
    degreeLevel: "Bachelor",
    careerPaths: [
      "Quản lý dự án",
      "Chuyên viên marketing",
      "Nhà phân tích kinh doanh",
      "Tư vấn quản lý",
      "Giám đốc điều hành",
      "Chuyên viên nhân sự",
      "Chuyên viên tài chính",
      "Khởi nghiệp kinh doanh"
    ],
    requiredSkills: [
      "Kỹ năng lãnh đạo và quản lý",
      "Tư duy chiến lược",
      "Giao tiếp và thuyết trình",
      "Phân tích dữ liệu",
      "Đàm phán và bán hàng",
      "Làm việc nhóm",
      "Tiếng Anh thương mại"
    ],
    salaryRange: { min: 7000000, max: 40000000 },
    isActive: true
  },
  {
    code: "ENG",
    name: "Ngôn ngữ Anh",
    description: "Ngành học phát triển khả năng sử dụng tiếng Anh thành thạo trong giao tiếp, dịch thuật, giảng dạy và nghiên cứu. Chương trình bao gồm văn học Anh-Mỹ, ngôn ngữ học, phương pháp giảng dạy và kỹ năng giao tiếp đa văn hóa.",
    duration: 4,
    degreeLevel: "Bachelor",
    careerPaths: [
      "Giáo viên tiếng Anh",
      "Phiên dịch viên",
      "Biên dịch viên",
      "Hướng dẫn viên du lịch",
      "Chuyên viên quan hệ quốc tế",
      "Nhân viên xuất nhập khẩu",
      "Content writer",
      "Chuyên viên truyền thông"
    ],
    requiredSkills: [
      "Thành thạo 4 kỹ năng tiếng Anh",
      "Hiểu biết văn hóa quốc tế",
      "Kỹ năng giao tiếp đa văn hóa",
      "Tư duy phản biện",
      "Kỹ năng viết và biên tập",
      "Kiên nhẫn và tình yêu giảng dạy",
      "Khả năng thích ứng"
    ],
    salaryRange: { min: 6000000, max: 25000000 },
    isActive: true
  },
  {
    code: "PSYC",
    name: "Tâm lý học",
    description: "Ngành nghiên cứu về tâm lý, hành vi con người và các quá trình tinh thần. Sinh viên sẽ học về tâm lý phát triển, tâm lý xã hội, tâm lý lâm sàng, và các phương pháp nghiên cứu tâm lý để hiểu và hỗ trợ con người trong cuộc sống.",
    duration: 4,
    degreeLevel: "Bachelor",
    careerPaths: [
      "Nhà tâm lý học lâm sàng",
      "Tư vấn tâm lý",
      "Nhà tâm lý học giáo dục",
      "Chuyên viên nhân sự",
      "Nghiên cứu viên tâm lý",
      "Chuyên viên trị liệu",
      "Tâm lý học tổ chức",
      "Giảng viên tâm lý học"
    ],
    requiredSkills: [
      "Khả năng lắng nghe và đồng cảm",
      "Kỹ năng giao tiếp hiệu quả",
      "Tư duy phân tích và quan sát",
      "Kiên nhẫn và bình tĩnh",
      "Hiểu biết về con người",
      "Kỹ năng nghiên cứu",
      "Đạo đức nghề nghiệp"
    ],
    salaryRange: { min: 8000000, max: 30000000 },
    isActive: true
  },
  {
    code: "CIVIL",
    name: "Kỹ thuật xây dựng",
    description: "Ngành đào tạo kỹ sư có khả năng thiết kế, thi công và quản lý các công trình xây dựng. Chương trình học bao gồm cơ học kết cấu, vật liệu xây dựng, thiết kế công trình, quản lý dự án và công nghệ xây dựng hiện đại.",
    duration: 4,
    degreeLevel: "Bachelor",
    careerPaths: [
      "Kỹ sư thiết kế",
      "Kỹ sư thi công",
      "Giám sát kỹ thuật",
      "Quản lý dự án xây dựng",
      "Tư vấn thiết kế",
      "Kiểm định chất lượng",
      "Nghiên cứu vật liệu",
      "Chuyên gia BIM"
    ],
    requiredSkills: [
      "Kiến thức toán học và vật lý vững chắc",
      "Kỹ năng sử dụng phần mềm thiết kế",
      "Tư duy không gian",
      "Quản lý dự án",
      "Làm việc nhóm",
      "Tính cẩn thận và chính xác",
      "Khả năng giải quyết vấn đề"
    ],
    salaryRange: { min: 8000000, max: 35000000 },
    isActive: true
  },
  {
    code: "ACC",
    name: "Kế toán",
    description: "Ngành học cung cấp kiến thức về ghi chép, phân tích và báo cáo thông tin tài chính. Sinh viên sẽ học về kế toán tài chính, kế toán quản trị, kiểm toán, thuế và các hệ thống thông tin kế toán để hỗ trợ ra quyết định kinh doanh.",
    duration: 4,
    degreeLevel: "Bachelor",
    careerPaths: [
      "Kế toán viên",
      "Kiểm toán viên",
      "Chuyên viên thuế",
      "Phân tích tài chính",
      "Kế toán trưởng",
      "Tư vấn tài chính",
      "Giám đốc tài chính",
      "Giảng viên kế toán"
    ],
    requiredSkills: [
      "Tính cẩn thận và chính xác cao",
      "Kỹ năng phân tích số liệu",
      "Hiểu biết pháp luật thuế",
      "Sử dụng phần mềm kế toán",
      "Tư duy logic",
      "Kỹ năng giao tiếp",
      "Đạo đức nghề nghiệp"
    ],
    salaryRange: { min: 6000000, max: 30000000 },
    isActive: true
  },
  {
    code: "ART",
    name: "Mỹ thuật",
    description: "Ngành đào tạo nghệ sĩ và nhà thiết kế có khả năng sáng tạo trong các lĩnh vực hội họa, điêu khắc, thiết kế đồ họa, và nghệ thuật số. Chương trình phát triển kỹ năng nghệ thuật, cảm thẩm mỹ và tư duy sáng tạo.",
    duration: 4,
    degreeLevel: "Bachelor",
    careerPaths: [
      "Họa sĩ",
      "Nhà thiết kế đồ họa",
      "Nhà thiết kế web",
      "Nghệ sĩ minh họa",
      "Giám đốc nghệ thuật",
      "Giáo viên mỹ thuật",
      "Curator triển lãm",
      "Freelance artist"
    ],
    requiredSkills: [
      "Kỹ năng vẽ và tạo hình",
      "Cảm thẩm mỹ và sáng tạo",
      "Sử dụng phần mềm thiết kế",
      "Hiểu biết về màu sắc và composition",
      "Tư duy concept",
      "Kiên nhẫn và tỉ mỉ",
      "Khả năng thể hiện ý tưởng"
    ],
    salaryRange: { min: 5000000, max: 30000000 },
    isActive: true
  },
  {
    code: "LAW",
    name: "Luật",
    description: "Ngành đào tạo luật sư và chuyên gia pháp lý có kiến thức sâu rộng về hệ thống pháp luật. Sinh viên sẽ học về các ngành luật khác nhau, kỹ năng tranh tụng, soạn thảo văn bản pháp lý và tư vấn pháp luật.",
    duration: 4,
    degreeLevel: "Bachelor",
    careerPaths: [
      "Luật sư",
      "Tư vấn pháp lý",
      "Thẩm phán",
      "Kiểm sát viên",
      "Chuyên viên pháp chế",
      "Công chứng viên",
      "Trọng tài viên",
      "Giảng viên luật"
    ],
    requiredSkills: [
      "Tư duy logic và phân tích",
      "Kỹ năng nghiên cứu pháp luật",
      "Giao tiếp và thuyết phục",
      "Viết và soạn thảo văn bản",
      "Đàm phán và tranh luận",
      "Đạo đức nghề nghiệp",
      "Khả năng làm việc dưới áp lực"
    ],
    salaryRange: { min: 8000000, max: 50000000 },
    isActive: true
  },
  {
    code: "JOUR",
    name: "Báo chí",
    description: "Ngành đào tạo nhà báo và chuyên gia truyền thông có khả năng thu thập, xử lý và truyền tải thông tin. Chương trình bao gồm kỹ năng viết báo, phỏng vấn, sản xuất nội dung đa phương tiện và hiểu biết về đạo đức báo chí.",
    duration: 4,
    degreeLevel: "Bachelor",
    careerPaths: [
      "Phóng viên",
      "Biên tập viên",
      "Nhà sản xuất nội dung",
      "MC/BTV",
      "Chuyên viên truyền thông",
      "Content creator",
      "Blogger/Vlogger",
      "Chuyên gia PR"
    ],
    requiredSkills: [
      "Kỹ năng viết và biên tập",
      "Giao tiếp và phỏng vấn",
      "Tư duy phản biện",
      "Hiểu biết xã hội rộng",
      "Sử dụng công nghệ truyền thông",
      "Làm việc dưới deadline",
      "Đạo đức nghề nghiệp"
    ],
    salaryRange: { min: 5000000, max: 25000000 },
    isActive: true
  }
];

// MBTI Compatibility data
const mbtiCompatibilityData = [
  // Computer Science compatibilities
  { majorCode: "CS", mbtiType: "INTJ", score: 95, description: "Kiến trúc sư có tư duy hệ thống và khả năng giải quyết vấn đề phức tạp, rất phù hợp với lập trình và thiết kế hệ thống." },
  { majorCode: "CS", mbtiType: "INTP", score: 92, description: "Nhà tư duy logic với khả năng phân tích sâu, thích khám phá công nghệ mới và giải quyết thử thách kỹ thuật." },
  { majorCode: "CS", mbtiType: "ENTJ", score: 88, description: "Nhà lãnh đạo có tầm nhìn công nghệ, phù hợp với vai trò quản lý dự án và phát triển sản phẩm công nghệ." },
  { majorCode: "CS", mbtiType: "ENTP", score: 85, description: "Người đổi mới sáng tạo, thích thử nghiệm công nghệ mới và phát triển giải pháp độc đáo." },
  
  // Medicine compatibilities  
  { majorCode: "MED", mbtiType: "ISFJ", score: 90, description: "Người bảo vệ có lòng trắc ẩn và khả năng chăm sóc, rất phù hợp với nghề bác sĩ và chăm sóc bệnh nhân." },
  { majorCode: "MED", mbtiType: "INFJ", score: 88, description: "Người ủng hộ có trực giác mạnh về con người và mong muốn giúp đỡ, phù hợp với y học và tư vấn sức khỏe." },
  { majorCode: "MED", mbtiType: "ENFJ", score: 85, description: "Người giáo viên có khả năng giao tiếp tốt và quan tâm đến sức khỏe cộng đồng." },
  { majorCode: "MED", mbtiType: "ISTJ", score: 82, description: "Người hậu cần có tính cẩn thận và tuân thủ quy trình, phù hợp với chẩn đoán và điều trị chính xác." },

  // Business Administration compatibilities
  { majorCode: "BUS", mbtiType: "ENTJ", score: 95, description: "Nhà lãnh đạo tự nhiên với tầm nhìn chiến lược và khả năng quản lý, rất phù hợp với quản trị kinh doanh." },
  { majorCode: "BUS", mbtiType: "ESTJ", score: 90, description: "Người điều hành có khả năng tổ chức và quản lý hiệu quả, phù hợp với vai trò quản lý doanh nghiệp." },
  { majorCode: "BUS", mbtiType: "ENFJ", score: 85, description: "Người giáo viên có khả năng lãnh đạo và phát triển nhân tài trong tổ chức." },
  { majorCode: "BUS", mbtiType: "ENTP", score: 82, description: "Người đổi mới có tư duy kinh doanh sáng tạo và khả năng phát triển cơ hội mới." },

  // English Language compatibilities
  { majorCode: "ENG", mbtiType: "ENFP", score: 92, description: "Người truyền cảm hứng có khả năng giao tiếp xuất sắc và yêu thích ngôn ngữ, văn hóa." },
  { majorCode: "ENG", mbtiType: "INFP", score: 88, description: "Người hòa giải có tình yêu với ngôn ngữ và khả năng thể hiện cảm xúc qua từ ngữ." },
  { majorCode: "ENG", mbtiType: "ENFJ", score: 85, description: "Người giáo viên có khả năng truyền đạt kiến thức và kết nối với học sinh." },
  { majorCode: "ENG", mbtiType: "ESFJ", score: 80, description: "Người quan tâm có khả năng giao tiếp tốt và thích giúp đỡ người khác học tập." },

  // Psychology compatibilities
  { majorCode: "PSYC", mbtiType: "INFJ", score: 95, description: "Người ủng hộ có trực giác sâu sắc về con người và mong muốn giúp đỡ, rất phù hợp với tâm lý học." },
  { majorCode: "PSYC", mbtiType: "ENFJ", score: 90, description: "Người giáo viên có khả năng hiểu và hỗ trợ phát triển con người." },
  { majorCode: "PSYC", mbtiType: "INFP", score: 88, description: "Người hòa giải có lòng đồng cảm sâu sắc và mong muốn hiểu về tâm lý con người." },
  { majorCode: "PSYC", mbtiType: "ISFJ", score: 85, description: "Người bảo vệ có khả năng lắng nghe và hỗ trợ người khác vượt qua khó khăn." },

  // Civil Engineering compatibilities
  { majorCode: "CIVIL", mbtiType: "ISTJ", score: 90, description: "Người hậu cần có tính cẩn thận và khả năng làm việc với chi tiết kỹ thuật phức tạp." },
  { majorCode: "CIVIL", mbtiType: "ESTJ", score: 88, description: "Người điều hành có khả năng quản lý dự án và đảm bảo tiến độ thi công." },
  { majorCode: "CIVIL", mbtiType: "INTJ", score: 85, description: "Kiến trúc sư có tầm nhìn dài hạn và khả năng thiết kế hệ thống kỹ thuật." },
  { majorCode: "CIVIL", mbtiType: "ISTP", score: 82, description: "Người thợ máy có khả năng thực hành và giải quyết vấn đề kỹ thuật." },

  // Accounting compatibilities
  { majorCode: "ACC", mbtiType: "ISTJ", score: 95, description: "Người hậu cần có tính cẩn thận cao và khả năng làm việc với số liệu chính xác." },
  { majorCode: "ACC", mbtiType: "ISFJ", score: 88, description: "Người bảo vệ có tính trách nhiệm và khả năng duy trì hệ thống tài chính." },
  { majorCode: "ACC", mbtiType: "ESTJ", score: 85, description: "Người điều hành có khả năng quản lý tài chính và tuân thủ quy định." },
  { majorCode: "ACC", mbtiType: "INTJ", score: 80, description: "Kiến trúc sư có khả năng phân tích tài chính và lập kế hoạch chiến lược." },

  // Art compatibilities
  { majorCode: "ART", mbtiType: "ISFP", score: 95, description: "Người phiêu lưu có cảm thẩm mỹ cao và khả năng thể hiện cảm xúc qua nghệ thuật." },
  { majorCode: "ART", mbtiType: "INFP", score: 92, description: "Người hòa giải có tâm hồn nghệ sĩ và khả năng sáng tạo độc đáo." },
  { majorCode: "ART", mbtiType: "ENFP", score: 88, description: "Người truyền cảm hứng có óc sáng tạo và khả năng thể hiện ý tưởng qua nghệ thuật." },
  { majorCode: "ART", mbtiType: "ESFP", score: 85, description: "Người biểu diễn có khả năng thể hiện và kết nối với khán giả qua tác phẩm." },

  // Law compatibilities
  { majorCode: "LAW", mbtiType: "ENTJ", score: 90, description: "Nhà lãnh đạo có khả năng tranh luận mạnh mẽ và tư duy chiến lược trong pháp lý." },
  { majorCode: "LAW", mbtiType: "INTJ", score: 88, description: "Kiến trúc sư có khả năng phân tích sâu và xây dựng lập luận logic." },
  { majorCode: "LAW", mbtiType: "ENTP", score: 85, description: "Người đổi mới có khả năng tranh luận sáng tạo và tìm ra góc nhìn mới." },
  { majorCode: "LAW", mbtiType: "ESTJ", score: 82, description: "Người điều hành có khả năng tuân thủ quy trình pháp lý và quản lý hồ sơ." },

  // Journalism compatibilities
  { majorCode: "JOUR", mbtiType: "ENFP", score: 92, description: "Người truyền cảm hứng có khả năng giao tiếp xuất sắc và tò mò về thế giới xung quanh." },
  { majorCode: "JOUR", mbtiType: "ENTP", score: 88, description: "Người đổi mới có khả năng đặt câu hỏi sâu sắc và khám phá góc nhìn mới." },
  { majorCode: "JOUR", mbtiType: "ESFJ", score: 85, description: "Người quan tâm có khả năng kết nối với cộng đồng và truyền tải thông tin." },
  { majorCode: "JOUR", mbtiType: "ENFJ", score: 82, description: "Người giáo viên có khả năng truyền đạt thông tin và ảnh hưởng tích cực." }
];

async function seedMajors() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Major.deleteMany({});
    await MBTICompatibility.deleteMany({});
    console.log('Cleared existing majors and MBTI compatibility data');

    // Insert majors
    const majors = await Major.insertMany(sampleMajors);
    console.log(`Inserted ${majors.length} majors successfully`);

    // Create MBTI compatibility data
    const compatibilityRecords = [];
    for (const compat of mbtiCompatibilityData) {
      const major = majors.find(m => m.code === compat.majorCode);
      if (major) {
        compatibilityRecords.push({
          majorId: major._id,
          mbtiType: compat.mbtiType,
          compatibilityScore: compat.score,
          description: compat.description,
          strengths: [`Phù hợp với tính cách ${compat.mbtiType}`, "Có tiềm năng phát triển tốt trong ngành"],
          challenges: ["Cần phát triển kỹ năng bổ trợ", "Đòi hỏi sự kiên trì và học hỏi liên tục"],
          careerExamples: major.careerPaths.slice(0, 3),
          isActive: true
        });
      }
    }

    const compatibilities = await MBTICompatibility.insertMany(compatibilityRecords);
    console.log(`Inserted ${compatibilities.length} MBTI compatibility records successfully`);

    // Display results
    console.log('\n📚 Majors inserted:');
    majors.forEach((major, index) => {
      console.log(`${index + 1}. ${major.name} (${major.code}) - ${major.duration} năm`);
    });

    console.log('\n🧠 MBTI Compatibility records by major:');
    const majorGroups = compatibilities.reduce((acc, comp) => {
      const major = majors.find(m => m._id.equals(comp.majorId));
      if (major) {
        if (!acc[major.code]) acc[major.code] = [];
        acc[major.code].push(comp.mbtiType);
      }
      return acc;
    }, {} as Record<string, string[]>);

    Object.entries(majorGroups).forEach(([code, types]) => {
      console.log(`${code}: ${types.join(', ')}`);
    });

    console.log('\n✅ Majors and MBTI compatibility seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding majors:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
if (require.main === module) {
  seedMajors();
}

export default seedMajors;