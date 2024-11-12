// database.js
const sqlite3 = require('sqlite3').verbose();

// Initialize SQLite Database
const db = new sqlite3.Database('./ecommerce.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');

        // Create products table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            price REAL,
            category TEXT,
            quantity INTEGER,
            description TEXT
        )`, (err) => {
            if (err) {
                console.error('Error creating products table:', err.message);
            }
        });
    }
});

module.exports = db;
