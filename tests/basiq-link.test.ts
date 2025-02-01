import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
const envPath = resolve(process.cwd(), '.env.local');
console.log('Loading environment variables from:', envPath);
const result = config({ path: envPath });

console.log('Environment loading result:', result);
console.log('Current working directory:', process.cwd());

if (!process.env.BASIQ_API_KEY) {
  console.error('❌ BASIQ_API_KEY is not set in .env.local');
  process.exit(1);
}

console.log('BASIQ_API_KEY length:', process.env.BASIQ_API_KEY.length);
console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL);

async function testBasiqLink() {
  console.log('\nTesting Basiq auth link creation...');
  
  try {
    // First, test the token endpoint directly
    console.log('\n1. Testing token endpoint...');
    const tokenHeaders = {
      'Authorization': `Basic ${process.env.BASIQ_API_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'basiq-version': '3.0',
      'Accept': 'application/json'
    };
    
    console.log('Token request headers:', {
      ...tokenHeaders,
      'Authorization': 'Basic [REDACTED]'
    });
    
    const tokenResponse = await fetch('https://au-api.basiq.io/token', {
      method: 'POST',
      headers: tokenHeaders,
      body: 'scope=SERVER_ACCESS'
    });

    console.log('Token response status:', tokenResponse.status);
    console.log('Token response headers:', Object.fromEntries(tokenResponse.headers.entries()));

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      console.error('Token error response:', error);
      throw new Error(`Token request failed: ${JSON.stringify(error)}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('✓ Successfully obtained access token');
    console.log('Token type:', tokenData.token_type);
    console.log('Expires in:', tokenData.expires_in);
    
    // Create a test user
    console.log('\n2. Creating test user...');
    const headers = {
      'Authorization': `Bearer ${tokenData.access_token}`,
      'Content-Type': 'application/json',
      'basiq-version': '3.0',
      'Accept': 'application/json'
    };

    console.log('User creation headers:', {
      ...headers,
      'Authorization': 'Bearer [REDACTED]'
    });

    const createUserResponse = await fetch('https://au-api.basiq.io/users', {
      method: 'POST',
      headers,
      body: JSON.stringify({ email: 'test@example.com' })
    });

    console.log('Create user response status:', createUserResponse.status);
    console.log('Create user response headers:', Object.fromEntries(createUserResponse.headers.entries()));

    if (!createUserResponse.ok) {
      const error = await createUserResponse.json();
      console.error('Create user error:', error);
      throw new Error(`Create user failed: ${JSON.stringify(error)}`);
    }

    const userData = await createUserResponse.json();
    console.log('✓ Successfully created user:', userData.id);

    // Create auth link
    console.log('\n3. Creating auth link...');
    const authLinkPayload = {
      institution: {
        id: 'AU00201'
      },
      mobile: false,
      callback: 'http://localhost:3000/bank-accounts/callback'
    };
    
    console.log('Auth link payload:', JSON.stringify(authLinkPayload, null, 2));
    console.log('Auth link headers:', {
      ...headers,
      'Authorization': 'Bearer [REDACTED]'
    });
    
    const createLinkResponse = await fetch(`https://au-api.basiq.io/users/${userData.id}/auth_links`, {
      method: 'POST',
      headers,
      body: JSON.stringify(authLinkPayload)
    });

    console.log('Create link response status:', createLinkResponse.status);
    console.log('Create link response headers:', Object.fromEntries(createLinkResponse.headers.entries()));

    const responseText = await createLinkResponse.text();
    console.log('Raw response:', responseText);

    if (!createLinkResponse.ok) {
      let error;
      try {
        error = JSON.parse(responseText);
      } catch {
        error = { message: responseText };
      }
      console.error('Create link error:', error);
      throw new Error(`Create auth link failed: ${JSON.stringify(error)}`);
    }

    const linkData = JSON.parse(responseText);
    console.log('✓ Successfully created auth link:', linkData.url);
    
    console.log('\n✨ All tests passed!');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    process.exit(1);
  }
}

testBasiqLink(); 