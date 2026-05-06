const express = require('express');
const router = express.Router();
const connectDB = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const oracledb = require('oracledb');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, async (req, res) => {
    try {
        const connection = await connectDB();
        const result = await connection.execute('SELECT id, name, email, role FROM users');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Database connection error' });
    }
});

router.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ error: 'name, email, password, and role are required' });
    }

    let connection;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        connection = await connectDB();
        const result = await connection.execute(
            'INSERT INTO users (name, email, password, role) VALUES (:name, :email, :password, :role) RETURNING id INTO :id',
            {
                name,
                email,
                password: hashedPassword,
                role,
                id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
            }
        );
        
        await connection.commit();
        res.status(201).json({ 
            message: 'User registered successfully', 
            id: result.outBinds.id[0] 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
});

router.post('/add', async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ error: 'name, email, password, and role are required' });
    }

    let connection;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        connection = await connectDB();
        const result = await connection.execute(
            'INSERT INTO users (name, email, password, role) VALUES (:name, :email, :password, :role) RETURNING id INTO :id',
            {
                name,
                email,
                password: hashedPassword,
                role,
                id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
            }
        );
        
        await connection.commit();
        res.status(201).json({ id: result.outBinds.id[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    let connection;
    try {
        connection = await connectDB();
        const result = await connection.execute(
            'SELECT id, name, email, password, role FROM users WHERE email = :email',
            { email }
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = result.rows[0];
        const passwordMatch = await bcrypt.compare(password, user[3]); // user[3] is password

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { 
                id: user[0], 
                email: user[2], 
                name: user[1],
                role: user[4]
            },
            process.env.JWT_SECRET || 'your_secret_key',
            { expiresIn: '24h' }
        );

        res.json({ 
            message: 'Login successful',
            token,
            user: {
                id: user[0],
                name: user[1],
                email: user[2],
                role: user[4]
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
});

module.exports = router;