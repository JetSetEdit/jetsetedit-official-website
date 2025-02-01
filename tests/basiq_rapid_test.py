import os
import base64
from dotenv import load_dotenv
import requests
import json
import hashlib

# Load environment variables
load_dotenv('.env.local')

# Get API key from environment
api_key = os.getenv('BASIQ_API_KEY')
if not api_key:
    raise ValueError("BASIQ_API_KEY not found in environment variables")

print(f"Using API key: {api_key[:8]}...{api_key[-4:]} (length: {len(api_key)})")

# Get token using Basic auth
auth_headers = {
    'Authorization': f'Basic {api_key}',
    'Content-Type': 'application/x-www-form-urlencoded',
    'basiq-version': '2.0'
}

try:
    print("\nGetting token...")
    token_response = requests.post(
        'https://au-api.basiq.io/token',
        headers=auth_headers,
        data={'scope': 'SERVER_ACCESS'},
        timeout=10
    )

    print(f"Token response status: {token_response.status_code}")
    print(f"Token response headers: {json.dumps(dict(token_response.headers), indent=2)}")
    
    if token_response.status_code == 200:
        token_data = token_response.json()
        print(f"Token response body: {json.dumps(token_data, indent=2)}")
        access_token = token_data.get('access_token')
        token_type = token_data.get('token_type')

        # Try to create a user
        user_headers = {
            'Authorization': f'{token_type} {access_token}',
            'Content-Type': 'application/json',
            'basiq-version': '2.0'
        }

        user_data = {
            'email': 'test@example.com',
            'mobile': '+61410888666',
            'firstName': 'John',
            'lastName': 'Doe'
        }

        print("\nCreating user...")
        user_response = requests.post(
            'https://au-api.basiq.io/users',
            headers=user_headers,
            json=user_data,
            timeout=10
        )

        print(f"User response status: {user_response.status_code}")
        print(f"User response headers: {json.dumps(dict(user_response.headers), indent=2)}")
        
        if user_response.status_code == 201:
            user_data = user_response.json()
            print(f"User response body: {json.dumps(user_data, indent=2)}")

            # Create auth link with special authorization
            auth_key_value = f"token={access_token}"
            auth_hash = hashlib.sha256(auth_key_value.encode()).digest()
            auth_hash_b64 = base64.b64encode(auth_hash).decode()

            auth_link_headers = {
                'Authorization': f'SHA256 {auth_key_value} {auth_hash_b64}',
                'Content-Type': 'application/json',
                'basiq-version': '2.0'
            }

            auth_link_data = {
                'userId': user_data['id'],
                'mobile': user_data['mobile'],
                'email': user_data['email']
            }

            print("\nCreating auth link...")
            print(f"Using Authorization: SHA256 token=****** {auth_hash_b64}")
            auth_link_response = requests.post(
                'https://au-api.basiq.io/auth_link',
                headers=auth_link_headers,
                json=auth_link_data,
                timeout=10
            )

            print(f"Auth link response status: {auth_link_response.status_code}")
            print(f"Auth link response headers: {json.dumps(dict(auth_link_response.headers), indent=2)}")
            
            if auth_link_response.status_code in [200, 201]:
                auth_link_data = auth_link_response.json()
                print(f"Auth link response body: {json.dumps(auth_link_data, indent=2)}")
            else:
                print(f"Error response: {auth_link_response.text}")
        else:
            print(f"Error response: {user_response.text}")
    else:
        print(f"Error response: {token_response.text}")
except requests.exceptions.RequestException as e:
    print(f"Request error: {str(e)}")
except Exception as e:
    print(f"Unexpected error: {str(e)}")