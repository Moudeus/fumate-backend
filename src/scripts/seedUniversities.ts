import mongoose from 'mongoose';
import { University, AdmissionScore } from '../modules/universities/university.model';
import { Major } from '../modules/majors/major.model';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const sampleUniversities = [
  {
    name: "Đại học Quốc gia Hà Nội",
    code: "VNU_HN",
    logo: "https://images.unsplash.com/photo-1562774053-701939374585?w=200&h=200&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=400&fit=crop",
    website: "https://vnu.edu.vn",
    email: "info@vnu.edu.vn",
    phone: "024-37547506",
    address: "144 Xuân Thủy, Cầu Giấy, Hà Nội",
    description: "Đại học Quốc gia Hà Nội là một trong những trường đại học hàng đầu Việt Nam, được thành lập năm 1906. Trường có truyền thống lâu đời trong đào tạo và nghiên cứu khoa học, với nhiều ngành học mạnh và đội ngũ giảng viên chất lượng cao.",
    strengths: [
      "Chất lượng đào tạo cao",
      "Đội ngũ giảng viên giỏi",
      "Cơ sở vật chất hiện đại",
      "Nhiều chương trình quốc tế",
      "Nghiên cứu khoa học mạnh"
    ],
    admissionMethods: [
      "Xét tuyển kết quả thi THPT",
      "Xét tuyển học bạ",
      "Thi riêng",
      "Xét tuyển kết hợp"
    ],
    tuitionRange: { min: 12000000, max: 25000000 },
    scholarshipInfo: "Học bổng khuyến khích học tập, học bổng cho sinh viên có hoàn cảnh khó khăn, học bổng doanh nghiệp",
    location: { city: "Hà Nội", region: "Miền Bắc" },
    isActive: true
  },
  {
    name: "Đại học Bách khoa Hà Nội",
    code: "HUST",
    logo: "https://images.unsplash.com/photo-1562774053-701939374585?w=200&h=200&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800&h=400&fit=crop",
    website: "https://hust.edu.vn",
    email: "info@hust.edu.vn", 
    phone: "024-38680787",
    address: "1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội",
    description: "Đại học Bách khoa Hà Nội là trường đại học kỹ thuật hàng đầu Việt Nam, chuyên đào tạo các ngành kỹ thuật và công nghệ. Trường có uy tín cao trong lĩnh vực đào tạo kỹ sư và nghiên cứu khoa học kỹ thuật.",
    strengths: [
      "Mạnh về kỹ thuật và công nghệ",
      "Liên kết quốc tế tốt",
      "Cơ sở thực hành hiện đại",
      "Tỷ lệ có việc làm cao",
      "Chương trình đào tạo chất lượng"
    ],
    admissionMethods: [
      "Thi riêng",
      "Xét tuyển kết quả thi THPT",
      "Xét tuyển học bạ",
      "Tuyển thẳng"
    ],
    tuitionRange: { min: 15000000, max: 30000000 },
    scholarshipInfo: "Học bổng toàn phần cho thí sinh xuất sắc, học bổng từ các doanh nghiệp đối tác",
    location: { city: "Hà Nội", region: "Miền Bắc" },
    isActive: true
  },
  {
    name: "Đại học Kinh tế Quốc dân",
    code: "NEU",
    logo: "https://images.unsplash.com/photo-1562774053-701939374585?w=200&h=200&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop",
    website: "https://neu.edu.vn",
    email: "info@neu.edu.vn",
    phone: "024-37547506",
    address: "207 Giải Phóng, Hai Bà Trưng, Hà Nội",
    description: "Đại học Kinh tế Quốc dân là trường đại học kinh tế hàng đầu Việt Nam, chuyên đào tạo các ngành kinh tế, quản trị và tài chính. Trường có mạng lưới cựu sinh viên rộng khắp trong các doanh nghiệp và tổ chức tài chính.",
    strengths: [
      "Mạnh về kinh tế và tài chính",
      "Mạng lưới doanh nghiệp rộng",
      "Chương trình thực tập tốt",
      "Giảng viên có kinh nghiệm thực tiễn",
      "Cơ hội việc làm cao"
    ],
    admissionMethods: [
      "Xét tuyển kết quả thi THPT",
      "Xét tuyển học bạ",
      "Thi riêng",
      "Xét tuyển kết hợp"
    ],
    tuitionRange: { min: 10000000, max: 22000000 },
    scholarshipInfo: "Học bổng khuyến khích học tập, học bổng doanh nghiệp, học bổng quốc tế",
    location: { city: "Hà Nội", region: "Miền Bắc" },
    isActive: true
  },
  {
    name: "Đại học Y Hà Nội",
    code: "HMU",
    logo: "https://images.unsplash.com/photo-1562774053-701939374585?w=200&h=200&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=400&fit=crop",
    website: "https://hmu.edu.vn",
    email: "info@hmu.edu.vn",
    phone: "024-38523798",
    address: "1 Tôn Thất Tùng, Đống Đa, Hà Nội",
    description: "Đại học Y Hà Nội là trường đại học y khoa hàng đầu Việt Nam, có lịch sử hơn 115 năm đào tạo. Trường đào tạo các bác sĩ, dược sĩ và chuyên gia y tế chất lượng cao cho cả nước.",
    strengths: [
      "Truyền thống đào tạo y khoa lâu đời",
      "Đội ngũ giảng viên giỏi",
      "Bệnh viện thực hành chất lượng",
      "Chương trình đào tạo chuẩn quốc tế",
      "Tỷ lệ đậu chứng chỉ hành nghề cao"
    ],
    admissionMethods: [
      "Thi riêng",
      "Xét tuyển kết quả thi THPT",
      "Tuyển thẳng"
    ],
    tuitionRange: { min: 18000000, max: 35000000 },
    scholarshipInfo: "Học bổng cho sinh viên xuất sắc, học bổng từ các bệnh viện đối tác",
    location: { city: "Hà Nội", region: "Miền Bắc" },
    isActive: true
  },
  {
    name: "Đại học Quốc gia TP.HCM",
    code: "VNU_HCM",
    logo: "https://images.unsplash.com/photo-1562774053-701939374585?w=200&h=200&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=400&fit=crop",
    website: "https://vnuhcm.edu.vn",
    email: "info@vnuhcm.edu.vn",
    phone: "028-37244270",
    address: "Linh Trung, Thủ Đức, TP.HCM",
    description: "Đại học Quốc gia TP.HCM là trường đại học đa ngành hàng đầu miền Nam, với nhiều trường thành viên mạnh. Trường có vị trí chiến lược tại trung tâm kinh tế lớn nhất nước.",
    strengths: [
      "Vị trí địa lý thuận lợi",
      "Đa dạng ngành học",
      "Liên kết doanh nghiệp tốt",
      "Cơ sở vật chất hiện đại",
      "Môi trường học tập năng động"
    ],
    admissionMethods: [
      "Xét tuyển kết quả thi THPT",
      "Xét tuyển học bạ",
      "Thi riêng",
      "Xét tuyển kết hợp"
    ],
    tuitionRange: { min: 11000000, max: 24000000 },
    scholarshipInfo: "Học bổng khuyến khích học tập, học bổng doanh nghiệp miền Nam",
    location: { city: "TP.HCM", region: "Miền Nam" },
    isActive: true
  },
  {
    name: "Đại học Bách khoa TP.HCM",
    code: "HCMUT",
    logo: "https://images.unsplash.com/photo-1562774053-701939374585?w=200&h=200&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800&h=400&fit=crop",
    website: "https://hcmut.edu.vn",
    email: "info@hcmut.edu.vn",
    phone: "028-38647256",
    address: "268 Lý Thường Kiệt, Quận 10, TP.HCM",
    description: "Đại học Bách khoa TP.HCM là trường đại học kỹ thuật hàng đầu miền Nam, đào tạo kỹ sư chất lượng cao. Trường có mối liên hệ chặt chẽ với các doanh nghiệp công nghệ và sản xuất.",
    strengths: [
      "Mạnh về kỹ thuật công nghệ",
      "Gần các khu công nghiệp",
      "Cơ hội thực tập tốt",
      "Trang thiết bị hiện đại",
      "Tỷ lệ có việc làm cao"
    ],
    admissionMethods: [
      "Thi riêng",
      "Xét tuyển kết quả thi THPT",
      "Xét tuyển học bạ"
    ],
    tuitionRange: { min: 14000000, max: 28000000 },
    scholarshipInfo: "Học bổng từ các công ty công nghệ, học bổng nghiên cứu khoa học",
    location: { city: "TP.HCM", region: "Miền Nam" },
    isActive: true
  },
  {
    name: "Đại học Kinh tế TP.HCM",
    code: "UEH",
    logo: "https://images.unsplash.com/photo-1562774053-701939374585?w=200&h=200&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop",
    website: "https://ueh.edu.vn",
    email: "info@ueh.edu.vn",
    phone: "028-38299242",
    address: "279 Nguyễn Tri Phương, Quận 10, TP.HCM",
    description: "Đại học Kinh tế TP.HCM là trường đại học kinh tế hàng đầu miền Nam, có uy tín cao trong đào tạo các ngành kinh tế, quản trị và tài chính. Trường có mạng lưới doanh nghiệp rộng khắp.",
    strengths: [
      "Uy tín cao về kinh tế",
      "Mạng lưới cựu sinh viên mạnh",
      "Chương trình quốc tế",
      "Cơ hội việc làm tốt",
      "Giảng viên có kinh nghiệm"
    ],
    admissionMethods: [
      "Xét tuyển kết quả thi THPT",
      "Xét tuyển học bạ",
      "Thi riêng"
    ],
    tuitionRange: { min: 9000000, max: 20000000 },
    scholarshipInfo: "Học bổng doanh nghiệp, học bổng quốc tế, học bổng khuyến khích học tập",
    location: { city: "TP.HCM", region: "Miền Nam" },
    isActive: true
  },
  {
    name: "Đại học Sư phạm Hà Nội",
    code: "HNUE",
    logo: "https://images.unsplash.com/photo-1562774053-701939374585?w=200&h=200&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&h=400&fit=crop",
    website: "https://hnue.edu.vn",
    email: "info@hnue.edu.vn",
    phone: "024-37547506",
    address: "136 Xuân Thủy, Cầu Giấy, Hà Nội",
    description: "Đại học Sư phạm Hà Nội là trường đại học sư phạm hàng đầu Việt Nam, chuyên đào tạo giáo viên và cán bộ giáo dục. Trường có truyền thống lâu đời trong việc đào tạo đội ngũ giáo viên chất lượng.",
    strengths: [
      "Chuyên về đào tạo giáo viên",
      "Chương trình sư phạm chất lượng",
      "Thực hành giảng dạy tốt",
      "Đội ngũ giảng viên giỏi",
      "Cơ hội việc làm ổn định"
    ],
    admissionMethods: [
      "Xét tuyển kết quả thi THPT",
      "Xét tuyển học bạ",
      "Thi riêng"
    ],
    tuitionRange: { min: 8000000, max: 18000000 },
    scholarshipInfo: "Học bổng sư phạm, học bổng khuyến khích học tập, miễn giảm học phí",
    location: { city: "Hà Nội", region: "Miền Bắc" },
    isActive: true
  },
  {
    name: "Đại học Luật Hà Nội",
    code: "HLU",
    logo: "https://images.unsplash.com/photo-1562774053-701939374585?w=200&h=200&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=400&fit=crop",
    website: "https://hlu.edu.vn",
    email: "info@hlu.edu.vn",
    phone: "024-37547506",
    address: "87 Nguyễn Chí Thanh, Đống Đa, Hà Nội",
    description: "Đại học Luật Hà Nội là trường đại học luật hàng đầu Việt Nam, chuyên đào tạo luật sư và cán bộ pháp lý. Trường có uy tín cao trong lĩnh vực đào tạo pháp luật và nghiên cứu khoa học pháp lý.",
    strengths: [
      "Chuyên sâu về pháp luật",
      "Đội ngũ giảng viên giỏi",
      "Mạng lưới cựu sinh viên mạnh",
      "Cơ hội thực tập tại tòa án",
      "Tỷ lệ đậu luật sư cao"
    ],
    admissionMethods: [
      "Xét tuyển kết quả thi THPT",
      "Xét tuyển học bạ",
      "Thi riêng"
    ],
    tuitionRange: { min: 10000000, max: 22000000 },
    scholarshipInfo: "Học bổng khuyến khích học tập, học bổng từ các văn phòng luật",
    location: { city: "Hà Nội", region: "Miền Bắc" },
    isActive: true
  },
  {
    name: "Đại học FPT",
    code: "FPT_U",
    logo: "https://images.unsplash.com/photo-1562774053-701939374585?w=200&h=200&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop",
    website: "https://daihoc.fpt.edu.vn",
    email: "info@fpt.edu.vn",
    phone: "024-73007007",
    address: "Khu Công nghệ cao Hòa Lạc, Thạch Thất, Hà Nội",
    description: "Đại học FPT là trường đại học tư thục hàng đầu về công nghệ thông tin, được thành lập bởi Tập đoàn FPT. Trường có mô hình đào tạo hiện đại, gắn liền với thực tiễn doanh nghiệp.",
    strengths: [
      "Mạnh về công nghệ thông tin",
      "Mô hình đào tạo thực tiễn",
      "Cơ sở vật chất hiện đại",
      "Liên kết chặt với doanh nghiệp",
      "Tỷ lệ có việc làm 100%"
    ],
    admissionMethods: [
      "Xét tuyển học bạ",
      "Thi riêng",
      "Xét tuyển kết quả thi THPT"
    ],
    tuitionRange: { min: 16000000, max: 32000000 },
    scholarshipInfo: "Học bổng tài năng, học bổng FPT, học bổng doanh nghiệp đối tác",
    location: { city: "Hà Nội", region: "Miền Bắc" },
    isActive: true
  }
];

