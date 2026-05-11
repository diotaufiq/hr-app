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
            'SELECT id, employee_id, check_in, check_out, date_attendace, created_at FROM attendance ORDER BY id DESC'
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
});

router.post('/', authMiddleware, async (req, res) => {
    const { employee_id, check_in, check_out, date_attendace } = req.body;
    const attendanceDate = new Date(date_attendace);

    if (employee_id == null || !date_attendace) {
        return res.status(400).json({ error: 'employee_id and date_attendace are required' });
    }

    if (Number.isNaN(attendanceDate.getTime())) {
        return res.status(400).json({ error: 'date_attendace must be a valid date' });
    }

    let connection;
    try {
        connection = await connectDB();
        const result = await connection.execute(
            `INSERT INTO attendance (employee_id, check_in, check_out, date_attendace, created_at)
             VALUES (:employee_id, :check_in, :check_out, :date_attendace, CURRENT_TIMESTAMP)
             RETURNING id INTO :id`,
            {
                employee_id,
                check_in: check_in ? new Date(check_in) : null,
                check_out: check_out ? new Date(check_out) : null,
                date_attendace: attendanceDate,
                id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
            },
            { autoCommit: false }
        );

        await connection.commit();
        res.status(201).json({
            message: 'Attendance created successfully',
            id: result.outBinds.id[0]
        });
    } catch (err) {
        if (connection) {
            await connection.rollback();
        }
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
});

router.put('/:id', authMiddleware, async (req, res) => {
    const attendanceId = Number(req.params.id);
    const { employee_id, check_in, check_out, date_attendace } = req.body;
    const attendanceDate = date_attendace ? new Date(date_attendace) : null;

    if (!attendanceId) {
        return res.status(400).json({ error: 'Valid attendance id is required' });
    }

    if (date_attendace && Number.isNaN(attendanceDate.getTime())) {
        return res.status(400).json({ error: 'date_attendace must be a valid date' });
    }

    let connection;
    try {
        connection = await connectDB();
        const result = await connection.execute(
            `UPDATE attendance
             SET employee_id = NVL(:employee_id, employee_id),
                 check_in = NVL(:check_in, check_in),
                 check_out = NVL(:check_out, check_out),
                 date_attendace = NVL(:date_attendace, date_attendace)
             WHERE id = :id`,
            {
                id: attendanceId,
                employee_id: employee_id ?? null,
                check_in: check_in ? new Date(check_in) : null,
                check_out: check_out ? new Date(check_out) : null,
                date_attendace: attendanceDate
            },
            { autoCommit: false }
        );

        if (result.rowsAffected === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Attendance not found' });
        }

        await connection.commit();
        res.json({ message: 'Attendance updated successfully' });
    } catch (err) {
        if (connection) {
            await connection.rollback();
        }
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
});

module.exports = router;