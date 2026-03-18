import mongoose from 'mongoose';
import { MBTIType } from '../modules/mbti/mbti.model';
import { Major, MBTICompatibility } from '../modules/majors/major.model';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Migration script to convert old MBTI-Major relationship to new structure
 * Old: MBTIType.majors[] and Major.mbtiCompatibility[]
 * New: MBTICompatibility junction table only
 */
async function migrateMBTIRelationship() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    console.log('\n=== Starting MBTI Relationship Migration ===\n');

    // Step 1: Get all MBTI types with old majors array
    const mbtiTypes = await MBTIType.find({}).lean();
    console.log(`Found ${mbtiTypes.length} MBTI types`);

    let migratedCount = 0;
    let skippedCount = 0;

    // Step 2: For each MBTI type, create MBTICompatibility records if they don't exist
    for (const mbtiType of mbtiTypes) {
      const majorsArray = (mbtiType as any).majors || [];
      
      if (majorsArray.length === 0) {
        console.log(`  ${mbtiType.type}: No majors to migrate`);
        continue;
      }

      console.log(`  ${mbtiType.type}: Migrating ${majorsArray.length} majors...`);

      for (let i = 0; i < majorsArray.length; i++) {
        const majorId = majorsArray[i];
        
        // Check if compatibility record already exists
        const existingCompatibility = await MBTICompatibility.findOne({
          majorId: majorId,
          mbtiType: mbtiType.type
        });

        if (existingCompatibility) {
          console.log(`    - Major ${majorId}: Already exists, skipping`);
          skippedCount++;
          continue;
        }

        // Create new compatibility record
        const compatibilityScore = 90 - (i * 5); // First major = 90, second = 85, etc.
        
        await MBTICompatibility.create({
          majorId: majorId,
          mbtiType: mbtiType.type,
          compatibilityScore,
          description: `${mbtiType.name} có khả năng phù hợp với ngành này`,
          strengths: mbtiType.strengths.slice(0, 2),
          challenges: mbtiType.weaknesses.slice(0, 2),
          careerExamples: [],
          isActive: true
        });

        console.log(`    - Major ${majorId}: Created compatibility record (score: ${compatibilityScore})`);
        migratedCount++;
      }
    }

    console.log(`\n=== Migration Summary ===`);
    console.log(`Total MBTI types processed: ${mbtiTypes.length}`);
    console.log(`New compatibility records created: ${migratedCount}`);
    console.log(`Existing records skipped: ${skippedCount}`);

    // Step 3: Clean up old fields (optional - uncomment if you want to remove old data)
    console.log('\n=== Cleaning up old fields ===');
    
    // Remove majors field from MBTIType collection
    const mbtiUpdateResult = await mongoose.connection.collection('mbti_types').updateMany(
      {},
      { $unset: { majors: "" } }
    );
    console.log(`Removed 'majors' field from ${mbtiUpdateResult.modifiedCount} MBTI type documents`);

    // Remove mbtiCompatibility field from Major collection
    const majorUpdateResult = await mongoose.connection.collection('majors').updateMany(
      {},
      { $unset: { mbtiCompatibility: "" } }
    );
    console.log(`Removed 'mbtiCompatibility' field from ${majorUpdateResult.modifiedCount} major documents`);

    // Remove majors field from MBTITestResult collection
    const testResultUpdateResult = await mongoose.connection.collection('mbti_results').updateMany(
      {},
      { $unset: { majors: "" } }
    );
    console.log(`Removed 'majors' field from ${testResultUpdateResult.modifiedCount} test result documents`);

    console.log('\n=== Migration Completed Successfully! ===\n');

  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
if (require.main === module) {
  migrateMBTIRelationship()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export { migrateMBTIRelationship };