async function seedUniversities() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get all majors to link with universities
    const majors = await Major.find({});
    console.log(`Found ${majors.length} majors to link with universities`);

    // Clear existing universities and admission scores
    await University.deleteMany({});
    await AdmissionScore.deleteMany({});
    console.log('Cleared existing universities and admission scores');

    // Add majors to universities (each university will have some majors)
    const universitiesWithMajors = sampleUniversities.map((uni, index) => {
      let selectedMajors: mongoose.Types.ObjectId[] = [];
      
      // Different universities specialize in different majors
      switch (uni.code) {
        case 'VNU_HN':
        case 'VNU_HCM':
          // National universities have all majors
          selectedMajors = majors.map(m => m._id);
          break;
        case 'HUST':
        case 'HCMUT':
          // Technical universities focus on engineering and CS
          selectedMajors = majors.filter(m => 
            ['CS', 'CIVIL'].includes(m.code)
          ).map(m => m._id);
          break;
        case 'NEU':
        case 'UEH':
          // Economic universities focus on business
          selectedMajors = majors.filter(m => 
            ['BUS', 'ACC'].includes(m.code)
          ).map(m => m._id);
          break;
        case 'HMU':
          // Medical university
          selectedMajors = majors.filter(m => 
            m.code === 'MED'
          ).map(m => m._id);
          break;
        case 'HNUE':
          // Pedagogical university
          selectedMajors = majors.filter(m => 
            ['ENG', 'PSYC'].includes(m.code)
          ).map(m => m._id);
          break;
        case 'HLU':
          // Law university
          selectedMajors = majors.filter(m => 
            m.code === 'LAW'
          ).map(m => m._id);
          break;
        case 'FPT_U':
          // FPT focuses on IT and business
          selectedMajors = majors.filter(m => 
            ['CS', 'BUS'].includes(m.code)
          ).map(m => m._id);
          break;
        default:
          // Other universities get random selection
          selectedMajors = majors.slice(0, 5).map(m => m._id);
      }
      
      return {
        ...uni,
        majors: selectedMajors
      };
    });

    // Insert universities
    const universities = await University.insertMany(universitiesWithMajors);
    console.log(`Inserted ${universities.length} universities successfully`);

    // Create sample admission scores for each university-major combination
    const admissionScores = [];
    for (const university of universities) {
      for (const majorId of university.majors) {
        // Create admission scores for 2023 and 2024
        for (const year of [2023, 2024]) {
          const baseScore = 15 + Math.random() * 10; // Random score between 15-25
          
          admissionScores.push({
            universityID: university._id,
            majorID: majorId,
            year: year,
            method: "Xét tuyển kết quả thi THPT",
            score: Math.round(baseScore * 100) / 100, // Round to 2 decimal places
            quota: Math.floor(50 + Math.random() * 200), // Random quota 50-250
            notes: `Điểm chuẩn năm ${year} theo phương thức xét tuyển kết quả thi THPT Quốc gia`
          });

          // Add another method for some combinations
          if (Math.random() > 0.5) {
            admissionScores.push({
              universityID: university._id,
              majorID: majorId,
              year: year,
              method: "Xét tuyển học bạ",
              score: Math.round((baseScore - 1) * 100) / 100,
              quota: Math.floor(20 + Math.random() * 80),
              notes: `Điểm chuẩn năm ${year} theo phương thức xét tuyển học bạ THPT`
            });
          }
        }
      }
    }

    const insertedScores = await AdmissionScore.insertMany(admissionScores);
    console.log(`Inserted ${insertedScores.length} admission scores successfully`);

    // Display results
    console.log('\n🏫 Universities inserted:');
    universities.forEach((uni, index) => {
      console.log(`${index + 1}. ${uni.name} (${uni.code}) - ${uni.location.city}`);
      console.log(`   Majors: ${uni.majors.length}, Tuition: ${uni.tuitionRange.min.toLocaleString()}-${uni.tuitionRange.max.toLocaleString()} VNĐ`);
    });

    console.log('\n📊 Admission scores summary:');
    const scoresByYear = insertedScores.reduce((acc, score) => {
      if (!acc[score.year]) acc[score.year] = 0;
      acc[score.year]++;
      return acc;
    }, {} as Record<number, number>);

    Object.entries(scoresByYear).forEach(([year, count]) => {
      console.log(`${year}: ${count} admission score records`);
    });

    console.log('\n✅ Universities and admission scores seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding universities:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
if (require.main === module) {
  seedUniversities();
}

export default seedUniversities;