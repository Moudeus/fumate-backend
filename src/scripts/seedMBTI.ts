import mongoose from 'mongoose';
import { MBTIQuestion, MBTIType } from '../modules/mbti/mbti.model';
import { Major, MBTICompatibility } from '../modules/majors/major.model';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Sample MBTI Questions với firstAnswer và secondAnswer
const sampleQuestions = [
  // E-I Category (Extraversion vs Introversion)
  { 
    question: "Tôi thích làm việc trong nhóm hơn là làm việc một mình", 
    category: "E-I", 
    firstAnswer: "Đồng ý, tôi thích làm việc nhóm",
    secondAnswer: "Không đồng ý, tôi thích làm việc một mình",
    order: 1, 
    inverted: false 
  },
  { 
    question: "Tôi cảm thấy thoải mái khi gặp gỡ những người mới", 
    category: "E-I", 
    firstAnswer: "Có, tôi rất thoải mái",
    secondAnswer: "Không, tôi cảm thấy ngại ngùng",
    order: 2, 
    inverted: false 
  },
  { 
    question: "Tôi thường suy nghĩ kỹ trước khi nói", 
    category: "E-I", 
    firstAnswer: "Có, tôi luôn suy nghĩ trước",
    secondAnswer: "Không, tôi thường nói ngay",
    order: 3, 
    inverted: true 
  },
  { 
    question: "Tôi thích các hoạt động xã hội và tụ tập đông người", 
    category: "E-I", 
    firstAnswer: "Có, tôi thích hoạt động đông người",
    secondAnswer: "Không, tôi thích hoạt động ít người",
    order: 4, 
    inverted: false 
  },
  { 
    question: "Tôi cần thời gian một mình để nạp lại năng lượng", 
    category: "E-I", 
    firstAnswer: "Có, tôi cần thời gian một mình",
    secondAnswer: "Không, tôi nạp năng lượng từ người khác",
    order: 5, 
    inverted: true 
  },
  { 
    question: "Tôi dễ dàng bắt chuyện với người lạ", 
    category: "E-I", 
    firstAnswer: "Có, tôi dễ dàng bắt chuyện",
    secondAnswer: "Không, tôi khó bắt chuyện với người lạ",
    order: 6, 
    inverted: false 
  },
  { 
    question: "Tôi thích làm việc trong môi trường yên tĩnh", 
    category: "E-I", 
    firstAnswer: "Có, tôi thích môi trường yên tĩnh",
    secondAnswer: "Không, tôi thích môi trường sôi động",
    order: 7, 
    inverted: true 
  },
  { 
    question: "Tôi thường chia sẻ suy nghĩ của mình với người khác", 
    category: "E-I", 
    firstAnswer: "Có, tôi thường chia sẻ",
    secondAnswer: "Không, tôi giữ suy nghĩ cho mình",
    order: 8, 
    inverted: false 
  },

  // S-N Category (Sensing vs Intuition)
  { 
    question: "Tôi thích tập trung vào chi tiết cụ thể hơn là ý tưởng tổng quát", 
    category: "S-N", 
    firstAnswer: "Có, tôi thích chi tiết cụ thể",
    secondAnswer: "Không, tôi thích ý tưởng tổng quát",
    order: 1, 
    inverted: false 
  },
  { 
    question: "Tôi tin vào kinh nghiệm thực tế hơn là lý thuyết", 
    category: "S-N", 
    firstAnswer: "Có, tôi tin vào kinh nghiệm thực tế",
    secondAnswer: "Không, tôi tin vào lý thuyết",
    order: 2, 
    inverted: false 
  },
  { 
    question: "Tôi thích khám phá những khả năng mới và sáng tạo", 
    category: "S-N", 
    firstAnswer: "Có, tôi thích khám phá khả năng mới",
    secondAnswer: "Không, tôi thích làm theo cách đã biết",
    order: 3, 
    inverted: true 
  },
  { 
    question: "Tôi thường làm theo các quy trình đã được thiết lập", 
    category: "S-N", 
    firstAnswer: "Có, tôi thích làm theo quy trình",
    secondAnswer: "Không, tôi thích tự do sáng tạo",
    order: 4, 
    inverted: false 
  },
  { 
    question: "Tôi thích suy nghĩ về tương lai và các khả năng", 
    category: "S-N", 
    firstAnswer: "Có, tôi thích suy nghĩ về tương lai",
    secondAnswer: "Không, tôi tập trung vào hiện tại",
    order: 5, 
    inverted: true 
  },
  { 
    question: "Tôi chú ý đến những gì đang xảy ra xung quanh mình", 
    category: "S-N", 
    firstAnswer: "Có, tôi rất chú ý đến xung quanh",
    secondAnswer: "Không, tôi thường đắm chìm trong suy nghĩ",
    order: 6, 
    inverted: false 
  },
  { 
    question: "Tôi thích thử nghiệm những cách làm mới", 
    category: "S-N", 
    firstAnswer: "Có, tôi thích thử nghiệm",
    secondAnswer: "Không, tôi thích cách làm đã biết",
    order: 7, 
    inverted: true 
  },
  { 
    question: "Tôi thích làm việc với dữ liệu và sự kiện cụ thể", 
    category: "S-N", 
    firstAnswer: "Có, tôi thích dữ liệu cụ thể",
    secondAnswer: "Không, tôi thích ý tưởng trừu tượng",
    order: 8, 
    inverted: false 
  },

  // T-F Category (Thinking vs Feeling)
  { 
    question: "Tôi đưa ra quyết định dựa trên logic và phân tích", 
    category: "T-F", 
    firstAnswer: "Có, tôi dựa vào logic",
    secondAnswer: "Không, tôi dựa vào cảm xúc",
    order: 1, 
    inverted: false 
  },
  { 
    question: "Tôi quan tâm đến cảm xúc của người khác khi đưa ra quyết định", 
    category: "T-F", 
    firstAnswer: "Có, tôi quan tâm đến cảm xúc người khác",
    secondAnswer: "Không, tôi tập trung vào logic",
    order: 2, 
    inverted: true 
  },
  { 
    question: "Tôi thích tranh luận và thảo luận về các vấn đề", 
    category: "T-F", 
    firstAnswer: "Có, tôi thích tranh luận",
    secondAnswer: "Không, tôi tránh tranh luận",
    order: 3, 
    inverted: false 
  },
  { 
    question: "Tôi cố gắng tránh xung đột và duy trì hòa hợp", 
    category: "T-F", 
    firstAnswer: "Có, tôi tránh xung đột",
    secondAnswer: "Không, tôi không ngại xung đột",
    order: 4, 
    inverted: true 
  },
  { 
    question: "Tôi đánh giá ý tưởng dựa trên tính khách quan", 
    category: "T-F", 
    firstAnswer: "Có, tôi đánh giá khách quan",
    secondAnswer: "Không, tôi đánh giá theo cảm nhận",
    order: 5, 
    inverted: false 
  },
  { 
    question: "Tôi quan tâm đến việc giúp đỡ và hỗ trợ người khác", 
    category: "T-F", 
    firstAnswer: "Có, tôi thích giúp đỡ người khác",
    secondAnswer: "Không, tôi tập trung vào mục tiêu cá nhân",
    order: 6, 
    inverted: true 
  },
  { 
    question: "Tôi thích phân tích và giải quyết vấn đề một cách có hệ thống", 
    category: "T-F", 
    firstAnswer: "Có, tôi thích phân tích có hệ thống",
    secondAnswer: "Không, tôi giải quyết theo cảm nhận",
    order: 7, 
    inverted: false 
  },
  { 
    question: "Tôi đưa ra quyết định dựa trên giá trị cá nhân", 
    category: "T-F", 
    firstAnswer: "Có, tôi dựa vào giá trị cá nhân",
    secondAnswer: "Không, tôi dựa vào phân tích khách quan",
    order: 8, 
    inverted: true 
  },

  // J-P Category (Judging vs Perceiving)
  { 
    question: "Tôi thích lập kế hoạch chi tiết trước khi hành động", 
    category: "J-P", 
    firstAnswer: "Có, tôi thích lập kế hoạch chi tiết",
    secondAnswer: "Không, tôi thích hành động tự phát",
    order: 1, 
    inverted: false 
  },
  { 
    question: "Tôi thích giữ các lựa chọn mở và linh hoạt", 
    category: "J-P", 
    firstAnswer: "Có, tôi thích giữ lựa chọn mở",
    secondAnswer: "Không, tôi thích quyết định rõ ràng",
    order: 2, 
    inverted: true 
  },
  { 
    question: "Tôi thường hoàn thành công việc trước deadline", 
    category: "J-P", 
    firstAnswer: "Có, tôi hoàn thành sớm",
    secondAnswer: "Không, tôi thường làm gấp rút",
    order: 3, 
    inverted: false 
  },
  { 
    question: "Tôi thích làm việc theo cảm hứng và tự phát", 
    category: "J-P", 
    firstAnswer: "Có, tôi thích làm theo cảm hứng",
    secondAnswer: "Không, tôi thích làm theo kế hoạch",
    order: 4, 
    inverted: true 
  },
  { 
    question: "Tôi cảm thấy thoải mái với lịch trình có cấu trúc", 
    category: "J-P", 
    firstAnswer: "Có, tôi thích lịch trình có cấu trúc",
    secondAnswer: "Không, tôi thích lịch trình linh hoạt",
    order: 5, 
    inverted: false 
  },
  { 
    question: "Tôi thích khám phá nhiều lựa chọn trước khi quyết định", 
    category: "J-P", 
    firstAnswer: "Có, tôi thích khám phá nhiều lựa chọn",
    secondAnswer: "Không, tôi quyết định nhanh",
    order: 6, 
    inverted: true 
  },
  { 
    question: "Tôi thích có sự chắc chắn và kết luận rõ ràng", 
    category: "J-P", 
    firstAnswer: "Có, tôi thích sự chắc chắn",
    secondAnswer: "Không, tôi thoải mái với sự mơ hồ",
    order: 7, 
    inverted: false 
  },
  { 
    question: "Tôi thích thích nghi với những thay đổi bất ngờ", 
    category: "J-P", 
    firstAnswer: "Có, tôi thích thay đổi bất ngờ",
    secondAnswer: "Không, tôi thích sự ổn định",
    order: 8, 
    inverted: true 
  },
];

