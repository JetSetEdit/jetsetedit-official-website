import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
const envPath = resolve(process.cwd(), '.env.local');
console.log('Loading environment variables from:', envPath);
const result = config({ path: envPath });

if (result.error) {
  console.error('Failed to load .env.local file:', result.error);
  process.exit(1);
}

// Verify environment variables
console.log('Environment variables loaded:', {
  BASIQ_API_KEY: process.env.BASIQ_API_KEY ? '✓ Set' : '❌ Not set',
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ? '✓ Set' : '❌ Not set'
});

if (!process.env.BASIQ_API_KEY) {
  console.error('❌ BASIQ_API_KEY is not set in .env.local');
  process.exit(1);
}

// Import after environment variables are loaded
import { BasiqClient } from '@/lib/basiq';

async function testBasiqIntegration() {
  try {
    console.log('\nStarting Basiq API integration test...');
    
    const basiqClient = new BasiqClient();
    console.log('✓ Successfully initialized Basiq client');
    
    // Test getting institutions
    console.log('\nTesting getInstitutions...');
    const institutions = await basiqClient.getInstitutions();
    console.log('✓ Successfully fetched institutions:', institutions.length);
    console.log('First institution:', JSON.stringify(institutions[0], null, 2));

    // Test creating a user
    console.log('\nTesting createUser...');
    const testEmail = 'test@example.com';
    const userId = await basiqClient.createUser(testEmail);
    console.log('✓ Successfully created user:', userId);

    // Test creating connection URL
    console.log('\nTesting createConnectionUrl...');
    const testInstitutionId = institutions[0].id;
    console.log('Using institution ID:', testInstitutionId);
    const connectionUrl = await basiqClient.createConnectionUrl(userId, testInstitutionId);
    console.log('✓ Successfully created connection URL:', connectionUrl);

    console.log('\nAll tests passed! ✨');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    process.exit(1);
  }
}

testBasiqIntegration(); 