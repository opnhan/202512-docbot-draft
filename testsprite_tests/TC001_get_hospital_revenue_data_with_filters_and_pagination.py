import requests

def test_get_hospital_revenue_with_filters_and_pagination():
    base_url = "http://localhost:3001"
    endpoint = "/api/hospitals/revenue"
    url = base_url + endpoint

    # Define filter parameters for test
    params = {
        "region": "North",
        "category": "General",
        "yearMonth": "202312",
        "hospitalName": "Central Hospital",
        "limit": 5
    }

    try:
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"HTTP Request failed: {e}"

    # Validate response content-type
    content_type = response.headers.get("Content-Type", "")
    assert "application/json" in content_type, f"Unexpected content type: {content_type}"

    json_resp = response.json()
    assert isinstance(json_resp, dict), "Response JSON is not an object"

    # Validate required fields and types
    assert "success" in json_resp, "'success' field missing in response"
    assert isinstance(json_resp["success"], bool), "'success' should be boolean"
    assert json_resp["success"] is True, "API call did not succeed"

    assert "count" in json_resp, "'count' field missing in response"
    assert isinstance(json_resp["count"], int), "'count' should be integer"
    assert json_resp["count"] >= 0, "'count' should be non-negative"

    assert "data" in json_resp, "'data' field missing in response"
    assert isinstance(json_resp["data"], list), "'data' should be a list"

    # Validate that count matches length of data or is consistent
    assert json_resp["count"] == len(json_resp["data"]), "'count' does not match length of 'data'"

    # Validate that the number of returned items does not exceed limit
    assert len(json_resp["data"]) <= params["limit"], "Returned data exceeds requested limit"

    # Optional: Validate that data items contain keys relevant to hospital revenue (not strictly specified)
    if json_resp["data"]:
        data_item = json_resp["data"][0]
        assert isinstance(data_item, dict), "Data item is not an object"
        # Check at least one of the filter keys appears in data item to verify filtering
        filter_keys = ["region", "category", "yearMonth", "hospitalName"]
        matches_filter = any(
            key in data_item and data_item[key] == params.get(key)
            for key in filter_keys
        )
        # It's possible data might not contain exact keys, but we expect at least one match
        assert matches_filter, "Data item does not match filter criteria"

test_get_hospital_revenue_with_filters_and_pagination()