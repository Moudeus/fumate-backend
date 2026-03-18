import mongoose from 'mongoose';
import { Major, MBTICompatibility } from '../modules/majors/major.model';
import dotenv from 'dotenv';

dotenv.config();

async function checkMajorData() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined");
    }
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Check majors
    const majors = await Major.find({ isActive: true });
    console.log(`📚 Total Majors: ${majors.length}`);
    if (majors.length > 0) {
      console.log('\nMajors in database:');
      majors.forEach((major, index) => {
        console.log(`${index + 1}. ${major.name} (${major.code})`);
      });
    } else {
      console.log('⚠️  No majors found in database. Please run seed script.');
    }

    // Check MBTI compatibility
    const compatibilities = await MBTICompatibility.find({ isActive: true });
    console.log(`\n🧠 Total MBTI Compatibility Records: ${compatibilities.length}`);
    
    if (compatibilities.length > 0) {
      // Group by MBTI type
      const byMBTI = compatibilities.reduce((acc, comp) => {
        if (!acc[comp.mbtiType]) acc[comp.mbtiType] = 0;
        acc[comp.mbtiType]++;
        return acc;
      }, {} as Record<string, number>);

      console.log('\nCompatibility records by MBTI type:');
      Object.entries(byMBTI).sort().forEach(([type, count]) => {
        console.log(`  ${type}: ${count} majors`);
      });

      // Test query for ISFP
      console.log('\n🔍 Testing query for MBTI type: ISFP');
      const isfpResults = await Major.aggregate([
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
            'compatibility.mbtiType': 'ISFP',
            'compatibility.isActive': true,
            'isActive': true
          }
        },
        {
          $sort: { 'compatibility.compatibilityScore': -1 }
        },
        {
          $project: {
            code: 1,
            name: 1,
            compatibilityScore: '$compatibility.compatibilityScore'
          }
        }
      ]);

      if (isfpResults.length > 0) {
        console.log(`Found ${isfpResults.length} recommendations for ISFP:`);
        isfpResults.forEach((result, index) => {
          console.log(`  ${index + 1}. ${result.name} (${result.code}) - Score: ${result.compatibilityScore}%`);
        });
      } else {
        console.log('⚠️  No recommendations found for ISFP');
      }
    } else {
      console.log('⚠️  No MBTI compatibility records found. Please run seed script.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

if (require.main === module) {
  checkMajorData();
}

export default checkMajorData;
