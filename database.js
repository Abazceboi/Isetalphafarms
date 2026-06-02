const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to SQLite database (this will create database.db if it doesn't exist)
const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Create tables if they don't exist
db.serialize(() => {
    // Contacts Table
    db.run(`
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Newsletter Subscribers Table
    db.run(`
        CREATE TABLE IF NOT EXISTS subscribers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Drop Products Table if it lacks price (since we are upgrading it and it's empty anyway)
    db.run(`DROP TABLE IF EXISTS products`);

    // Products Table
    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            image_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, () => {
        // Seed default products
        const defaultProducts = [
            ['Broilers', 'poultry', 'Healthy and well-vaccinated chickens.', 8500, 'images/prod_broilers_1779837873590.png'],
            ['Farm Eggs', 'poultry', 'Big, chemical-free fresh eggs.', 3500, 'https://images.unsplash.com/photo-1598965675045-45c5e72c7d05?w=600&h=400&fit=crop'],
            ['Noilers', 'poultry', 'Fresh eggs and premium meat.', 7500, 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600&h=400&fit=crop'],
            ['Piggery', 'piggery', 'Healthy, well-fed, and fat pigs.', 25000, 'images/prod_piggery_1779837888029.png'],
            ['Goats', 'goats', 'Premium pasture-raised healthy goats.', 50000, 'images/prod_goats_1779837901590.png'],
            ['Snails', 'snails', 'Big and healthy giant African snails.', 15000, 'images/prod_snails_1779837913901.png'],
            ['Fresh Fishes', 'fishery', 'Naturally treated water fishes.', 5500, 'images/prod_fishes_1779837931706.png']
        ];
        
        db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
            if (!err && row && row.count === 0) {
                const stmt = db.prepare("INSERT INTO products (name, category, description, price, image_url) VALUES (?, ?, ?, ?, ?)");
                defaultProducts.forEach(prod => stmt.run(prod));
                stmt.finalize();
                console.log("Seeded default products.");
            }
        });
    });

    // Orders Table
    db.run(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            address TEXT NOT NULL,
            total_amount REAL NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Order Items Table
    db.run(`
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_name TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders (id)
        )
    `);
});

module.exports = db;
