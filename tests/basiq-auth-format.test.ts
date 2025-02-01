import { config } from 'dotenv';
import { resolve } from 'path';
import crypto from 'crypto';

const BASIQ_API_URL = 'https://au-api.basiq.io';

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

// AWS Signature V4 helper functions
function getAmzDate() {
  const date = new Date();
  const YYYYMMDD = date.toISOString().slice(0, 10).replace(/-/g, '');
  const HHMMSS = date.toISOString().slice(11, 19).replace(/:/g, '');
  return `${YYYYMMDD}T${HHMMSS}Z`;
}

function getDateStamp() {
  return new Date().toISOString().slice(0, 10).replace(/-/g, '');
}

function getSignedHeaders() {
  return 'content-type;host;x-amz-date';
}

function getCredentialScope(dateStamp: string) {
  return `${dateStamp}/ap-southeast-2/execute-api/aws4_request`;
}

async function testBasiqAuthFormat() {
  console.log('\nTesting Basiq auth format...');
  
  try {
    // First, test the token endpoint directly
    console.log('\n1. Testing token endpoint with Basic auth...');
    const tokenHeaders = {
      'Authorization': `Basic ${process.env.BASIQ_API_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'basiq-version': '3.0',
      'Accept': 'application/json'
    };
    
    console.log('Token request headers:', {
      ...tokenHeaders,
      Authorization: 'Basic [REDACTED]'
    });
    
    const tokenResponse = await fetch(`${BASIQ_API_URL}/token`, {
      method: 'POST',
      headers: tokenHeaders,
      body: 'scope=SERVER_ACCESS'
    });

    console.log('Token response status:', tokenResponse.status);
    console.log('Token response headers:', Object.fromEntries(tokenResponse.headers.entries()));

    if (!tokenResponse.ok) {
      throw new Error('Failed to get token');
    }

    const tokenData = await tokenResponse.json();
    console.log('✓ Successfully obtained access token');
    console.log('Token type:', tokenData.token_type);
    console.log('Expires in:', tokenData.expires_in);
    
    // Create a test user
    console.log('\n2. Creating test user with Bearer token...');
    const userHeaders = {
      'Authorization': `Bearer ${tokenData.access_token}`,
      'Content-Type': 'application/json',
      'basiq-version': '3.0',
      'Accept': 'application/json'
    };

    console.log('User creation headers:', {
      ...userHeaders,
      Authorization: 'Bearer [REDACTED]'
    });

    const createUserResponse = await fetch(`${BASIQ_API_URL}/users`, {
      method: 'POST',
      headers: userHeaders,
      body: JSON.stringify({ email: 'test@example.com' })
    });

    console.log('Create user response status:', createUserResponse.status);
    console.log('Create user response headers:', Object.fromEntries(createUserResponse.headers.entries()));

    if (!createUserResponse.ok) {
      throw new Error('Failed to create user');
    }

    const userData = await createUserResponse.json();
    console.log('✓ Successfully created user:', userData.id);

    // Create auth link
    console.log('\n3. Creating auth link with Bearer token...');

    // Get a fresh token for auth link creation
    const authLinkTokenResponse = await fetch(`${BASIQ_API_URL}/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${process.env.BASIQ_API_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'basiq-version': '3.0'
      },
      body: 'scope=SERVER_ACCESS'
    });

    if (!authLinkTokenResponse.ok) {
      throw new Error('Failed to get token for auth link creation');
    }

    const authLinkTokenData = await authLinkTokenResponse.json();
    console.log('Token type from response:', authLinkTokenData.token_type);
    console.log('Token length:', authLinkTokenData.access_token.length);

    const authLinkPayload = {
      institution: {
        id: 'AU00201'
      },
      mobile: false,
      callback: `${process.env.NEXT_PUBLIC_APP_URL}/bank-accounts/callback`
    };

    console.log('Auth link payload:', JSON.stringify(authLinkPayload, null, 2));

    const authLinkHeaders = {
      'Authorization': `Bearer ${authLinkTokenData.access_token}`,
      'Content-Type': 'application/json',
      'basiq-version': '3.0',
      'Accept': 'application/json'
    };

    console.log('Auth link headers:', {
      ...authLinkHeaders,
      Authorization: 'Bearer [REDACTED]'
    });

    const createLinkResponse = await fetch(`${BASIQ_API_URL}/users/${userData.id}/auth_links`, {
      method: 'POST',
      headers: authLinkHeaders,
      body: JSON.stringify(authLinkPayload)
    });

    console.log('Create link response status:', createLinkResponse.status);
    console.log('Create link response headers:', Object.fromEntries(createLinkResponse.headers.entries()));

    const rawResponse = await createLinkResponse.text();
    console.log('Raw response:', rawResponse);

    if (!createLinkResponse.ok) {
      let error;
      try {
        error = JSON.parse(rawResponse);
      } catch {
        error = { message: rawResponse };
      }
      console.log('Create link error:', error);
      throw new Error(`Create auth link failed: ${JSON.stringify(error)}`);
    }

    const linkData = JSON.parse(rawResponse);
    console.log('Successfully created auth link:', linkData.url);
    
    console.log('\n✨ All tests passed!');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    process.exit(1);
  }
}

testBasiqAuthFormat();