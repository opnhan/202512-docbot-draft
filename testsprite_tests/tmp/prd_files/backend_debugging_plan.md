# DocBot Backend Debugging Plan

This document outlines the key areas and strategies for debugging the DocBot backend.

## 1. Database Integrity & Connection
- **Objective**: Ensure the SQLite database is correctly initialized and accessible.
- **Checkpoints**:
    - [ ] Verify `data/hospitals.db` exists.
    - [ ] Check file permissions (read/write).
    - [ ] Validate connection logic in `server/index.js` (lines 18-28).
    - [ ] Confirm `better-sqlite3` is correctly installed and compatible with the Node.js version.

## 2. Data Ingestion (CSV to SQLite)
- **Objective**: Validate that data from the CSV file is correctly parsed and stored in the database.
- **Checkpoints**:
    - [ ] **CSV Parsing**: Verify `Papa.parse` configuration in `server/convert-csv-to-sqlite.js`.
    - [ ] **Data Mapping**: Check if CSV headers match the keys used in `insert.run` (lines 101-123).
    - [ ] **Data Types**: Ensure numeric fields (revenue, ratios) are correctly parsed as numbers (`parseFloat`, `parseInt`) and dates are formatted correctly.
    - [ ] **Null Handling**: Verify how missing values are handled (defaults to 0 or null).
    - [ ] **Row Count**: Compare the number of rows in the CSV vs. the database.

## 3. API Endpoints Verification
- **Objective**: Ensure all API endpoints return correct data and handle errors gracefully.
- **Endpoints**:
    - **`GET /api/hospitals/revenue`**
        - [ ] Test filtering by `region`, `category`, `yearMonth`, `hospitalName`.
        - [ ] Verify pagination/limit logic.
        - [ ] Check SQL query generation in `buildWhereClause`.
    - **`GET /api/hospitals/stats`**
        - [ ] Verify aggregation logic (SUM, AVG, COUNT).
        - [ ] Check if filters are correctly applied to the aggregation.
    - **`GET /api/hospitals/stats/monthly`**
        - [ ] Verify grouping by `year_month`.
        - [ ] Check sorting order.
    - **`GET /api/hospitals/trend`**
        - [ ] Test with valid and invalid `code`.
        - [ ] Verify the limit parameter.

## 4. SQL Query Logic
- **Objective**: Prevent SQL injection and ensure correct query logic.
- **Checkpoints**:
    - [ ] **Parameter Binding**: Confirm all user inputs are bound using `@param` syntax (prevent SQL injection).
    - [ ] **Dynamic Clauses**: Check logic for dynamically building `WHERE` clauses in `buildWhereClause`.
    - [ ] **Indexes**: Verify that indexes created in `convert-csv-to-sqlite.js` are used effectively by the queries.

## 5. Error Handling & Logging
- **Objective**: Ensure errors are caught and logged meaningfully.
- **Checkpoints**:
    - [ ] Verify `try-catch` blocks in all route handlers.
    - [ ] Check console output for error details.
    - [ ] Ensure API returns appropriate HTTP status codes (500 for server errors, 400 for bad requests).

## 6. CORS & Network
- **Objective**: Ensure the frontend can communicate with the backend.
- **Checkpoints**:
    - [ ] Verify `cors` middleware configuration.
    - [ ] Check if `PORT` (3001) matches the frontend's API base URL.

## Recommended Debugging Tools
- **Postman / curl**: For testing API endpoints independently.
- **DB Browser for SQLite**: For inspecting the database file directly.
- **Node.js Debugger**: For stepping through the server code.
