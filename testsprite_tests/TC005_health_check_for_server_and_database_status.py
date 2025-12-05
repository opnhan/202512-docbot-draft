import requests

BASE_URL = "http://localhost:3001"
TIMEOUT = 30

def test_health_check_server_and_database_status():
    url = f"{BASE_URL}/health"
    headers = {
        "Accept": "application/json"
    }
    try:
        response = requests.get(url, headers=headers, timeout=TIMEOUT)
        response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Request to /health endpoint failed: {e}"

    try:
        json_data = response.json()
    except ValueError:
        assert False, "Response from /health is not valid JSON"

    # Validate that required fields are present
    required_fields = ["status", "database", "totalRecords"]
    for field in required_fields:
        assert field in json_data, f"Field '{field}' missing in response JSON"

    # Validate types
    assert isinstance(json_data["status"], str), "Field 'status' should be a string"
    assert isinstance(json_data["database"], str), "Field 'database' should be a string"
    assert isinstance(json_data["totalRecords"], int), "Field 'totalRecords' should be an integer"

    # Optional: Validate the values of status and database are non-empty
    assert json_data["status"], "Field 'status' should be non-empty"
    assert json_data["database"], "Field 'database' should be non-empty"
    assert json_data["totalRecords"] >= 0, "Field 'totalRecords' should be zero or a positive integer"

test_health_check_server_and_database_status()