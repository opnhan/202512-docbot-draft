import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../data/hospitals.db');
const db = new Database(dbPath, { readonly: true });

const report = {
    query_parameters: {
        region: '강남',
        category: '피부과'
    },
    database_info: {},
    monthly_aggregation: [],
    latest_month_details: {},
    calculation_validation: {}
};

// 1. Database overview
report.database_info.total_records = db.prepare('SELECT COUNT(*) as count FROM hospital_revenue').get().count;
report.database_info.gangnam_records = db.prepare(`SELECT COUNT(*) as count FROM hospital_revenue WHERE address LIKE '%강남%'`).get().count;
report.database_info.gangnam_dermatology_records = db.prepare(`
    SELECT COUNT(*) as count FROM hospital_revenue WHERE address LIKE '%강남%' AND category = '피부과'
`).get().count;

// 2. Monthly aggregation (last 6 months)
report.monthly_aggregation = db.prepare(`
    SELECT 
        year_month,
        AVG(revenue) as avg_revenue,
        COUNT(*) as hospital_count,
        SUM(transaction_count) as total_transactions,
        MIN(revenue) as min_revenue,
        MAX(revenue) as max_revenue
    FROM hospital_revenue
    WHERE address LIKE '%강남%' AND category = '피부과'
    GROUP BY year_month
    ORDER BY year_month DESC
    LIMIT 6
`).all();

// Reverse to chronological order
report.monthly_aggregation.reverse();

// 3. Overall stats
const overall = db.prepare(`
    SELECT 
        AVG(revenue) as avg_monthly_revenue,
        COUNT(DISTINCT code) as total_hospitals
    FROM hospital_revenue
    WHERE address LIKE '%강남%' AND category = '피부과'
`).get();

report.calculation_validation.overall_avg_revenue = overall.avg_monthly_revenue;
report.calculation_validation.total_unique_hospitals = overall.total_hospitals;

// 4. Growth rate calculation
if (report.monthly_aggregation.length >= 2) {
    const latest = report.monthly_aggregation[report.monthly_aggregation.length - 1];
    const previous = report.monthly_aggregation[report.monthly_aggregation.length - 2];

    report.calculation_validation.latest_month = latest.year_month;
    report.calculation_validation.latest_month_avg = latest.avg_revenue;
    report.calculation_validation.previous_month = previous.year_month;
    report.calculation_validation.previous_month_avg = previous.avg_revenue;
    report.calculation_validation.growth_rate = ((latest.avg_revenue - previous.avg_revenue) / previous.avg_revenue * 100);
}

// 5. Latest month top hospitals
report.latest_month_details.top_hospitals = db.prepare(`
    SELECT 
        hospital_name,
        address,
        revenue,
        transaction_count,
        year_month
    FROM hospital_revenue
    WHERE address LIKE '%강남%' AND category = '피부과'
    AND year_month = (SELECT MAX(year_month) FROM hospital_revenue WHERE address LIKE '%강남%' AND category = '피부과')
    ORDER BY revenue DESC
    LIMIT 10
`).all();

// Save report as JSON
const outputPath = path.join(__dirname, '../verification_report.json');
fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));

console.log('Report saved to:', outputPath);
console.log('\n=== KEY FINDINGS ===');

console.log(`\nDatabase Size:`);
console.log(`  Total records: ${report.database_info.total_records.toLocaleString()}`);
console.log(`  Gangnam records: ${report.database_info.gangnam_records.toLocaleString()}`);
console.log(`  Gangnam Dermatology: ${report.database_info.gangnam_dermatology_records.toLocaleString()}`);

console.log(`\nLatest Month: ${report.calculation_validation.latest_month}`);
console.log(`  Average Revenue: ${(report.calculation_validation.latest_month_avg / 100000000).toFixed(2)} billion won`);
console.log(`  Average Revenue: ${(report.calculation_validation.latest_month_avg / 10000).toFixed(0)} man won`);

console.log(`\nGrowth Rate (${report.calculation_validation.previous_month} -> ${report.calculation_validation.latest_month}):`);
console.log(`  Previous: ${(report.calculation_validation.previous_month_avg / 10000).toFixed(0)} man won`);
console.log(`  Latest: ${(report.calculation_validation.latest_month_avg / 10000).toFixed(0)} man won`);
console.log(`  Growth: ${report.calculation_validation.growth_rate.toFixed(1)}%`);

db.close();
