import mongoose from 'mongoose';
import { Major, MBTICompatibility } from '../modules/majors/major.model';
import dotenv from 'dotenv';

dotenv.config();

async function testMBTIQuery() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined");
    }
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    const mbtiType = 'ESTP';
    
    // Test 1: Direct query to MBTICompatibility
    console.log(`🔍 Test 1: Direct query for ${mbtiType} in mbti_compatibility collection`);
    const compatibilities = await MBTICompatibility.find({ 
      mbtiType: mbtiType,
      isActive: true 
    }).populate('majorId');
    
    console.log(`   Found ${compatibilities.length} compatibility records:`);
    compatibilities.forEach(c => {
      console.log(`   - ${(c.majorId as any)?.name || 'Unknown'}: ${c.compatibilityScore}%`);
    });
    console.log('');

    // Test 2: Using the static method
    console.log(`🔍 Test 2: Using Major.getMajorsByMBTICompatibility('${mbtiType}')`);
    const majors = await (Major as any).getMajorsByMBTICompatibility(mbtiType, 10);
    
    console.log(`   Found ${majors.length} majors:`);
    majors.forEach((m: any) => {
      console.log(`   - ${m.name} (${m.code}): ${m.compatibilityScore}%`);
      console.log(`     ${m.compatibilityDescription}`);
    });
    console.log('');

    // Test 3: Check collection name
    console.log('🔍 Test 3: Checking collection names');
    const collections = await mongoose.connection.db.listCollections().toArray();
    const mbtiCollections = collections.filter(c => 
      c.name.toLowerCase().includes('mbti') || c.name.toLowerCase().includes('compatibility')
    );
    console.log('   MBTI-related collections:');
    mbtiCollections.forEach(c => {
      console.log(`   - ${c.name}`);
    });
    console.log('');

    // Test 4: Count documents
    console.log('🔍 Test 4: Document counts');
    const totalCompatibility = await MBTICompatibility.countDocuments({});
    const activeCompatibility = await MBTICompatibility.countDocuments({ isActive: true });
    const estpCompatibility = await MBTICompatibility.countDocuments({ 
      mbtiType: 'ESTP',
      isActive: true 
    });
    
    console.log(`   Total compatibility records: ${totalCompatibility}`);
    console.log(`   Active compatibility records: ${activeCompatibility}`);
    console.log(`   ESTP compatibility records: ${estpCompatibility}`);
    console.log('');

    // Test 5: Sample ESTP records
    console.log('🔍 Test 5: Sample ESTP records (raw)');
    const estpRecords = await mongoose.connection.collection('mbti_compatibility')
      .find({ mbtiType: 'ESTP' })
      .limit(5)
      .toArray();
    
    console.log(`   Found ${estpRecords.length} raw records:`);
    estpRecords.forEach((r: any) => {
      console.log(`   - majorId: ${r.majorId}, score: ${r.compatibilityScore}, active: ${r.isActive}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

if (require.main === module) {
  testMBTIQuery();
}

export default testMBTIQuery;
