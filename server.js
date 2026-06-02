const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the current directory
// This serves index.html, css/, js/, images/, etc.
app.use(express.static(__dirname));

// API Endpoint: Submit Contact Form
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    const query = `INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)`;
    db.run(query, [name, email, message], function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Failed to save contact message.' });
        }
        res.status(201).json({ success: true, id: this.lastID, message: 'Message sent successfully!' });
    });
});

// API Endpoint: Newsletter Subscription
app.post('/api/newsletter', (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required.' });
    }

    const query = `INSERT INTO subscribers (email) VALUES (?)`;
    db.run(query, [email], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ error: 'Email is already subscribed.' });
            }
            console.error(err.message);
            return res.status(500).json({ error: 'Failed to subscribe.' });
        }
        res.status(201).json({ success: true, message: 'Subscribed successfully!' });
    });
});

// API Endpoint: Checkout Order
app.post('/api/checkout', (req, res) => {
    const { name, email, address, total_amount, items } = req.body;

    if (!name || !email || !address || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Invalid checkout data provided.' });
    }

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        const orderQuery = `INSERT INTO orders (name, email, address, total_amount) VALUES (?, ?, ?, ?)`;
        db.run(orderQuery, [name, email, address, total_amount], function(err) {
            if (err) {
                console.error(err.message);
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'Failed to create order.' });
            }

            const orderId = this.lastID;
            const itemQuery = `INSERT INTO order_items (order_id, product_name, quantity, price) VALUES (?, ?, ?, ?)`;
            let hasError = false;

            // We use simple iteration here because sqlite3.Database.run is asynchronous but serialized
            const stmt = db.prepare(itemQuery);
            for (let item of items) {
                stmt.run([orderId, item.name, item.quantity, item.price], function(errItem) {
                    if (errItem) {
                        hasError = true;
                        console.error(errItem.message);
                    }
                });
            }
            
            stmt.finalize(() => {
                if (hasError) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ error: 'Failed to insert order items.' });
                } else {
                    db.run('COMMIT');
                    return res.status(201).json({ success: true, orderId: orderId, message: 'Order placed successfully!' });
                }
            });
        });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
