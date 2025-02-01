import { config } from 'dotenv';
import { resolve } from 'path';
import * as fs from 'fs';

async function testBasiqKey() {
  console.log('Starting Basiq API key test...\n');
  
  try {
    // Get the absolute path to .env.local
    const envPath = resolve(process.cwd(), '.env.local');
    console.log('Looking for .env.local at:', envPath);
    
    // Check if file exists
    if (!fs.existsSync(envPath)) {
      throw new Error('.env.local file not found at: ' + envPath);
    }
    console.log('✓ Found .env.local file');
    
    // Read the file contents directly
    const envContents = fs.readFileSync(envPath, 'utf8');
    const lines = envContents.split('\n').filter(line => line.trim() !== '');
    console.log('\nFound', lines.length, 'non-empty lines in .env.local');
    
    // Look for BASIQ_API_KEY without exposing it
    const basiqKeyLine = lines.find(line => line.startsWith('BASIQ_API_KEY='));
    if (!basiqKeyLine) {
      throw new Error('BASIQ_API_KEY not found in .env.local');
    }
    console.log('✓ Found BASIQ_API_KEY line in file');
    
    // Try to load environment variables
    console.log('\nLoading environment variables...');
    const result = config({ path: envPath });
    
    // Check environment variables
    console.log('\nChecking environment variables:');
    if (!process.env.BASIQ_API_KEY) {
      throw new Error('BASIQ_API_KEY not set in process.env after loading');
    }
    console.log('✓ BASIQ_API_KEY is set in process.env');
    
    // Verify the key format
    const key = process.env.BASIQ_API_KEY;
    console.log('Key length:', key.length);
    console.log('Key format validation:');
    console.log('- Contains "=": ', key.includes('=') ? '✓' : '❌');
    console.log('- Is Base64: ', /^[A-Za-z0-9+/=]+$/.test(key) ? '✓' : '❌');
    console.log('- Length > 50: ', key.length > 50 ? '✓' : '❌');
    
    // Test making a request to Basiq API
    console.log('\nTesting Basiq API connection...');
    const response = await fetch('https://au-api.basiq.io/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${key}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'basiq-version': '3.0',
        'Accept': 'application/json'
      },
      body: 'scope=SERVER_ACCESS'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Basiq API test failed: ${JSON.stringify(error)}`);
    }
    
    console.log('✓ Successfully connected to Basiq API');
    console.log('\n✨ All tests passed!');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    process.exit(1);
  }
}

testBasiqKey(); 