import mongoose from 'mongoose';
import dotenv from 'dotenv';
import seedSubjects from './seedSubjects';
import seedSectors from './seedSectors';
import seedMajors from './seedMajors';
import { seedMBTIData } from './seedMBTI';
import seedCareers from './seedCareers';
import seedUniversities from './seedUniversities';
import seedArticles from './seedArticles';

dotenv.config();

/**
 * Master seed script to populate all collections in the correct order
 * 
 * Order is important:
 * 1. Subjects (independent)
 * 2. Sectors (depends on Subjects)
 * 3. Majors (independent, but creates MBTICompatibility)
 * 4. MBTI (creates MBTICompatibility linking to Majors)
 * 5. Careers (can reference Majors)
 * 6. Universities (references Majors)
 * 7. Articles (independent)
 */
async function seedAll() {
  const startTime = Date.now();
  
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         FU-Mate Database Seeding - Master Script          ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Step 1: Seed Subjects
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📚 Step 1/7: Seeding Subjects...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    await seedSubjects();
    console.log('');

    // Step 2: Seed Sectors
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 Step 2/7: Seeding Sectors...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    await seedSectors();
    console.log('');

    // Step 3: Seed Majors
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎓 Step 3/7: Seeding Majors...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    await seedMajors();
    console.log('');

    // Step 4: Seed MBTI
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🧠 Step 4/7: Seeding MBTI Data...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    await seedMBTIData();
    console.log('');

    // Step 5: Seed Careers
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💼 Step 5/7: Seeding Careers...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    await seedCareers();
    console.log('');

    // Step 6: Seed Universities
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🏫 Step 6/7: Seeding Universities...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    await seedUniversities();
    console.log('');

    // Step 7: Seed Articles
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📰 Step 7/7: Seeding Articles...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    await seedArticles();
    console.log('');

    // Summary
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    Seeding Summary                         ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`⏱️  Total time: ${duration}s`);
    console.log('✅ All collections seeded successfully!');
    console.log('\n📊 Collections populated:');
    console.log('   ✓ Subjects');
    console.log('   ✓ Sectors');
    console.log('   ✓ Majors');
    console.log('   ✓ MBTI Compatibility');
    console.log('   ✓ MBTI Questions');
    console.log('   ✓ MBTI Types');
    console.log('   ✓ Careers');
    console.log('   ✓ Universities');
    console.log('   ✓ Admission Scores');
    console.log('   ✓ Articles');
    console.log('\n🎉 Database is ready for use!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ Error during seeding process:', error);
    console.error('\n⚠️  Seeding failed. Please check the error above and try again.');
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the master seeding function
if (require.main === module) {
  seedAll()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export default seedAll;
