require("dotenv").config();

import mongoose from "mongoose";
import { Subject } from "../modules/subjects/subject.model";
import { connectDB } from "../config/db";

const subjects = [
  {
    name: "Toán học",
    code: "TOAN",
    description: "Môn Toán học bao gồm đại số, hình học, giải tích và các chuyên đề nâng cao"
  },
  {
    name: "Vật lý",
    code: "LY",
    description: "Môn Vật lý nghiên cứu các hiện tượng tự nhiên, cơ học, điện học, quang học"
  },
  {
    name: "Hóa học",
    code: "HOA",
    description: "Môn Hóa học nghiên cứu về cấu trúc, tính chất và phản ứng của các chất"
  },
  {
    name: "Tiếng Anh",
    code: "ANH",
    description: "Môn Tiếng Anh bao gồm ngữ pháp, từ vựng, đọc hiểu và giao tiếp"
  },
  {
    name: "Ngữ văn",
    code: "VAN",
    description: "Môn Ngữ văn nghiên cứu văn học, ngôn ngữ và kỹ năng viết"
  },
  {
    name: "Sinh học",
    code: "SINH",
    description: "Môn Sinh học nghiên cứu về sự sống, cơ thể sinh vật và môi trường"
  },
  {
    name: "Lịch sử",
    code: "SU",
    description: "Môn Lịch sử nghiên cứu về các sự kiện, nhân vật và tiến trình lịch sử"
  },
  {
    name: "Địa lý",
    code: "DIA",
    description: "Môn Địa lý nghiên cứu về địa hình, khí hậu, dân cư và kinh tế"
  },
  {
    name: "Giáo dục công dân",
    code: "GDCD",
    description: "Môn Giáo dục công dân về pháp luật, đạo đức và kỹ năng sống"
  },
  {
    name: "Tin học",
    code: "TIN",
    description: "Môn Tin học về lập trình, ứng dụng máy tính và công nghệ thông tin"
  }
];

async function seedSubjects() {
  try {
    // Connect to database
    await connectDB();
    
    console.log("🌱 Starting to seed subjects...");

    // Clear existing subjects
    await Subject.deleteMany({});
    console.log("🗑️  Cleared existing subjects");

    // Insert new subjects
    const createdSubjects = await Subject.insertMany(subjects);
    console.log(`✅ Successfully created ${createdSubjects.length} subjects`);

    // Display created subjects
    createdSubjects.forEach(subject => {
      console.log(`   - ${subject.name} (${subject.code})`);
    });

    console.log("🎉 Subject seeding completed successfully!");
    
  } catch (error) {
    console.error("❌ Error seeding subjects:", error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
}

// Run the seeding function
if (require.main === module) {
  seedSubjects();
}

export default seedSubjects;