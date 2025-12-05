import requests

BASE_URL = "http://localhost:3001"
TIMEOUT = 30

def test_get_aggregated_revenue_stats_with_filters():
    params = {
        "region": "North",
        "category": "General",
        "yearMonth": "202312"
    }
    url = f"{BASE_URL}/api/hospitals/stats"
    try:
        response = requests.get(url, params=params, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"
    
    assert response.status_code == 200, f"Unexpected status code: {response.status_code}"
    try:
        body = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    # Validate response structure
    assert "success" in body, "'success' field missing in response"
    assert isinstance(body["success"], bool), "'success' field is not boolean"
    assert body["success"] is True, "'success' field is not True"

    assert "stats" in body, "'stats' field missing in response"
    assert isinstance(body["stats"], dict), "'stats' field is not an object"

    stats = body["stats"]
    # Basic sanity checks for aggregated keys (sum, average or related)
    # Because schema does not specify structure, check it's not empty
    assert len(stats) > 0, "'stats' object is empty"

    # Example: Check some likely keys if exist
    # Since exact keys unknown, just check numeric values if present
    for key, value in stats.items():
        # If value is a number or nested dict/float etc, allow, else skip
        if isinstance(value, (int, float)):
            assert value >= 0, f"Aggregated stat {key} has negative value"

test_get_aggregated_revenue_stats_with_filters()