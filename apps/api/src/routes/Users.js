const express = require('express');
const router = express.Router();
const connectDB = require('../config/db');
const bcrypt = require('bcrypt');
const oracledb = require('oracledb');

router.get('/', async (req, res) => {
    try {
        const connection = await connectDB();
        const result = await connection.execute('SELECT * FROM users');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Database connection error' });
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


module.exports = router;