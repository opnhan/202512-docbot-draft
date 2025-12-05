import requests

BASE_URL = "http://localhost:3001"
TIMEOUT = 30

def test_get_monthly_aggregated_statistics_for_trend_analysis():
    url = f"{BASE_URL}/api/hospitals/stats/monthly"
    params = {
        "region": "North",
        "category": "General"
    }
    try:
        response = requests.get(url, params=params, timeout=TIMEOUT)
        response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    data = response.json()

    # Validate required fields present
    assert "success" in data, "'success' field missing in response"
    assert "count" in data, "'count' field missing in response"
    assert "data" in data, "'data' field missing in response"

    # Validate success is True
    assert isinstance(data["success"], bool), "'success' should be boolean"
    assert data["success"] is True, "API response success is False"

    # Validate count is integer and matches length of data array
    assert isinstance(data["count"], int), "'count' should be integer"
    assert isinstance(data["data"], list), "'data' should be a list"
    assert data["count"] == len(data["data"]), "'count' does not match length of data list"

    # Validate that 'data' list is ordered by month ascending
    # Expect each item to have a 'month' field in string format (e.g. "2023-06")
    months = []
    for item in data["data"]:
        assert isinstance(item, dict), "each data item should be a dictionary"
        month = item.get("month")
        assert month is not None, "each data item must have a 'month' field"
        assert isinstance(month, str), "'month' field should be a string"
        months.append(month)

    # Check months list is sorted ascending
    assert months == sorted(months), "data is not ordered by month ascending"

test_get_monthly_aggregated_statistics_for_trend_analysis()