// MBTI Types data với majors sẽ được populate sau
const mbtiTypesData = [
  {
    type: "INTJ",
    name: "The Architect",
    description: "Người có tư duy chiến lược, thích lập kế hoạch và suy nghĩ về tương lai.",
    strengths: ["Tư duy logic", "Khả năng lập kế hoạch", "Quyết đoán", "Độc lập"],
    weaknesses: ["Có thể thiếu kiên nhẫn", "Khó thể hiện cảm xúc", "Quá lý tưởng"],
    majorCodes: ["CNTT", "KT", "KTCN"]
  },
  {
    type: "INTP",
    name: "The Logician",
    description: "Người tư duy sáng tạo, thích khám phá ý tưởng mới và giải quyết vấn đề phức tạp.",
    strengths: ["Sáng tạo", "Phân tích sâu", "Tò mò", "Khách quan"],
    weaknesses: ["Cô đơn", "Thiếu thực tế", "Khó giao tiếp"],
    majorCodes: ["CNTT", "VL", "TOAN"]
  },
  {
    type: "ENTJ",
    name: "The Commander",
    description: "Người lãnh đạo tự nhiên, dám nghĩ dám làm và có khả năng truyền cảm hứng cho người khác.",
    strengths: ["Lãnh đạo", "Quyết đoán", "Hiệu quả", "Tầm nhìn"],
    weaknesses: ["Bướng bỉnh", "Thiếu kiên nhẫn", "Khó chấp nhận ý kiến khác"],
    majorCodes: ["QTKD", "LUAT", "KT"]
  },
  {
    type: "ENTP",
    name: "The Debater",
    description: "Người thích tranh luận, sáng tạo và luôn tìm kiếm những ý tưởng mới.",
    strengths: ["Sáng tạo", "Nhanh nhẹn", "Thích thử nghiệm", "Hài hước"],
    weaknesses: ["Thiếu tập trung", "Có thể gây tranh cãi", "Khó hoàn thành"],
    majorCodes: ["MKT", "TT", "LUAT"]
  },
  {
    type: "INFJ",
    name: "The Advocate",
    description: "Người lý tưởng, có trực giác mạnh và mong muốn giúp đỡ người khác.",
    strengths: ["Đồng cảm", "Trực giác", "Kiên định", "Sáng tạo"],
    weaknesses: ["Nhạy cảm quá", "Khó nói không", "Cô đơn"],
    majorCodes: ["TH", "GD", "XH"]
  },
  {
    type: "INFP",
    name: "The Mediator",
    description: "Người lãng mạn, sáng tạo và luôn tìm kiếm ý nghĩa trong cuộc sống.",
    strengths: ["Đồng cảm", "Sáng tạo", "Linh hoạt", "Tận tâm"],
    weaknesses: ["Khó tập trung thực tế", "Nhạy cảm", "Tự chỉ trích"],
    majorCodes: ["NT", "VH", "TK"]
  },
  {
    type: "ENFJ",
    name: "The Protagonist",
    description: "Người lãnh đạo truyền cảm hứng, có khả năng thu hút và động viên người khác.",
    strengths: ["Lãnh đạo", "Đồng cảm", "Truyền cảm hứng", "Tổ chức"],
    weaknesses: ["Quá lý tưởng", "Thiếu tự chăm sóc", "Kiểm soát"],
    majorCodes: ["GD", "QLNS", "TV"]
  },
  {
    type: "ENFP",
    name: "The Campaigner",
    description: "Người năng động, nhiệt tình và luôn tìm kiếm những khả năng mới.",
    strengths: ["Nhiệt tình", "Sáng tạo", "Giao tiếp", "Lạc quan"],
    weaknesses: ["Thiếu tập trung", "Có thể không hoàn thành", "Dễ bị phân tâm"],
    majorCodes: ["MKT", "BT", "QC"]
  },
  {
    type: "ISTJ",
    name: "The Logistician",
    description: "Người thực tế, đáng tin cậy và có tổ chức.",
    strengths: ["Đáng tin cậy", "Thực tế", "Có tổ chức", "Chu đáo"],
    weaknesses: ["Cứng nhắc", "Khó thích nghi", "Bảo thủ"],
    majorCodes: ["KT", "TC", "PL"]
  },
  {
    type: "ISFJ",
    name: "The Defender",
    description: "Người bảo vệ, chu đáo và luôn quan tâm đến người khác.",
    strengths: ["Chu đáo", "Đáng tin cậy", "Có tổ chức", "Đồng cảm"],
    weaknesses: ["Nhường nhịn quá mức", "Sợ thay đổi", "Tự hy sinh"],
    majorCodes: ["YT", "GD", "DVXH"]
  },
  {
    type: "ESTJ",
    name: "The Executive",
    description: "Người quản lý tự nhiên, có trách nhiệm và đáng tin cậy.",
    strengths: ["Tổ chức", "Quyết đoán", "Đáng tin cậy", "Hiệu quả"],
    weaknesses: ["Cứng nhắc", "Thiếu linh hoạt", "Bướng bỉnh"],
    majorCodes: ["QTKD", "TC", "HCCC"]
  },
  {
    type: "ESFJ",
    name: "The Consul",
    description: "Người quan tâm, thân thiện và luôn muốn giúp đỡ người khác.",
    strengths: ["Thân thiện", "Chu đáo", "Xã hội", "Tổ chức"],
    weaknesses: ["Cần sự công nhận", "Sợ xung đột", "Quá quan tâm"],
    majorCodes: ["CSSK", "GD", "QLSK"]
  },
  {
    type: "ISTP",
    name: "The Virtuoso",
    description: "Người thực hành, thích hành động và giải quyết vấn đề bằng thực tế.",
    strengths: ["Thực hành", "Linh hoạt", "Phân tích", "Dũng cảm"],
    weaknesses: ["Thiếu kiên nhẫn", "Khó thể hiện cảm xúc", "Rủi ro"],
    majorCodes: ["KT", "CNTT", "TKCN"]
  },
  {
    type: "ISFP",
    name: "The Adventurer",
    description: "Người nghệ sĩ, linh hoạt và sống trong hiện tại.",
    strengths: ["Sáng tạo", "Linh hoạt", "Đồng cảm", "Tinh tế"],
    weaknesses: ["Khó cam kết", "Sợ trách nhiệm", "Thay đổi"],
    majorCodes: ["MT", "TK", "AN"]
  },
  {
    type: "ESTP",
    name: "The Entrepreneur",
    description: "Người hành động, năng động và thích thử thách.",
    strengths: ["Năng động", "Thực tế", "Linh hoạt", "Dũng cảm"],
    weaknesses: ["Thiếu kiên nhẫn", "Rủi ro", "Khó tập trung"],
    majorCodes: ["KD", "MKT", "BDS"]
  },
  {
    type: "ESFP",
    name: "The Entertainer",
    description: "Người vui vẻ, năng động và thích ở giữa mọi người.",
    strengths: ["Năng động", "Vui vẻ", "Xã hội", "Thực tế"],
    weaknesses: ["Sợ một mình", "Khó tập trung", "Thiếu nghiêm túc"],
    majorCodes: ["GT", "SALES", "DL"]
  }
];

