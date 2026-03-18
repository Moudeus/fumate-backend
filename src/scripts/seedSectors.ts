import mongoose from 'mongoose';
import { Sector } from '../modules/universities/sector.model';
import { Subject } from '../modules/subjects/subject.model';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Seed sectors (khối thi) with exactly 3 subjects each
 */
async function seedSectors() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get all subjects
    const subjects = await Subject.find({});
    console.log(`Found ${subjects.length} subjects`);

    if (subjects.length < 3) {
      throw new Error('Need at least 3 subjects to create sectors. Please run seedSubjects first.');
    }

    // Create subject map for easy lookup
    const subjectMap = subjects.reduce((map, subject) => {
      map[subject.code] = subject._id;
      return map;
    }, {} as Record<string, mongoose.Types.ObjectId>);

    // Clear existing sectors
    await Sector.deleteMany({});
    console.log('Cleared existing sectors');

    // Define sectors based on Vietnamese university admission system
    const sectorData = [
      {
        name: "Khối A00",
        code: "A00",
        description: "Toán, Lý, Hóa - Khối tự nhiên cơ bản",
        subjectCodes: ["TOAN", "LY", "HOA"]
      },
      {
        name: "Khối A01",
        code: "A01",
        description: "Toán, Lý, Anh - Khối kỹ thuật quốc tế",
        subjectCodes: ["TOAN", "LY", "ANH"]
      },
      {
        name: "Khối B00",
        code: "B00",
        description: "Toán, Hóa, Sinh - Khối y dược",
        subjectCodes: ["TOAN", "HOA", "SINH"]
      },
      {
        name: "Khối C00",
        code: "C00",
        description: "Văn, Sử, Địa - Khối xã hội cơ bản",
        subjectCodes: ["VAN", "SU", "DIA"]
      },
      {
        name: "Khối D01",
        code: "D01",
        description: "Toán, Văn, Anh - Khối kinh tế quốc tế",
        subjectCodes: ["TOAN", "VAN", "ANH"]
      },
      {
        name: "Khối D07",
        code: "D07",
        description: "Toán, Hóa, Anh - Khối công nghệ thực phẩm",
        subjectCodes: ["TOAN", "HOA", "ANH"]
      },
      {
        name: "Khối D08",
        code: "D08",
        description: "Toán, Sinh, Anh - Khối công nghệ sinh học",
        subjectCodes: ["TOAN", "SINH", "ANH"]
      },
      {
        name: "Khối D09",
        code: "D09",
        description: "Toán, Sử, Anh - Khối quản trị kinh doanh",
        subjectCodes: ["TOAN", "SU", "ANH"]
      },
      {
        name: "Khối D10",
        code: "D10",
        description: "Toán, Địa, Anh - Khối du lịch quốc tế",
        subjectCodes: ["TOAN", "DIA", "ANH"]
      },
      {
        name: "Khối D14",
        code: "D14",
        description: "Văn, Toán, GDCD - Khối sư phạm",
        subjectCodes: ["VAN", "TOAN", "GDCD"]
      },
      {
        name: "Khối D15",
        code: "D15",
        description: "Văn, Toán, Địa - Khối địa lý sư phạm",
        subjectCodes: ["VAN", "TOAN", "DIA"]
      }
    ];

    // Create sectors with subject references
    const sectorsToInsert = sectorData.map(sector => {
      const subjectIds = sector.subjectCodes.map(code => {
        if (!subjectMap[code]) {
          throw new Error(`Subject with code ${code} not found`);
        }
        return subjectMap[code];
      });

      return {
        name: sector.name,
        code: sector.code,
        description: sector.description,
        subjects: subjectIds,
        isActive: true
      };
    });

    // Insert sectors
    const insertedSectors = await Sector.insertMany(sectorsToInsert);
    console.log(`✅ Inserted ${insertedSectors.length} sectors successfully`);

    // Display results
    console.log('\n📚 Sectors created:');
    for (const sector of insertedSectors) {
      const populatedSector = await Sector.findById(sector._id).populate('subjects', 'name code');
      const subjectNames = (populatedSector?.subjects as any[])?.map(s => s.name).join(', ');
      console.log(`   ${sector.code}: ${sector.name}`);
      console.log(`      Subjects: ${subjectNames}`);
    }

    console.log('\n🎉 Sector seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding sectors:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database connection closed');
  }
}

// Run the seeding function
if (require.main === module) {
  seedSectors();
}

export default seedSectors;
