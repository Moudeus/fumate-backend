import mongoose from 'mongoose';
import Article from '../modules/articles/article.model';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const sampleArticles = [
  {
    title: "Hướng dẫn chuẩn bị hồ sơ đại học hiệu quả",
    slug: "huong-dan-chuan-bi-ho-so-dai-hoc-hieu-qua",
    summary: "Những bước chuẩn bị hồ sơ đại học quan trọng mà thí sinh cần biết để tăng cơ hội trúng tuyển.",
    content: `
# Hướng dẫn chuẩn bị hồ sơ đại học hiệu quả

## 1. Chuẩn bị giấy tờ cần thiết

### Giấy tờ bắt buộc:
- Bằng tốt nghiệp THPT hoặc giấy chứng nhận tốt nghiệp tạm thời
- Học bạ THPT (bản chính hoặc bản sao công chứng)
- Giấy chứng nhận kết quả thi THPT Quốc gia
- Chứng minh nhân dân/Căn cước công dân
- Giấy khai sinh
- Ảnh 3x4 (thường 6-8 ảnh)

### Giấy tờ bổ sung (nếu có):
- Giấy chứng nhận ưu tiên đối tượng, ưu tiên khu vực
- Bằng khen, giấy khen các cấp
- Chứng chỉ ngoại ngữ, tin học
- Giấy chứng nhận tham gia các hoạt động xã hội

## 2. Lưu ý quan trọng

### Thời gian nộp hồ sơ:
- Nộp hồ sơ đúng thời hạn quy định
- Chuẩn bị hồ sơ trước ít nhất 1 tháng
- Kiểm tra kỹ thông tin trước khi nộp

### Cách thức nộp hồ sơ:
- Nộp trực tiếp tại trường
- Nộp qua đường bưu điện (nếu trường cho phép)
- Nộp online (một số trường áp dụng)

## 3. Mẹo hữu ích

- Photocopy nhiều bản các giấy tờ quan trọng
- Sắp xếp hồ sơ theo thứ tự yêu cầu của trường
- Kiểm tra kỹ thông tin cá nhân trên các giấy tờ
- Chuẩn bị phong bì A4 để đựng hồ sơ

Chúc các bạn thí sinh chuẩn bị hồ sơ thành công và đạt được nguyện vọng của mình!
    `,
    category: "university_info",
    author: {
      name: "FU Mate Team"
    },
    tags: ["hồ sơ đại học", "tuyển sinh", "thpt quốc gia", "chuẩn bị thi"],
    coverImage: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=400&fit=crop",
    isPublished: true,
    isFeatured: true,
    viewCount: 1250,
    publishedAt: new Date('2024-01-15')
  },
  {
    title: "10 kỹ năng học tập hiệu quả cho học sinh THPT",
    slug: "10-ky-nang-hoc-tap-hieu-qua-cho-hoc-sinh-thpt",
    summary: "Những kỹ năng học tập thiết yếu giúp học sinh THPT nâng cao hiệu quả học tập và đạt kết quả tốt.",
    content: `
# 10 kỹ năng học tập hiệu quả cho học sinh THPT

## 1. Lập kế hoạch học tập chi tiết
- Xác định mục tiêu học tập rõ ràng
- Phân chia thời gian hợp lý cho từng môn học
- Tạo thời khóa biểu học tập cá nhân

## 2. Kỹ thuật ghi chú hiệu quả
- Sử dụng sơ đồ tư duy (mind map)
- Ghi chú theo phương pháp Cornell
- Tóm tắt nội dung bằng từ khóa

## 3. Quản lý thời gian thông minh
- Áp dụng kỹ thuật Pomodoro
- Ưu tiên công việc quan trọng
- Tránh trì hoãn và lãng phí thời gian

## 4. Kỹ năng đọc hiểu nâng cao
- Đọc lướt để nắm ý chính
- Đọc kỹ để hiểu sâu
- Đặt câu hỏi trong quá trình đọc

## 5. Phương pháp ôn tập khoa học
- Ôn tập theo chu kỳ
- Kết hợp nhiều giác quan
- Thực hành làm bài tập thường xuyên

## 6. Kỹ năng làm bài thi
- Đọc kỹ đề bài trước khi làm
- Phân bổ thời gian hợp lý
- Kiểm tra lại bài làm

## 7. Tạo môi trường học tập tích cực
- Chọn không gian học tập phù hợp
- Loại bỏ các yếu tố gây xao nhãng
- Chuẩn bị đầy đủ dụng cụ học tập

## 8. Kỹ năng tự đánh giá
- Nhận biết điểm mạnh, điểm yếu
- Điều chỉnh phương pháp học tập
- Theo dõi tiến bộ học tập

## 9. Học nhóm hiệu quả
- Chọn thành viên phù hợp
- Phân công nhiệm vụ rõ ràng
- Thảo luận và chia sẻ kiến thức

## 10. Chăm sóc sức khỏe
- Duy trì chế độ ngủ nghỉ đầy đủ
- Tập thể dục thường xuyên
- Ăn uống đầy đủ dinh dưỡng

Áp dụng những kỹ năng này một cách kiên trì sẽ giúp bạn đạt được kết quả học tập tốt nhất!
    `,
    category: "study_tips",
    author: {
      name: "Thầy Nguyễn Văn A"
    },
    tags: ["kỹ năng học tập", "học sinh thpt", "phương pháp học", "hiệu quả"],
    coverImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop",
    isPublished: true,
    isFeatured: true,
    viewCount: 2100,
    publishedAt: new Date('2024-01-20')
  },
  {
    title: "Xu hướng nghề nghiệp hot nhất năm 2024",
    slug: "xu-huong-nghe-nghiep-hot-nhat-nam-2024",
    summary: "Tổng quan về những ngành nghề được dự báo sẽ phát triển mạnh mẽ trong năm 2024 và tương lai.",
    content: `
# Xu hướng nghề nghiệp hot nhất năm 2024

## 1. Công nghệ thông tin và AI

### Các vị trí hot:
- **Data Scientist**: Phân tích dữ liệu lớn
- **AI Engineer**: Phát triển trí tuệ nhân tạo
- **Cybersecurity Specialist**: Bảo mật thông tin
- **Cloud Architect**: Kiến trúc đám mây

### Mức lương trung bình: 15-50 triệu VNĐ/tháng

## 2. Y tế và Chăm sóc sức khỏe

### Các vị trí nổi bật:
- **Bác sĩ chuyên khoa**: Đặc biệt là tim mạch, ung bướu
- **Dược sĩ lâm sàng**: Tư vấn và quản lý thuốc
- **Kỹ thuật viên y tế**: Vận hành thiết bị hiện đại
- **Nhân viên chăm sóc người cao tuổi**: Nhu cầu tăng cao

### Mức lương trung bình: 8-30 triệu VNĐ/tháng

## 3. Tài chính và Ngân hàng số

### Vị trí được săn đón:
- **Fintech Developer**: Phát triển ứng dụng tài chính
- **Risk Analyst**: Phân tích rủi ro đầu tư
- **Digital Banking Specialist**: Chuyên gia ngân hàng số
- **Cryptocurrency Analyst**: Phân tích tiền điện tử

### Mức lương trung bình: 12-40 triệu VNĐ/tháng

## 4. Marketing số và E-commerce

### Các vị trí hot:
- **Digital Marketing Manager**: Quản lý marketing online
- **SEO/SEM Specialist**: Tối ưu hóa công cụ tìm kiếm
- **Social Media Manager**: Quản lý mạng xã hội
- **E-commerce Manager**: Quản lý bán hàng trực tuyến

### Mức lương trung bình: 8-25 triệu VNĐ/tháng

## 5. Năng lượng tái tạo và Môi trường

### Nghề nghiệp triển vọng:
- **Kỹ sư năng lượng mặt trời**: Thiết kế hệ thống solar
- **Chuyên gia môi trường**: Đánh giá tác động môi trường
- **Kỹ sư năng lượng gió**: Phát triển điện gió
- **Nhà tư vấn bền vững**: Tư vấn phát triển bền vững

### Mức lương trung bình: 10-35 triệu VNĐ/tháng

## Lời khuyên cho sinh viên

1. **Nâng cao kỹ năng số**: Học các công cụ và ngôn ngữ lập trình
2. **Phát triển soft skills**: Giao tiếp, làm việc nhóm, tư duy phản biện
3. **Học suốt đời**: Cập nhật kiến thức và xu hướng mới
4. **Xây dựng mạng lưới**: Kết nối với chuyên gia trong ngành
5. **Thực tập sớm**: Tích lũy kinh nghiệm thực tế

Hãy chuẩn bị kỹ lưỡng để nắm bắt những cơ hội nghề nghiệp tuyệt vời này!
    `,
    category: "career_guidance",
    author: {
      name: "Cô Trần Thị B"
    },
    tags: ["xu hướng nghề nghiệp", "việc làm 2024", "tương lai nghề nghiệp", "lương cao"],
    coverImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop",
    isPublished: true,
    isFeatured: true,
    viewCount: 1800,
    publishedAt: new Date('2024-01-25')
  },
  {
    title: "Cách chọn ngành học phù hợp với tính cách MBTI",
    slug: "cach-chon-nganh-hoc-phu-hop-voi-tinh-cach-mbti",
    summary: "Hướng dẫn chi tiết cách sử dụng kết quả test MBTI để lựa chọn ngành học và nghề nghiệp phù hợp.",
    content: `
# Cách chọn ngành học phù hợp với tính cách MBTI

## Giới thiệu về MBTI

MBTI (Myers-Briggs Type Indicator) là công cụ đánh giá tính cách dựa trên 4 cặp đối lập:
- **E (Extroversion) vs I (Introversion)**: Hướng ngoại vs Hướng nội
- **S (Sensing) vs N (Intuition)**: Cảm giác vs Trực giác
- **T (Thinking) vs F (Feeling)**: Tư duy vs Cảm xúc
- **J (Judging) vs P (Perceiving)**: Phán đoán vs Linh hoạt

## Các nhóm tính cách và ngành học phù hợp

### 1. Nhóm Analyst (NT) - Nhà phân tích
**Đặc điểm**: Logic, độc lập, yêu thích thử thách trí tuệ

**Ngành học phù hợp**:
- Khoa học máy tính
- Kỹ thuật (cơ khí, điện, hóa học)
- Toán học và Thống kê
- Vật lý và Thiên văn học
- Kinh tế và Tài chính
- Triết học

### 2. Nhóm Diplomat (NF) - Nhà ngoại giao
**Đặc điểm**: Sáng tạo, đồng cảm, quan tâm đến con người

**Ngành học phù hợp**:
- Tâm lý học
- Giáo dục và Sư phạm
- Ngôn ngữ và Văn học
- Nghệ thuật và Thiết kế
- Công tác xã hội
- Báo chí và Truyền thông

### 3. Nhóm Sentinel (SJ) - Người bảo vệ
**Đặc điểm**: Có trách nhiệm, tổ chức tốt, thích sự ổn định

**Ngành học phù hợp**:
- Kế toán và Kiểm toán
- Quản trị kinh doanh
- Luật
- Y học (đặc biệt là gia đình)
- Hành chính công
- Ngân hàng

### 4. Nhóm Explorer (SP) - Nhà thám hiểm
**Đặc điểm**: Linh hoạt, thực tế, thích hành động

**Ngành học phù hợp**:
- Thể thao và Huấn luyện
- Nghệ thuật biểu diễn
- Du lịch và Khách sạn
- Marketing và Bán hàng
- Kỹ thuật ứng dụng
- Y học cấp cứu

## Hướng dẫn chi tiết theo từng loại MBTI

### INTJ - Kiến trúc sư
- **Ngành phù hợp**: Kiến trúc, Kỹ thuật phần mềm, Nghiên cứu khoa học
- **Lý do**: Thích làm việc độc lập, có tầm nhìn dài hạn

### ENFP - Người truyền cảm hứng
- **Ngành phù hợp**: Tâm lý học, Marketing sáng tạo, Báo chí
- **Lý do**: Năng động, sáng tạo, thích làm việc với con người

### ISTJ - Người hậu cần
- **Ngành phù hợp**: Kế toán, Quản lý, Y học gia đình
- **Lý do**: Cẩn thận, có trách nhiệm, thích quy trình rõ ràng

### ESTP - Người kinh doanh
- **Ngành phù hợp**: Kinh doanh, Bán hàng, Thể thao
- **Lý do**: Năng động, thích thử thách, giỏi giao tiếp

## Lời khuyên khi chọn ngành

1. **Làm bài test MBTI chính thức**: Để có kết quả chính xác nhất
2. **Tham khảo ý kiến**: Hỏi ý kiến thầy cô, gia đình và bạn bè
3. **Tìm hiểu thực tế ngành học**: Nội dung học, cơ hội việc làm
4. **Thử nghiệm**: Tham gia các hoạt động liên quan đến ngành
5. **Không bị ràng buộc hoàn toàn**: MBTI chỉ là tham khảo, không phải quyết định cuối cùng

## Kết luận

MBTI là công cụ hữu ích để hiểu bản thân và đưa ra quyết định về tương lai. Tuy nhiên, hãy nhớ rằng mỗi người đều có thể phát triển và thay đổi theo thời gian. Quan trọng nhất là chọn ngành học mà bạn thực sự đam mê và có động lực theo đuổi lâu dài.

Chúc bạn tìm được ngành học phù hợp và thành công trên con đường sự nghiệp!
    `,
    category: "career_guidance",
    author: {
      name: "FU Mate Team"
    },
    tags: ["mbti", "chọn ngành", "tính cách", "hướng nghiệp", "test tâm lý"],
    coverImage: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop",
    isPublished: true,
    isFeatured: false,
    viewCount: 950,
    publishedAt: new Date('2024-01-30')
  },
  {
    title: "Thông tin tuyển sinh các trường đại học top đầu 2024",
    slug: "thong-tin-tuyen-sinh-cac-truong-dai-hoc-top-dau-2024",
    summary: "Cập nhật thông tin tuyển sinh mới nhất của các trường đại học hàng đầu Việt Nam năm 2024.",
    content: `
# Thông tin tuyển sinh các trường đại học top đầu 2024

## 1. Đại học Quốc gia Hà Nội

### Thông tin chung:
- **Thời gian nộp hồ sơ**: 15/3 - 30/4/2024
- **Phương thức tuyển sinh**: Xét tuyển kết hợp
- **Chỉ tiêu**: 8,500 sinh viên

### Các ngành hot:
- **Công nghệ thông tin**: 25-28 điểm
- **Y khoa**: 27-29 điểm  
- **Kinh tế**: 24-26 điểm
- **Luật**: 25-27 điểm

### Ưu đãi:
- Học bổng toàn phần cho thí sinh đạt 29+ điểm
- Miễn giảm học phí cho con em gia đình chính sách

## 2. Đại học Bách khoa Hà Nội

### Thông tin chung:
- **Thời gian nộp hồ sơ**: 20/3 - 5/5/2024
- **Phương thức tuyển sinh**: Thi riêng + Xét học bạ
- **Chỉ tiêu**: 7,200 sinh viên

### Các ngành nổi bật:
- **Kỹ thuật máy tính**: 26-28 điểm
- **Kỹ thuật điện tử**: 25-27 điểm
- **Kỹ thuật cơ khí**: 24-26 điểm
- **Kỹ thuật hóa học**: 23-25 điểm

### Đặc biệt:
- Chương trình PFIEV (Pháp-Việt)
- Chương trình HEDSPI (Việt-Nhật)

## 3. Đại học Kinh tế Quốc dân

### Thông tin chung:
- **Thời gian nộp hồ sơ**: 10/3 - 25/4/2024
- **Phương thức tuyển sinh**: Đa dạng phương thức
- **Chỉ tiêu**: 6,800 sinh viên

### Ngành học ưu tiên:
- **Tài chính - Ngân hàng**: 24-26 điểm
- **Kinh tế đối ngoại**: 23-25 điểm
- **Kế toán**: 22-24 điểm
- **Marketing**: 21-23 điểm

## 4. Đại học Y Hà Nội

### Thông tin chung:
- **Thời gian nộp hồ sơ**: 1/4 - 15/5/2024
- **Phương thức tuyển sinh**: Thi riêng bắt buộc
- **Chỉ tiêu**: 1,500 sinh viên

### Các ngành đào tạo:
- **Y khoa**: 28-29.5 điểm
- **Răng hàm mặt**: 27-28.5 điểm
- **Dược học**: 26-27.5 điểm
- **Y học cổ truyền**: 25-26.5 điểm

## 5. Đại học Ngoại thương

### Thông tin chung:
- **Thời gian nộp hồ sơ**: 5/3 - 20/4/2024
- **Phương thức tuyển sinh**: Xét tuyển kết hợp
- **Chỉ tiêu**: 4,200 sinh viên

### Ngành học nổi bật:
- **Kinh doanh quốc tế**: 24-26 điểm
- **Tài chính quốc tế**: 23-25 điểm
- **Ngoại ngữ thương mại**: 22-24 điểm

## Lịch tuyển sinh quan trọng

### Tháng 3/2024:
- Công bố đề án tuyển sinh
- Mở đăng ký xét tuyển sớm

### Tháng 4/2024:
- Hạn chót nộp hồ sơ xét tuyển sớm
- Thi đánh giá năng lực

### Tháng 5/2024:
- Công bố kết quả xét tuyển sớm
- Thi tốt nghiệp THPT

### Tháng 6-7/2024:
- Đăng ký nguyện vọng
- Xét tuyển chính thức

### Tháng 8/2024:
- Công bố kết quả trúng tuyển
- Nhập học

## Mẹo tăng cơ hội trúng tuyển

1. **Chuẩn bị kỹ lưỡng**: Ôn tập đầy đủ các môn thi
2. **Đăng ký đúng hạn**: Không để trễ thời gian nộp hồ sơ
3. **Chọn nguyện vọng hợp lý**: Kết hợp nguyện vọng cao và an toàn
4. **Tham gia hoạt động ngoại khóa**: Tăng điểm cộng
5. **Tìm hiểu kỹ về trường**: Để viết thư động cơ tốt

## Kết luận

Việc chuẩn bị tuyển sinh đại học cần sự kiên trì và kế hoạch chi tiết. Hãy bắt đầu chuẩn bị từ sớm và theo dõi thông tin cập nhật từ các trường để không bỏ lỡ cơ hội.

Chúc các bạn thí sinh đạt được kết quả tốt nhất!
    `,
    category: "university_info",
    author: {
      name: "Thầy Lê Văn C"
    },
    tags: ["tuyển sinh đại học", "điểm chuẩn", "thông tin tuyển sinh", "đại học top"],
    coverImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=400&fit=crop",
    isPublished: true,
    isFeatured: false,
    viewCount: 3200,
    publishedAt: new Date('2024-02-01')
  }
];

async function seedArticles() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing articles
    await Article.deleteMany({});
    console.log('Cleared existing articles');

    // Insert sample articles
    const articles = await Article.insertMany(sampleArticles);
    console.log(`Inserted ${articles.length} articles successfully`);

    // Display inserted articles
    articles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title} (${article.category})`);
    });

    console.log('\n✅ Articles seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding articles:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
if (require.main === module) {
  seedArticles();
}

export default seedArticles;