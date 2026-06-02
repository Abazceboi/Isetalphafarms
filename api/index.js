require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const nodemailer = require('nodemailer');
const db = require('../database');

const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'iset-alpha-farms-super-secret-key-123',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// Admin protection middleware
const requireAdmin = (req, res, next) => {
    if (req.session && req.session.admin) {
        return next();
    }
    return res.status(401).json({ error: 'Unauthorized. Please login.' });
};

// Vercel automatically serves static files, so we don't strictly need this, but keep it for local testing.
app.use(express.static(path.join(__dirname, '..')));

// ==========================================
// EMAIL NOTIFICATIONS SETUP (NODEMAILER)
// ==========================================
let transporter;

async function setupEmail() {
    // If user hasn't provided real SMTP details, create a test Ethereal account
    if (!process.env.SMTP_USER || process.env.SMTP_USER === 'test@ethereal.email') {
        let testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        console.log(`[Email] Using Ethereal Test Account: ${testAccount.user}`);
    } else {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_PORT == 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        console.log(`[Email] Using real SMTP server: ${process.env.SMTP_HOST}`);
    }
}
setupEmail().catch(console.error);

async function sendEmailNotification(to, subject, text, html) {
    if (!transporter) return;
    try {
        let info = await transporter.sendMail({
            from: '"Iset Alpha Farms" <noreply@isetalphafarms.com>',
            to: to,
            subject: subject,
            text: text,
            html: html
        });
        if (info.messageId.includes('ethereal')) {
            console.log(`[Email Sent] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        } else {
            console.log(`[Email Sent] MessageID: ${info.messageId}`);
        }
    } catch (err) {
        console.error('[Email Error]', err);
    }
}

// ==========================================
// PUBLIC API ENDPOINTS
// ==========================================

// Get All Products (Dynamically requested by frontend)
app.get('/api/products', (req, res) => {
    db.all(`SELECT * FROM products ORDER BY id ASC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    const query = `INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)`;
    db.run(query, [name, email, message], function(err) {
        if (err) return res.status(500).json({ error: 'Failed to save contact message.' });
        
        // Send Email
        sendEmailNotification(
            email, 
            "We received your message - Iset Alpha Farms", 
            `Hi ${name},\n\nThank you for getting in touch. We have received your message: "${message}".\n\nWe will get back to you shortly!\n\n- Iset Alpha Farms`
        );
        sendEmailNotification(
            process.env.SMTP_USER || "admin@isetalphafarms.com", 
            "New Contact Form Submission", 
            `New message from ${name} (${email}):\n\n${message}`
        );

        res.status(201).json({ success: true, id: this.lastID, message: 'Message sent successfully!' });
    });
});

app.post('/api/newsletter', (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const query = `INSERT INTO subscribers (email) VALUES (?)`;
    db.run(query, [email], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ error: 'Email is already subscribed.' });
            }
            return res.status(500).json({ error: 'Failed to subscribe.' });
        }
        res.status(201).json({ success: true, message: 'Subscribed successfully!' });
    });
});

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
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'Failed to create order.' });
            }

            const orderId = this.lastID;
            const itemQuery = `INSERT INTO order_items (order_id, product_name, quantity, price) VALUES (?, ?, ?, ?)`;
            let hasError = false;

            const stmt = db.prepare(itemQuery);
            for (let item of items) {
                stmt.run([orderId, item.name, item.quantity, item.price], function(errItem) {
                    if (errItem) hasError = true;
                });
            }
            
            stmt.finalize(() => {
                if (hasError) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ error: 'Failed to insert order items.' });
                } else {
                    db.run('COMMIT');

                    // Send Receipt Email
                    let receiptText = `Hi ${name},\n\nThank you for your order (Order #${orderId})!\n\nDetails:\nAddress: ${address}\n\nItems:\n`;
                    items.forEach(i => receiptText += `- ${i.quantity}x ${i.name} (₦${i.price})\n`);
                    receiptText += `\nTotal: ₦${total_amount}\n\nYou will pay on delivery.\n\n- Iset Alpha Farms`;

                    sendEmailNotification(email, `Order Confirmation #${orderId} - Iset Alpha Farms`, receiptText);
                    sendEmailNotification(
                        process.env.SMTP_USER || "admin@isetalphafarms.com", 
                        `New Order Received #${orderId}`, 
                        `New order from ${name}.\nTotal: ₦${total_amount}\n\nLogin to the admin dashboard to view details.`
                    );

                    return res.status(201).json({ success: true, orderId: orderId, message: 'Order placed successfully!' });
                }
            });
        });
    });
});

// ==========================================
// ADMIN DASHBOARD & SECURITY ENDPOINTS
// ==========================================

// Login
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    const validUsername = process.env.ADMIN_USERNAME || 'admin';
    const validPassword = process.env.ADMIN_PASSWORD || 'password123';

    if (username === validUsername && password === validPassword) {
        req.session.admin = true;
        return res.json({ success: true });
    }
    return res.status(401).json({ error: 'Invalid credentials' });
});

// Check Session
app.get('/api/admin/check', (req, res) => {
    if (req.session && req.session.admin) {
        return res.json({ loggedIn: true });
    }
    return res.json({ loggedIn: false });
});

// Logout
app.post('/api/admin/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Admin Data Endpoints
app.get('/api/admin/contacts', requireAdmin, (req, res) => {
    db.all(`SELECT * FROM contacts ORDER BY created_at DESC`, [], (err, rows) => res.json(rows));
});

app.get('/api/admin/subscribers', requireAdmin, (req, res) => {
    db.all(`SELECT * FROM subscribers ORDER BY created_at DESC`, [], (err, rows) => res.json(rows));
});

app.get('/api/admin/orders', requireAdmin, (req, res) => {
    db.all(`SELECT * FROM orders ORDER BY created_at DESC`, [], (err, orders) => {
        if (err) return res.status(500).json({ error: err.message });
        db.all(`SELECT * FROM order_items`, [], (err, items) => {
            if (err) return res.status(500).json({ error: err.message });
            const ordersWithItems = orders.map(order => ({
                ...order,
                items: items.filter(item => item.order_id === order.id)
            }));
            res.json(ordersWithItems);
        });
    });
});

// Admin Product Management
app.post('/api/admin/products', requireAdmin, (req, res) => {
    const { name, category, description, price, image_url } = req.body;
    db.run(`INSERT INTO products (name, category, description, price, image_url) VALUES (?, ?, ?, ?, ?)`, 
    [name, category, description, price, image_url || ''], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: this.lastID });
    });
});

app.delete('/api/admin/products/:id', requireAdmin, (req, res) => {
    db.run(`DELETE FROM products WHERE id = ?`, [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Export the app for Vercel serverless function
module.exports = app;
