import { headers } from 'next/headers';

const BASIQ_API_URL = 'https://au-api.basiq.io';

interface BasiqTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface BasiqError {
  correlationId: string;
  data: Array<{
    code: string;
    title: string;
    detail: string;
    source?: any;
  }>;
}

export interface BasiqInstitution {
  id: string;
  name: string;
  shortName: string;
  institution: string;
  country: string;
  logo: {
    links: {
      square: string;
      full: string;
    };
  };
}

export interface BasiqConnection {
  id: string;
  status: 'active' | 'pending' | 'error';
  institution: BasiqInstitution;
  lastUsed: string;
  createdAt: string;
}

class BasiqClient {
  private apiKey: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    const apiKey = process.env.BASIQ_API_KEY;
    if (!apiKey) {
      throw new Error('BASIQ_API_KEY is not set');
    }
    this.apiKey = apiKey;
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      console.log('Requesting token with API key length:', this.apiKey.length);
      
      const response = await fetch(`${BASIQ_API_URL}/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${this.apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'basiq-version': '3.0'
        },
        body: 'scope=SERVER_ACCESS'
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Token error response:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          error
        });
        throw new Error(`Failed to get Basiq access token: ${error?.data?.[0]?.detail || 'Unknown error'}`);
      }

      const data: BasiqTokenResponse = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000);
      console.log('Successfully obtained access token');
      return this.accessToken;
    } catch (error) {
      console.error('Token request error:', error);
      throw error;
    }
  }

  async createUser(email: string): Promise<string> {
    const token = await this.getAccessToken();
    const response = await fetch(`${BASIQ_API_URL}/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'basiq-version': '3.0'
      },
      body: JSON.stringify({ email })
    });

    if (!response.ok) {
      const error: BasiqError = await response.json();
      throw new Error(error.data[0]?.detail || 'Failed to create Basiq user');
    }

    const data = await response.json();
    return data.id;
  }

  async getInstitutions(): Promise<BasiqInstitution[]> {
    try {
      const token = await this.getAccessToken();
      console.log('Using token:', token); // Debug log

      const response = await fetch(`${BASIQ_API_URL}/institutions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'basiq-version': '3.0'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Institutions error:', error);
        console.error('Response status:', response.status);
        console.error('Response headers:', response.headers);
        throw new Error(`Failed to fetch institutions: ${error?.data?.[0]?.detail || 'Unknown error'}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Institutions request error:', error);
      throw error;
    }
  }

  async createConnectionUrl(userId: string, institutionId: string): Promise<string> {
    try {
      const token = await this.getAccessToken();
      console.log('Creating auth link for user:', userId);
      console.log('Institution ID:', institutionId);
      
      const payload = {
        institution: {
          id: institutionId
        },
        mobile: false,
        callback: `${process.env.NEXT_PUBLIC_APP_URL}/bank-accounts/callback`
      };
      
      console.log('Request payload:', JSON.stringify(payload, null, 2));
      
      const headers = new Headers();
      headers.set('Authorization', `Bearer ${token}`);
      headers.set('Content-Type', 'application/json');
      headers.set('basiq-version', '3.0');
      headers.set('Accept', 'application/json');
      
      console.log('Request headers:', {
        Authorization: 'Bearer [REDACTED]',
        'Content-Type': headers.get('Content-Type'),
        'basiq-version': headers.get('basiq-version'),
        'Accept': headers.get('Accept')
      });
      
      const response = await fetch(`${BASIQ_API_URL}/users/${userId}/auth_links`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (!response.ok) {
        let error;
        try {
          error = JSON.parse(responseText);
        } catch {
          error = { message: responseText };
        }
        
        console.error('Auth link error response:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          error,
          requestPayload: payload,
          requestHeaders: {
            Authorization: 'Bearer [REDACTED]',
            'Content-Type': headers.get('Content-Type'),
            'basiq-version': headers.get('basiq-version'),
            'Accept': headers.get('Accept')
          }
        });
        throw new Error(error?.data?.[0]?.detail || 'Failed to create auth link');
      }

      const data = JSON.parse(responseText);
      console.log('Successfully created auth link:', data.url);
      return data.url;
    } catch (error) {
      console.error('Auth link request error:', error);
      throw error;
    }
  }

  async getConnections(userId: string): Promise<BasiqConnection[]> {
    const token = await this.getAccessToken();
    const headers = {
      'Authorization': `Bearer ${token}`,
      'basiq-version': '3.0',
      'Accept': 'application/json'
    };

    const response = await fetch(`${BASIQ_API_URL}/users/${userId}/connections`, {
      headers
    });

    if (!response.ok) {
      throw new Error('Failed to fetch connections');
    }

    const data = await response.json();
    return data.data;
  }

  async getTransactions(userId: string, filter?: {
    from?: string;
    to?: string;
    connection?: string;
  }): Promise<any[]> {
    const token = await this.getAccessToken();
    let url = `${BASIQ_API_URL}/users/${userId}/transactions`;
    
    if (filter) {
      const params = new URLSearchParams();
      if (filter.from) params.append('filter.from', filter.from);
      if (filter.to) params.append('filter.to', filter.to);
      if (filter.connection) params.append('filter.connection', filter.connection);
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'basiq-version': '3.0'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }

    const data = await response.json();
    return data.data;
  }
}

// Initialize the client after environment variables are loaded
let _basiqClient: BasiqClient | null = null;

export function getBasiqClient(): BasiqClient {
  if (!_basiqClient) {
    if (!process.env.BASIQ_API_KEY) {
      throw new Error('BASIQ_API_KEY is not set in environment variables');
    }
    _basiqClient = new BasiqClient();
  }
  return _basiqClient;
}

export const basiqClient = getBasiqClient(); 