async function seedMBTIData() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing data
    await MBTIQuestion.deleteMany({});
    await MBTIType.deleteMany({});
    await MBTICompatibility.deleteMany({});
    console.log('Cleared existing MBTI data');

    // Insert sample questions
    const insertedQuestions = await MBTIQuestion.insertMany(sampleQuestions);
    console.log(`Inserted ${insertedQuestions.length} MBTI questions`);

    // Create some sample majors if they don't exist
    const sampleMajors = [
      { code: "CNTT", name: "Công nghệ thông tin", description: "Ngành học về máy tính và công nghệ" },
      { code: "KT", name: "Kỹ thuật", description: "Ngành kỹ thuật tổng hợp" },
      { code: "KTCN", name: "Kỹ thuật công nghiệp", description: "Kỹ thuật và quản lý sản xuất" },
      { code: "VL", name: "Vật lý", description: "Khoa học tự nhiên về vật chất và năng lượng" },
      { code: "TOAN", name: "Toán học", description: "Khoa học về số học và hình học" },
      { code: "TH", name: "Triết học", description: "Nghiên cứu về tư tưởng và triết lý" },
      { code: "QTKD", name: "Quản trị kinh doanh", description: "Quản lý và điều hành doanh nghiệp" },
      { code: "LUAT", name: "Luật", description: "Nghiên cứu và thực hành pháp luật" },
      { code: "MKT", name: "Marketing", description: "Tiếp thị và quảng cáo" },
      { code: "TT", name: "Truyền thông", description: "Báo chí và truyền thông đại chúng" },
      { code: "KN", name: "Khởi nghiệp", description: "Kinh doanh và khởi nghiệp" },
      { code: "GD", name: "Giáo dục", description: "Sư phạm và giáo dục" },
      { code: "XH", name: "Xã hội học", description: "Nghiên cứu xã hội và con người" },
      { code: "NT", name: "Nghệ thuật", description: "Mỹ thuật và nghệ thuật" },
      { code: "VH", name: "Văn học", description: "Ngôn ngữ và văn học" },
      { code: "TK", name: "Thiết kế", description: "Thiết kế đồ họa và sản phẩm" },
      { code: "QLNS", name: "Quản lý nhân sự", description: "Quản trị nguồn nhân lực" },
      { code: "TV", name: "Tư vấn", description: "Tư vấn tâm lý và kinh doanh" },
      { code: "BT", name: "Báo chí", description: "Báo chí và truyền thông" },
      { code: "QC", name: "Quảng cáo", description: "Quảng cáo và marketing" },
      { code: "TC", name: "Tài chính", description: "Tài chính và ngân hàng" },
      { code: "PL", name: "Pháp lý", description: "Luật và pháp lý" },
      { code: "YT", name: "Y tế", description: "Y học và chăm sóc sức khỏe" },
      { code: "DVXH", name: "Dịch vụ xã hội", description: "Công tác xã hội" },
      { code: "HCCC", name: "Hành chính công", description: "Quản lý nhà nước" },
      { code: "CSSK", name: "Chăm sóc sức khỏe", description: "Điều dưỡng và chăm sóc" },
      { code: "QLSK", name: "Quản lý sự kiện", description: "Tổ chức và quản lý sự kiện" },
      { code: "TKCN", name: "Thiết kế công nghiệp", description: "Thiết kế sản phẩm công nghiệp" },
      { code: "MT", name: "Mỹ thuật", description: "Hội họa và mỹ thuật" },
      { code: "AN", name: "Âm nhạc", description: "Âm nhạc và biểu diễn" },
      { code: "KD", name: "Kinh doanh", description: "Kinh doanh và thương mại" },
      { code: "BDS", name: "Bất động sản", description: "Kinh doanh bất động sản" },
      { code: "GT", name: "Giải trí", description: "Nghệ thuật biểu diễn và giải trí" },
      { code: "SALES", name: "Bán hàng", description: "Kinh doanh và bán hàng" },
      { code: "DL", name: "Du lịch", description: "Du lịch và dịch vụ" }
    ];

    // Insert majors if they don't exist
    for (const majorData of sampleMajors) {
      await Major.findOneAndUpdate(
        { code: majorData.code },
        majorData,
        { upsert: true, new: true }
      );
    }
    console.log('Ensured sample majors exist');

    // Insert MBTI types without major references
    for (const typeData of mbtiTypesData) {
      const mbtiType = new MBTIType({
        type: typeData.type,
        name: typeData.name,
        description: typeData.description,
        strengths: typeData.strengths,
        weaknesses: typeData.weaknesses
      });
      
      await mbtiType.save();
      
      // Create MBTICompatibility records for each major
      const majors = await Major.find({ 
        code: { $in: typeData.majorCodes } 
      }).select('_id');
      
      for (const major of majors) {
        // Generate compatibility score based on position in array (first = highest)
        const index = typeData.majorCodes.indexOf(
          (await Major.findById(major._id).select('code'))?.code || ''
        );
        const compatibilityScore = 90 - (index * 10); // 90, 80, 70, etc.
        
        await MBTICompatibility.create({
          majorId: major._id,
          mbtiType: typeData.type,
          compatibilityScore,
          description: `${typeData.name} phù hợp với ngành này`,
          strengths: typeData.strengths.slice(0, 2),
          challenges: typeData.weaknesses.slice(0, 2),
          careerExamples: [],
          isActive: true
        });
      }
    }
    
    console.log(`Inserted ${mbtiTypesData.length} MBTI types with compatibility data`);
    console.log('MBTI data seeding completed successfully!');
    
    // Display summary
    console.log('\n=== SEEDING SUMMARY ===');
    console.log(`Questions by category:`);
    const categoryCounts = sampleQuestions.reduce((acc, q) => {
      acc[q.category] = (acc[q.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} questions`);
    });
    
    console.log(`\nTotal Questions: ${sampleQuestions.length}`);
    console.log(`Total MBTI Types: ${mbtiTypesData.length}`);
    
  } catch (error) {
    console.error('Error seeding MBTI data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
if (require.main === module) {
  seedMBTIData();
}

export { seedMBTIData, sampleQuestions, mbtiTypesData };