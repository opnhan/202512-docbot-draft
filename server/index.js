import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const dbPath = path.join(__dirname, '../data/hospitals.db');
let db;

try {
    db = new Database(dbPath, { readonly: true });
    console.log('Connected to SQLite database');
} catch (err) {
    console.error('Database connection error:', err.message);
    console.log('Please run: node server/convert-csv-to-sqlite.js first');
    process.exit(1);
}

// Helper function to build WHERE clause
function buildWhereClause(filters) {
    const conditions = [];
    const params = {};

    if (filters.region) {
        conditions.push('address LIKE @region');
        params.region = `%${filters.region}%`;
    }

    if (filters.category) {
        conditions.push('category = @category');
        params.category = filters.category;
    }

    if (filters.yearMonth) {
        conditions.push('year_month = @yearMonth');
        params.yearMonth = filters.yearMonth;
    }

    if (filters.hospitalName) {
        conditions.push('hospital_name LIKE @hospitalName');
        params.hospitalName = `%${filters.hospitalName}%`;
    }

    return { conditions, params };
}

// API: Get hospital revenue data
app.get('/api/hospitals/revenue', (req, res) => {
    try {
        const { region, category, yearMonth, hospitalName, limit = 100 } = req.query;

        const { conditions, params } = buildWhereClause({
            region,
            category,
            yearMonth,
            hospitalName
        });

        let query = 'SELECT * FROM hospital_revenue';

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY year_month DESC, revenue DESC';
        query += ` LIMIT ${parseInt(limit)}`;

        const stmt = db.prepare(query);
        const results = stmt.all(params);

        res.json({
            success: true,
            count: results.length,
            data: results
        });
    } catch (error) {
        console.error('Query error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// API: Get aggregated revenue statistics
app.get('/api/hospitals/stats', (req, res) => {
    try {
        const { region, category, yearMonth } = req.query;

        const { conditions, params } = buildWhereClause({
            region,
            category,
            yearMonth
        });

        let query = `
            SELECT 
                COUNT(DISTINCT code) as hospital_count,
                SUM(revenue) as total_revenue,
                AVG(revenue) as avg_revenue,
                MAX(revenue) as max_revenue,
                MIN(revenue) as min_revenue,
                SUM(transaction_count) as total_transactions,
                AVG(weekday_ratio) as avg_weekday_ratio,
                AVG(weekend_ratio) as avg_weekend_ratio
            FROM hospital_revenue
        `;

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        const stmt = db.prepare(query);
        const stats = stmt.get(params);

        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Stats query error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// API: Get monthly aggregated stats for trend analysis
app.get('/api/hospitals/stats/monthly', (req, res) => {
    try {
        const { region, category } = req.query;

        const { conditions, params } = buildWhereClause({
            region,
            category
        });

        let query = `
            SELECT 
                year_month,
                AVG(revenue) as avg_revenue,
                SUM(transaction_count) as total_transactions,
                COUNT(*) as count,
                AVG(monday) as avg_monday,
                AVG(tuesday) as avg_tuesday,
                AVG(wednesday) as avg_wednesday,
                AVG(thursday) as avg_thursday,
                AVG(friday) as avg_friday,
                AVG(saturday) as avg_saturday,
                AVG(sunday) as avg_sunday
            FROM hospital_revenue
        `;

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' GROUP BY year_month ORDER BY year_month ASC';

        const stmt = db.prepare(query);
        const results = stmt.all(params);

        res.json({
            success: true,
            count: results.length,
            data: results
        });
    } catch (error) {
        console.error('Monthly stats query error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// API: Get monthly revenue trend for a hospital
app.get('/api/hospitals/trend', (req, res) => {
    try {
        const { code, limit = 36 } = req.query;

        if (!code) {
            return res.status(400).json({
                success: false,
                error: 'Hospital code is required'
            });
        }

        const query = `
            SELECT 
                year_month,
                revenue,
                transaction_count,
                avg_payment
            FROM hospital_revenue
            WHERE code = @code
            ORDER BY year_month DESC
            LIMIT @limit
        `;

        const stmt = db.prepare(query);
        const results = stmt.all({ code, limit: parseInt(limit) });

        res.json({
            success: true,
            count: results.length,
            data: results.reverse() // Oldest to newest
        });
    } catch (error) {
        console.error('Trend query error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    try {
        const count = db.prepare('SELECT COUNT(*) as count FROM hospital_revenue').get();
        res.json({
            status: 'ok',
            database: 'connected',
            totalRecords: count.count
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Backend API server running on http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/health`);
    console.log(`   Revenue API: http://localhost:${PORT}/api/hospitals/revenue`);
    console.log(`   Stats API: http://localhost:${PORT}/api/hospitals/stats`);
    console.log(`   Trend API: http://localhost:${PORT}/api/hospitals/trend\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nClosing database connection...');
    db.close();
    process.exit(0);
});
