const express = require('express');
const router = express.Router();
const connectDB = require('../config/db');
const oracledb = require('oracledb');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, async (req, res) => {
    let connection;
    try {
        connection = await connectDB();
        const result = await connection.execute(
            'SELECT id, user_id, position, department, status, join_date FROM employees ORDER BY id DESC'
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.close();
    }
});

router.get('/:id', authMiddleware, async (req, res) => {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'Valid employee id is required' });

    let connection;
    try {
        connection = await connectDB();
        const result = await connection.execute(
            'SELECT id, user_id, position, department, status, join_date FROM employees WHERE id = :id',
            { id }
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Employee not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.close();
    }
});

router.post('/', authMiddleware, async (req, res) => {
    const { user_id, position, department, status, join_date } = req.body;
    if (user_id == null || !join_date) {
        return res.status(400).json({ error: 'user_id and join_date are required' });
    }

    const parsedJoin = new Date(join_date);
    if (Number.isNaN(parsedJoin.getTime())) {
        return res.status(400).json({ error: 'join_date must be a valid date' });
    }

    let connection;
    try {
        connection = await connectDB();
        const result = await connection.execute(
            `INSERT INTO employees (user_id, position, department, status, join_date)
             VALUES (:user_id, :position, :department, :status, :join_date)
             RETURNING id INTO :id`,
            {
                user_id,
                position: position || null,
                department: department || null,
                status: status || null,
                join_date: parsedJoin,
                id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
            },
            { autoCommit: false }
        );

        await connection.commit();
        res.status(201).json({ message: 'Employee created', id: result.outBinds.id[0] });
    } catch (err) {
        if (connection) await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.close();
    }
});

router.put('/:id', authMiddleware, async (req, res) => {
    const id = Number(req.params.id);
    const { user_id, position, department, status, join_date } = req.body;
    if (!id) return res.status(400).json({ error: 'Valid employee id is required' });

    const parsedJoin = join_date ? new Date(join_date) : null;
    if (join_date && Number.isNaN(parsedJoin.getTime())) {
        return res.status(400).json({ error: 'join_date must be a valid date' });
    }

    let connection;
    try {
        connection = await connectDB();
        const result = await connection.execute(
            `UPDATE employees SET
               user_id = NVL(:user_id, user_id),
               position = NVL(:position, position),
               department = NVL(:department, department),
               status = NVL(:status, status),
               join_date = NVL(:join_date, join_date)
             WHERE id = :id`,
            {
                id,
                user_id: user_id ?? null,
                position: position ?? null,
                department: department ?? null,
                status: status ?? null,
                join_date: parsedJoin
            },
            { autoCommit: false }
        );

        if (result.rowsAffected === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Employee not found' });
        }

        await connection.commit();
        res.json({ message: 'Employee updated' });
    } catch (err) {
        if (connection) await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.close();
    }
});

module.exports = router;
