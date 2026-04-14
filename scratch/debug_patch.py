import requests
import sys

BASE_URL = "http://localhost:8000/api/v1/auth/me/"

def test_patch(token):
    headers = {"Authorization": f"Bearer {token}"}
    data = {"first_name": "Test", "last_name": "User"}
    response = requests.patch(BASE_URL, json=data, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python debug_patch.py <access_token>")
    else:
        test_patch(sys.argv[1])
