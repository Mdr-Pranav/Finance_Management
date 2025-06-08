const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Pranav@2005',
    database: process.env.DB_NAME || 'finance_manager',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Initialize database tables
async function initializeDatabase() {
    try {
        // Create transactions table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS transactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                amount DECIMAL(10,2) NOT NULL,
                description VARCHAR(255) NOT NULL,
                category VARCHAR(50) NOT NULL,
                type ENUM('income', 'expense') NOT NULL,
                date DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create expense_limits table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS expense_limits (
                id INT AUTO_INCREMENT PRIMARY KEY,
                category VARCHAR(50) NOT NULL,
                limit_amount DECIMAL(10,2) NOT NULL,
                period_type ENUM('monthly', 'yearly', 'custom') NOT NULL DEFAULT 'monthly',
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_category_period (category, start_date, end_date)
            )
        `);

        // Create goals table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS goals (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                target_amount DECIMAL(10,2) NOT NULL,
                current_amount DECIMAL(10,2) DEFAULT 0,
                deadline DATE,
                status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create debts table
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS debts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                person_name VARCHAR(255) NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                description TEXT,
                type ENUM('owe', 'owed') NOT NULL,
                created_date DATE NOT NULL,
                due_date DATE,
                status ENUM('pending', 'paid') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('Debts table created successfully');

        // Create subscriptions table
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS subscriptions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                cost DECIMAL(10,2) NOT NULL,
                billing_cycle ENUM('weekly', 'monthly', 'quarterly', 'yearly') NOT NULL DEFAULT 'monthly',
                next_billing_date DATE NOT NULL,
                category VARCHAR(100) DEFAULT 'Entertainment',
                description TEXT,
                status ENUM('active', 'paused', 'cancelled') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('Subscriptions table created successfully');

        console.log('Database initialization completed');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}

module.exports = {
    pool,
    initializeDatabase
}; 