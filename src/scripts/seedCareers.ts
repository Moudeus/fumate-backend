import mongoose from 'mongoose';
import Career from '../modules/careers/career.model';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const sampleCareers = [
  {
    name: "Lập trình viên phần mềm",
    code: "SW_DEV",
    description: "Thiết kế, phát triển và bảo trì các ứng dụng phần mềm. Làm việc với nhiều ngôn ngữ lập trình và công nghệ khác nhau để tạo ra các giải pháp công nghệ.",
    requiredSkills: [
      "Ngôn ngữ lập trình (Java, Python, JavaScript, C++)",
      "Cơ sở dữ liệu (SQL, NoSQL)",
      "Framework và thư viện",
      "Git và version control",
      "Tư duy logic và giải quyết vấn đề",
      "Làm việc nhóm",
      "Tiếng Anh chuyên ngành"
    ],
    salaryRange: { min: 8000000, max: 50000000 },
    jobProspects: "Nhu cầu cao và tăng trưởng mạnh. Cơ hội làm việc tại các công ty công nghệ, startup, và doanh nghiệp lớn. Có thể làm việc remote hoặc freelance.",
    workEnvironment: "Văn phòng hiện đại, môi trường năng động, có thể làm việc từ xa. Thường làm việc theo nhóm với các developer, designer, và product manager khác.",
    careerPath: [
      "Junior Developer (0-2 năm)",
      "Mid-level Developer (2-5 năm)", 
      "Senior Developer (5-8 năm)",
      "Tech Lead/Team Lead (8+ năm)",
      "Engineering Manager/CTO"
    ],
    isActive: true
  },
  {
    name: "Bác sĩ đa khoa",
    code: "GP_DOC",
    description: "Chẩn đoán, điều trị và phòng ngừa các bệnh lý thông thường. Tư vấn sức khỏe và chăm sóc y tế tổng quát cho bệnh nhân ở mọi lứa tuổi.",
    requiredSkills: [
      "Kiến thức y học sâu rộng",
      "Kỹ năng chẩn đoán và điều trị",
      "Giao tiếp với bệnh nhân",
      "Kỹ năng làm việc dưới áp lực",
      "Đồng cảm và kiên nhẫn",
      "Cập nhật kiến thức y học mới",
      "Kỹ năng sơ cứu cấp cứu"
    ],
    salaryRange: { min: 15000000, max: 80000000 },
    jobProspects: "Nhu cầu ổn định và cao, đặc biệt tại các vùng nông thôn. Cơ hội làm việc tại bệnh viện, phòng khám tư, hoặc mở phòng khám riêng.",
    workEnvironment: "Bệnh viện, phòng khám, trung tâm y tế. Môi trường đòi hỏi tính chuyên nghiệp cao, có thể phải làm việc ca đêm và cuối tuần.",
    careerPath: [
      "Bác sĩ nội trú (1-2 năm)",
      "Bác sĩ đa khoa (2-5 năm)",
      "Bác sĩ chuyên khoa (5-10 năm)",
      "Trưởng khoa/Phó giám đốc chuyên môn",
      "Giám đốc bệnh viện/Chuyên gia đầu ngành"
    ],
    isActive: true
  },
  {
    name: "Kế toán viên",
    code: "ACCOUNTANT",
    description: "Ghi chép, theo dõi và báo cáo các giao dịch tài chính của doanh nghiệp. Đảm bảo tuân thủ các quy định về kế toán và thuế.",
    requiredSkills: [
      "Kiến thức kế toán và thuế",
      "Phần mềm kế toán (MISA, SAP, Excel)",
      "Tính cẩn thận và chính xác",
      "Kỹ năng phân tích số liệu",
      "Hiểu biết pháp luật doanh nghiệp",
      "Kỹ năng giao tiếp",
      "Quản lý thời gian"
    ],
    salaryRange: { min: 6000000, max: 25000000 },
    jobProspects: "Nhu cầu ổn định tại mọi doanh nghiệp. Cơ hội thăng tiến rõ ràng và có thể chuyển sang nhiều lĩnh vực khác nhau.",
    workEnvironment: "Văn phòng, môi trường làm việc ổn định. Thường làm việc giờ hành chính, có thể tăng ca vào cuối tháng/quý/năm.",
    careerPath: [
      "Kế toán viên (0-2 năm)",
      "Kế toán trưởng (2-5 năm)",
      "Trưởng phòng Tài chính (5-8 năm)",
      "Giám đốc Tài chính (CFO)",
      "Tư vấn tài chính độc lập"
    ],
    isActive: true
  },
  {
    name: "Giáo viên THPT",
    code: "HS_TEACHER",
    description: "Giảng dạy các môn học tại trường trung học phổ thông. Hướng dẫn, giáo dục và phát triển học sinh về mặt kiến thức và kỹ năng sống.",
    requiredSkills: [
      "Kiến thức chuyên môn sâu",
      "Kỹ năng sư phạm",
      "Giao tiếp và thuyết trình",
      "Quản lý lớp học",
      "Kiên nhẫn và tình yêu trẻ em",
      "Sáng tạo trong giảng dạy",
      "Công nghệ giáo dục"
    ],
    salaryRange: { min: 5000000, max: 20000000 },
    jobProspects: "Nhu cầu ổn định, đặc biệt các môn Toán, Lý, Hóa, Anh văn. Cơ hội dạy thêm và phát triển nghề nghiệp trong ngành giáo dục.",
    workEnvironment: "Trường học, lớp học. Môi trường giáo dục, làm việc với học sinh và đồng nghiệp. Có thời gian nghỉ hè dài.",
    careerPath: [
      "Giáo viên mới (0-2 năm)",
      "Giáo viên chính thức (2-5 năm)",
      "Tổ trưởng chuyên môn (5-10 năm)",
      "Phó hiệu trưởng/Hiệu trưởng",
      "Chuyên gia giáo dục/Tác giả sách giáo khoa"
    ],
    isActive: true
  },
  {
    name: "Marketing Manager",
    code: "MKT_MGR",
    description: "Phát triển và thực hiện các chiến lược marketing để quảng bá sản phẩm/dịch vụ. Quản lý team marketing và ngân sách marketing.",
    requiredSkills: [
      "Kiến thức marketing và branding",
      "Digital marketing (SEO, SEM, Social Media)",
      "Phân tích dữ liệu và insights",
      "Kỹ năng lãnh đạo và quản lý",
      "Sáng tạo và tư duy chiến lược",
      "Giao tiếp và thuyết trình",
      "Tiếng Anh và các công cụ marketing"
    ],
    salaryRange: { min: 12000000, max: 40000000 },
    jobProspects: "Nhu cầu cao trong thời đại số hóa. Cơ hội làm việc tại nhiều ngành nghề khác nhau, từ FMCG đến công nghệ.",
    workEnvironment: "Văn phòng hiện đại, môi trường năng động và sáng tạo. Thường xuyên tương tác với các bộ phận khác và đối tác bên ngoài.",
    careerPath: [
      "Marketing Executive (0-2 năm)",
      "Marketing Specialist (2-4 năm)",
      "Marketing Manager (4-7 năm)",
      "Marketing Director (7+ năm)",
      "Chief Marketing Officer (CMO)"
    ],
    isActive: true
  },
  {
    name: "Kỹ sư xây dựng",
    code: "CIVIL_ENG",
    description: "Thiết kế, thi công và giám sát các công trình xây dựng. Đảm bảo chất lượng, an toàn và tiến độ của dự án xây dựng.",
    requiredSkills: [
      "Kiến thức kỹ thuật xây dựng",
      "Phần mềm thiết kế (AutoCAD, Revit)",
      "Quản lý dự án",
      "Đọc hiểu bản vẽ kỹ thuật",
      "Kiến thức về vật liệu xây dựng",
      "Kỹ năng giải quyết vấn đề",
      "Làm việc nhóm và giao tiếp"
    ],
    salaryRange: { min: 8000000, max: 35000000 },
    jobProspects: "Nhu cầu cao do sự phát triển của ngành bất động sản và hạ tầng. Cơ hội làm việc tại các công ty xây dựng, tư vấn thiết kế.",
    workEnvironment: "Văn phòng và công trường. Môi trường đòi hỏi tính chính xác cao, có thể phải di chuyển giữa các dự án khác nhau.",
    careerPath: [
      "Kỹ sư tập sự (0-1 năm)",
      "Kỹ sư thiết kế/Giám sát (1-5 năm)",
      "Kỹ sư trưởng (5-10 năm)",
      "Giám đốc kỹ thuật",
      "Chủ tư vấn/Nhà thầu độc lập"
    ],
    isActive: true
  },
  {
    name: "Nhà thiết kế đồ họa",
    code: "GFX_DESIGNER",
    description: "Tạo ra các thiết kế trực quan cho in ấn, web, và media. Phát triển concept và thực hiện các ý tưởng sáng tạo thành sản phẩm thiết kế.",
    requiredSkills: [
      "Phần mềm thiết kế (Photoshop, Illustrator, InDesign)",
      "Cảm thẩm mỹ và sáng tạo",
      "Hiểu biết về màu sắc và typography",
      "Kỹ năng vẽ tay và digital",
      "Tư duy concept và storytelling",
      "Giao tiếp với khách hàng",
      "Quản lý thời gian và deadline"
    ],
    salaryRange: { min: 6000000, max: 25000000 },
    jobProspects: "Nhu cầu tăng cao trong thời đại digital. Cơ hội làm việc tại agency, in-house, hoặc freelance.",
    workEnvironment: "Studio thiết kế, agency, hoặc làm việc từ xa. Môi trường sáng tạo, thường làm việc với deadline chặt.",
    careerPath: [
      "Junior Designer (0-2 năm)",
      "Graphic Designer (2-5 năm)",
      "Senior Designer (5-8 năm)",
      "Art Director (8+ năm)",
      "Creative Director/Freelancer"
    ],
    isActive: true
  },
  {
    name: "Nhà phân tích dữ liệu",
    code: "DATA_ANALYST",
    description: "Thu thập, xử lý và phân tích dữ liệu để đưa ra insights và hỗ trợ ra quyết định kinh doanh. Tạo báo cáo và dashboard trực quan.",
    requiredSkills: [
      "SQL và cơ sở dữ liệu",
      "Python/R cho phân tích dữ liệu",
      "Excel nâng cao và Power BI/Tableau",
      "Thống kê và toán học",
      "Tư duy logic và phân tích",
      "Kỹ năng trình bày và báo cáo",
      "Hiểu biết về business"
    ],
    salaryRange: { min: 10000000, max: 35000000 },
    jobProspects: "Nhu cầu rất cao trong thời đại big data. Cơ hội làm việc tại mọi ngành nghề từ tài chính, retail đến công nghệ.",
    workEnvironment: "Văn phòng hiện đại với các công cụ phân tích tiên tiến. Thường làm việc với các team khác để hiểu yêu cầu business.",
    careerPath: [
      "Junior Data Analyst (0-2 năm)",
      "Data Analyst (2-5 năm)",
      "Senior Data Analyst (5-8 năm)",
      "Data Science Manager",
      "Chief Data Officer (CDO)"
    ],
    isActive: true
  },
  {
    name: "Luật sư",
    code: "LAWYER",
    description: "Tư vấn pháp lý, đại diện khách hàng trong các vụ việc pháp lý. Soạn thảo hợp đồng và các văn bản pháp lý.",
    requiredSkills: [
      "Kiến thức pháp luật sâu rộng",
      "Kỹ năng nghiên cứu và phân tích",
      "Viết và soạn thảo văn bản",
      "Giao tiếp và thuyết phục",
      "Tư duy logic và phản biện",
      "Kỹ năng đàm phán",
      "Đạo đức nghề nghiệp"
    ],
    salaryRange: { min: 10000000, max: 60000000 },
    jobProspects: "Nhu cầu ổn định, đặc biệt trong các lĩnh vực doanh nghiệp, bất động sản, và tranh tụng. Có thể mở văn phòng luật riêng.",
    workEnvironment: "Văn phòng luật, tòa án, hoặc in-house tại doanh nghiệp. Môi trường đòi hỏi tính chính xác và chuyên nghiệp cao.",
    careerPath: [
      "Luật sư tập sự (0-2 năm)",
      "Luật sư (2-5 năm)",
      "Luật sư senior (5-10 năm)",
      "Partner/Giám đốc văn phòng luật",
      "Thẩm phán/Chuyên gia pháp lý"
    ],
    isActive: true
  },
  {
    name: "Nhà báo",
    code: "JOURNALIST",
    description: "Thu thập, xử lý và truyền tải thông tin đến công chúng qua các phương tiện truyền thông. Viết bài, phỏng vấn và sản xuất nội dung.",
    requiredSkills: [
      "Kỹ năng viết và biên tập",
      "Nghiên cứu và thu thập thông tin",
      "Phỏng vấn và giao tiếp",
      "Hiểu biết xã hội và thời sự",
      "Công nghệ và social media",
      "Tư duy phản biện",
      "Đạo đức nghề nghiệp"
    ],
    salaryRange: { min: 5000000, max: 30000000 },
    jobProspects: "Ngành đang chuyển đổi mạnh sang digital. Cơ hội tại báo chí truyền thống, online, và content creator.",
    workEnvironment: "Tòa soạn, hiện trường sự kiện, hoặc làm việc từ xa. Môi trường năng động, thường xuyên deadline gấp.",
    careerPath: [
      "Phóng viên thực tập (0-1 năm)",
      "Phóng viên (1-5 năm)",
      "Phóng viên senior/Biên tập viên (5-8 năm)",
      "Trưởng ban/Tổng biên tập",
      "Chuyên gia truyền thông/Freelancer"
    ],
    isActive: true
  }
];

async function seedCareers() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing careers
    await Career.deleteMany({});
    console.log('Cleared existing careers');

    // Insert sample careers
    const careers = await Career.insertMany(sampleCareers);
    console.log(`Inserted ${careers.length} careers successfully`);

    // Display inserted careers
    careers.forEach((career, index) => {
      console.log(`${index + 1}. ${career.name} (${career.code}) - ${career.salaryRange.min.toLocaleString()}-${career.salaryRange.max.toLocaleString()} VNĐ`);
    });

    console.log('\n✅ Careers seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding careers:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
if (require.main === module) {
  seedCareers();
}

export default seedCareers;