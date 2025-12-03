import fs from 'fs';
import Papa from 'papaparse';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting CSV to SQLite conversion...');

// Paths
const csvPath = path.join(__dirname, '../data/해외 매출액 매칭 통합본_v4 utf.csv');
const dbPath = path.join(__dirname, '../data/hospitals.db');

// Remove existing database
if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('Removed existing database');
}

// Create database
const db = new Database(dbPath);

// Create table
db.exec(`
    CREATE TABLE IF NOT EXISTS hospital_revenue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        year_month TEXT NOT NULL,
        country TEXT,
        code TEXT NOT NULL,
        hospital_name TEXT,
        opening_date TEXT,
        type TEXT,
        status TEXT,
        closing_date TEXT,
        category TEXT,
        total_area_m2 REAL,
        address TEXT,
        revenue REAL,
        transaction_count INTEGER,
        avg_payment REAL,
        weekday_ratio REAL,
        weekend_ratio REAL,
        monday REAL,
        tuesday REAL,
        wednesday REAL,
        thursday REAL,
        friday REAL,
        saturday REAL,
        sunday REAL
    )
`);

console.log('Created table schema');

// Create indexes for faster queries
db.exec(`
    CREATE INDEX idx_year_month ON hospital_revenue(year_month);
    CREATE INDEX idx_address ON hospital_revenue(address);
    CREATE INDEX idx_category ON hospital_revenue(category);
    CREATE INDEX idx_hospital_name ON hospital_revenue(hospital_name);
    CREATE INDEX idx_composite ON hospital_revenue(year_month, address, category);
`);

console.log('Created indexes');

// Read CSV
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Parse CSV
Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
        console.log(`Parsed ${results.data.length} rows`);

        // Prepare insert statement
        const insert = db.prepare(`
            INSERT INTO hospital_revenue (
                year_month, country, code, hospital_name, opening_date, 
                type, status, closing_date, category, total_area_m2,
                address, revenue, transaction_count, avg_payment,
                weekday_ratio, weekend_ratio, monday, tuesday, wednesday,
                thursday, friday, saturday, sunday
            ) VALUES (
                @year_month, @country, @code, @hospital_name, @opening_date,
                @type, @status, @closing_date, @category, @total_area_m2,
                @address, @revenue, @transaction_count, @avg_payment,
                @weekday_ratio, @weekend_ratio, @monday, @tuesday, @wednesday,
                @thursday, @friday, @saturday, @sunday
            )
        `);

        // Insert in transaction for performance
        const insertMany = db.transaction((rows) => {
            let count = 0;
            for (const row of rows) {
                try {
                    insert.run({
                        year_month: row.YearMonth || '',
                        country: row['국가'] || '',
                        code: row['코드'] || '',
                        hospital_name: row['의원명'] || '',
                        opening_date: row['개설일자'] || null,
                        type: row['종별코드명'] || '',
                        status: row['상태'] || '',
                        closing_date: row['폐업일자'] || null,
                        category: row['오픈닥터_진료과'] || '',
                        total_area_m2: parseFloat(row['총면적m2']) || null,
                        address: row['정제주소'] || '',
                        revenue: parseFloat(row['매출액']) || 0,
                        transaction_count: parseInt(row['거래건수']) || 0,
                        avg_payment: parseFloat(row['평균결재액']) || 0,
                        weekday_ratio: parseFloat(row['주중비율']) || 0,
                        weekend_ratio: parseFloat(row['주말비율']) || 0,
                        monday: parseFloat(row['월요일']) || 0,
                        tuesday: parseFloat(row['화요일']) || 0,
                        wednesday: parseFloat(row['수요일']) || 0,
                        thursday: parseFloat(row['목요일']) || 0,
                        friday: parseFloat(row['금요일']) || 0,
                        saturday: parseFloat(row['토요일']) || 0,
                        sunday: parseFloat(row['일요일']) || 0
                    });
                    count++;

                    if (count % 10000 === 0) {
                        console.log(`Inserted ${count} rows...`);
                    }
                } catch (err) {
                    console.error('Error inserting row:', err.message);
                }
            }
            return count;
        });

        const totalInserted = insertMany(results.data);
        console.log(`\nConversion complete! Inserted ${totalInserted} rows into SQLite database`);

        // Verify
        const count = db.prepare('SELECT COUNT(*) as count FROM hospital_revenue').get();
        console.log(`Database now contains ${count.count} rows`);

        db.close();
    },
    error: (error) => {
        console.error('Error parsing CSV:', error);
        db.close();
    }
});
