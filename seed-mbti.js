const { execSync } = require('child_process');

console.log('🌱 Starting MBTI data seeding...');

try {
  // Compile and run the TypeScript seeding script
  execSync('npx ts-node src/scripts/seedMBTI.ts', { 
    stdio: 'inherit',
    cwd: __dirname 
  });
  
  console.log('✅ MBTI data seeding completed successfully!');
} catch (error) {
  console.error('❌ Error during seeding:', error.message);
  process.exit(1);
}