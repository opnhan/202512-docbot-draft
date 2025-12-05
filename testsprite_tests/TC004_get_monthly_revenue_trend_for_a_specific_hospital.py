import requests

BASE_URL = "http://localhost:3001"
TIMEOUT = 30

def test_get_monthly_revenue_trend_for_hospital():
    # We need a valid hospital code to test.
    # Since no hospital resource creation API is provided, 
    # first we try to get hospital revenue data to extract a valid hospital code.
    try:
        # Step 1: Get a valid hospital code from /api/hospitals/revenue (limit=1)
        resp = requests.get(
            f"{BASE_URL}/api/hospitals/revenue",
            params={"limit": 1},
            timeout=TIMEOUT
        )
        assert resp.status_code == 200, f"Expected 200 but got {resp.status_code}"
        resp_json = resp.json()
        assert resp_json["success"] is True, "API did not succeed in /api/hospitals/revenue"
        data = resp_json.get("data")
        assert isinstance(data, list) and len(data) > 0, "No hospital revenue data found"
        hospital_record = data[0]
        # The hospital code parameter is not defined explicitly, guess it's key "code"
        hospital_code = hospital_record.get("code")
        # If no "code" key found, fallback to another possible identifier e.g. "hospitalCode" or "hospital_id"
        if not hospital_code:
            hospital_code = hospital_record.get("hospitalCode") or hospital_record.get("hospital_id")
        assert hospital_code, "No valid hospital code found in revenue data"

        # Step 2: Test /api/hospitals/trend with the hospital_code and limit parameter
        limit = 5
        resp_trend = requests.get(
            f"{BASE_URL}/api/hospitals/trend",
            params={"code": hospital_code, "limit": limit},
            timeout=TIMEOUT
        )
        assert resp_trend.status_code == 200, f"Expected 200 but got {resp_trend.status_code}"
        trend_json = resp_trend.json()

        # Validate response structure and types
        assert isinstance(trend_json, dict), "Response is not a JSON object"
        assert "success" in trend_json, "'success' field missing in response"
        assert trend_json["success"] is True, "API returned success=False"

        assert "count" in trend_json, "'count' field missing in response"
        assert isinstance(trend_json["count"], int), "'count' is not an integer"

        assert "data" in trend_json, "'data' field missing in response"
        assert isinstance(trend_json["data"], list), "'data' is not a list"

        # Validate count matches length of data (or less or equal)
        assert trend_json["count"] == len(trend_json["data"]), "Count does not match length of data"

        # Check that the count respects the limit parameter (count <= limit)
        assert trend_json["count"] <= limit, "Count exceeds the requested limit"

        # Optional: Validate minimal structure of items in data array assuming each item is a dict
        for item in trend_json["data"]:
            assert isinstance(item, dict), "An item in data array is not an object"
            # Optionally check for expected keys, but no schema details are given for items

    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_get_monthly_revenue_trend_for_hospital()