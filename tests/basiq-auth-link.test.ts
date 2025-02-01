import { config } from 'dotenv';
import { resolve } from 'path';
import crypto from 'crypto';

const BASIQ_API_URL = 'https://au-api.basiq.io';

// Load environment variables from .env.local
const envPath = resolve(process.cwd(), '.env.local');
console.log('Loading environment variables from:', envPath);
config({ path: envPath });

if (!process.env.BASIQ_API_KEY) {
  console.error('❌ BASIQ_API_KEY is not set in .env.local');
  process.exit(1);
}

async function getBasiqToken() {
  const response = await fetch(`${BASIQ_API_URL}/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${process.env.BASIQ_API_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'basiq-version': '3.0'
    },
    body: 'scope=SERVER_ACCESS'
  });

  if (!response.ok) {
    throw new Error('Failed to get token');
  }

  return response.json();
}

async function createTestUser(token: string) {
  const response = await fetch(`${BASIQ_API_URL}/users`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'basiq-version': '3.0'
    },
    body: JSON.stringify({ email: 'test@example.com' })
  });

  if (!response.ok) {
    throw new Error('Failed to create user');
  }

  return response.json();
}

async function createAuthLink(token: string, userId: string) {
  const payload = {
    institution: {
      id: 'AU00201'
    },
    mobile: false,
    callback: `${process.env.NEXT_PUBLIC_APP_URL}/bank-accounts/callback`
  };

  // Generate AWS Signature V4 parameters
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);
  const region = 'ap-southeast-2';
  const service = 'execute-api';
  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const signedHeaders = 'content-type;host;x-amz-date';

  // Create canonical request
  const canonicalUri = `/users/${userId}/auth_links`;
  const canonicalQueryString = '';
  const canonicalHeaders = `content-type:application/json\nhost:au-api.basiq.io\nx-amz-date:${amzDate}\n`;
  const payloadHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(payload))
    .digest('hex');

  const canonicalRequest = [
    'POST',
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join('\n');

  // Create string to sign
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    crypto.createHash('sha256').update(canonicalRequest).digest('hex')
  ].join('\n');

  // Calculate signature
  const kDate = crypto
    .createHmac('sha256', `AWS4${token}`)
    .update(dateStamp)
    .digest();
  const kRegion = crypto.createHmac('sha256', kDate).update(region).digest();
  const kService = crypto.createHmac('sha256', kRegion).update(service).digest();
  const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
  const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

  // Create authorization header
  const authorizationHeader = `${algorithm} Credential=${token.slice(0, 20)}.../${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const response = await fetch(`${BASIQ_API_URL}/users/${userId}/auth_links`, {
    method: 'POST',
    headers: {
      'Authorization': authorizationHeader,
      'Content-Type': 'application/json',
      'basiq-version': '3.0',
      'X-Amz-Date': amzDate
    },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  console.log('Response status:', response.status);
  console.log('Response headers:', Object.fromEntries(response.headers.entries()));
  console.log('Raw response:', text);
  
  if (!response.ok) {
    let error;
    try {
      error = JSON.parse(text);
      console.log('Parsed error:', error);
      if (error.data?.[0]?.detail) {
        console.log('Error detail:', error.data[0].detail);
      }
    } catch {
      error = { message: text };
    }
    throw new Error(`Failed to create auth link: ${text}`);
  }

  return JSON.parse(text);
}

async function testAuthLinkCreation() {
  try {
    console.log('1. Getting token...');
    const tokenData = await getBasiqToken();
    console.log('✓ Got token');

    console.log('\n2. Creating test user...');
    const userData = await createTestUser(tokenData.access_token);
    console.log('✓ Created user:', userData.id);

    console.log('\n3. Creating auth link...');
    const linkData = await createAuthLink(tokenData.access_token, userData.id);
    console.log('✓ Created auth link:', linkData.url);

    console.log('\n✨ All tests passed!');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

testAuthLinkCreation(); 