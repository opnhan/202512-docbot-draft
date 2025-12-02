-- Enable PostGIS for spatial queries if available (optional but recommended for 'boundary')
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Users Table (Potential integration with existing auth system)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100),
    phone_number VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Regions Table (The bridge between stats and properties)
CREATE TABLE regions (
    region_code VARCHAR(50) PRIMARY KEY, -- e.g., '11680' (Gangnam-gu) or specific commercial zone code
    region_name VARCHAR(100) NOT NULL,
    -- boundary GEOMETRY(POLYGON, 4326), -- Requires PostGIS
    description TEXT
);

-- 3. Commercial Stats Table (Time-series data for revenue)
CREATE TABLE commercial_stats (
    id BIGSERIAL PRIMARY KEY,
    region_code VARCHAR(50) REFERENCES regions(region_code),
    category VARCHAR(50) NOT NULL, -- e.g., 'Internal Medicine', 'Dermatology'
    avg_monthly_revenue DECIMAL(15, 2),
    growth_rate_qhq DECIMAL(5, 2), -- Quarter over Quarter growth %
    floating_population INTEGER,
    reference_date DATE NOT NULL, -- The first day of the month/quarter this data represents
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast lookup by region and category
CREATE INDEX idx_commercial_stats_region_category ON commercial_stats(region_code, category);

-- 4. Properties Table (Maemul)
CREATE TABLE properties (
    id BIGSERIAL PRIMARY KEY,
    region_code VARCHAR(50) REFERENCES regions(region_code),
    title VARCHAR(255) NOT NULL,
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    deposit DECIMAL(15, 2) NOT NULL, -- Won
    monthly_rent DECIMAL(15, 2) NOT NULL, -- Won
    area_pyeong DECIMAL(10, 2) NOT NULL,
    floor INTEGER,
    description TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for geospatial search (if using simple lat/lon box search)
CREATE INDEX idx_properties_lat_lon ON properties(latitude, longitude);

-- 5. Leads/Consultations Table
CREATE TABLE leads (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    property_id BIGINT REFERENCES properties(id),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONTACTED', 'SCHEDULED', 'CLOSED')),
    message TEXT, -- Optional user message
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
