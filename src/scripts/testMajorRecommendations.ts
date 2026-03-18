import mongoose from 'mongoose';
import { MajorService } from '../modules/majors/major.service';
import dotenv from 'dotenv';

dotenv.config();

async function testMajorRecommendations() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined");
    }
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    const mbtiType = 'ESFP';
    console.log(`🔍 Testing recommendations for MBTI type: ${mbtiType}\n`);
    
    const recommendations = await MajorService.getMajorsByMBTICompatibility(mbtiType, 5);
    
    console.log(`📊 Found ${recommendations.length} recommendations:\n`);
    
    recommendations.forEach((rec: any, index: number) => {
      console.log(`${index + 1}. ${rec.name} (${rec.code})`);
      console.log(`   Compatibility: ${rec.compatibilityScore}%`);
      console.log(`   Description: ${rec.compatibilityDescription}`);
      console.log(`   Related Careers: ${rec.relatedCareers?.length || 0}`);
      if (rec.relatedCareers && rec.relatedCareers.length > 0) {
        rec.relatedCareers.forEach((career: any) => {
          console.log(`      - ${career.name} (${career.code})`);
        });
      }
      console.log(`   Universities: ${rec.universities?.length || 0}`);
      if (rec.universities && rec.universities.length > 0) {
        rec.universities.forEach((uni: any) => {
          console.log(`      - ${uni.name} (${uni.code})`);
        });
      }
      console.log('');
    });

    console.log('✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

if (require.main === module) {
  testMajorRecommendations();
}

export default testMajorRecommendations;
