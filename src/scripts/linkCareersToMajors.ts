import mongoose from 'mongoose';
import Career from '../modules/careers/career.model';
import { Major } from '../modules/majors/major.model';
import dotenv from 'dotenv';

dotenv.config();

// Mapping careers to majors based on relevance
const careerMajorMapping: Record<string, string[]> = {
  'SW_DEV': ['CS', 'IT', 'SE'],  // Software Developer -> Computer Science, IT, Software Engineering
  'GP_DOC': ['MED', 'NURS'],  // Doctor -> Medicine, Nursing
  'ACCOUNTANT': ['ACC', 'FIN', 'BUS'],  // Accountant -> Accounting, Finance, Business
  'HS_TEACHER': ['ENG', 'MATH', 'PHYS', 'CHEM', 'BIO', 'HIST', 'PSYC'],  // Teacher -> Various subjects
  'MKT_MGR': ['BUS', 'MKT', 'COMM'],  // Marketing Manager -> Business, Marketing, Communications
  'CIVIL_ENG': ['CIVIL', 'ARCH'],  // Civil Engineer -> Civil Engineering, Architecture
  'GFX_DESIGNER': ['ART', 'DES', 'COMM'],  // Graphic Designer -> Art, Design, Communications
  'DATA_ANALYST': ['CS', 'STAT', 'BUS', 'ECON'],  // Data Analyst -> CS, Statistics, Business, Economics
  'LAWYER': ['LAW'],  // Lawyer -> Law
  'JOURNALIST': ['JOUR', 'COMM', 'ENG']  // Journalist -> Journalism, Communications, English
};

async function linkCareersToMajors() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined");
    }
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Get all majors
    const majors = await Major.find({});
    console.log(`Found ${majors.length} majors in database\n`);

    // Create a map of major codes to IDs
    const majorCodeToId = new Map<string, mongoose.Types.ObjectId>();
    majors.forEach(major => {
      majorCodeToId.set(major.code, major._id);
    });

    // Get all careers
    const careers = await Career.find({});
    console.log(`Found ${careers.length} careers to update\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    // Update each career with related majors
    for (const career of careers) {
      const majorCodes = careerMajorMapping[career.code] || [];
      const relatedMajorIds: mongoose.Types.ObjectId[] = [];

      for (const code of majorCodes) {
        const majorId = majorCodeToId.get(code);
        if (majorId) {
          relatedMajorIds.push(majorId);
        }
      }

      if (relatedMajorIds.length > 0) {
        await Career.findByIdAndUpdate(career._id, {
          relatedMajors: relatedMajorIds
        });
        console.log(`✅ ${career.name} (${career.code}): Linked to ${relatedMajorIds.length} majors`);
        updatedCount++;
      } else {
        console.log(`⚠️  ${career.name} (${career.code}): No matching majors found`);
        skippedCount++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Updated: ${updatedCount} careers`);
    console.log(`   Skipped: ${skippedCount} careers`);
    console.log(`\n✅ Career-Major linking completed!`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

if (require.main === module) {
  linkCareersToMajors();
}

export default linkCareersToMajors;
