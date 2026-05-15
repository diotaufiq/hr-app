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
            'SELECT id, employee_id, check_in, check_out, date_attendance, created_at FROM attendance ORDER BY id DESC'
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
    const { check_out, date_attendance } = req.body || {};
    const attendanceDate = new Date(date_attendance);
    const checkInTime = new Date(); // Capture current server time for check_in
    const userId = req.user.id; // Get user ID from JWT token
    
    if (!date_attendance) {
        return res.status(400).json({ error: 'date_attendance is required' });
    }

    if (Number.isNaN(attendanceDate.getTime())) {
        return res.status(400).json({ error: 'date_attendance must be a valid date' });
    }

    let connection;
    try {
        connection = await connectDB();
        
        // Fetch employee_id from employees table using user_id from JWT
        const empResult = await connection.execute(
            'SELECT id FROM employees WHERE user_id = :user_id',
            { user_id: userId }
        );
        
        if (empResult.rows.length === 0) {
            return res.status(404).json({ error: 'Employee record not found for this user' });
        }
        
        const employeeId = empResult.rows[0][0];
        
        const result = await connection.execute(
            `INSERT INTO attendance (employee_id, check_in, check_out, date_attendance, created_at)
             VALUES (:employee_id, :check_in, :check_out, :date_attendance, CURRENT_TIMESTAMP)
             RETURNING id INTO :id`,
            {
                employee_id: employeeId,
                check_in: checkInTime,
                check_out: check_out ? new Date(check_out) : null,
                date_attendance: attendanceDate,
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
    const { check_in, check_out, date_attendance } = req.body || {};
    const attendanceDate = date_attendance ? new Date(date_attendance) : null;
    const checkOutTime = check_out ? new Date(check_out) : new Date(); // Auto-fill with current time if not provided
    const userId = req.user.id; // Get user ID from JWT token

    if (!attendanceId) {
        return res.status(400).json({ error: 'Valid attendance id is required' });
    }

    if (date_attendance && Number.isNaN(attendanceDate.getTime())) {
        return res.status(400).json({ error: 'date_attendance must be a valid date' });
    }

    let connection;
    try {
        connection = await connectDB();
        
        // Fetch employee_id from employees table using user_id from JWT
        const empResult = await connection.execute(
            'SELECT id FROM employees WHERE user_id = :user_id',
            { user_id: userId }
        );
        
        if (empResult.rows.length === 0) {
            return res.status(404).json({ error: 'Employee record not found for this user' });
        }
        
        const employeeId = empResult.rows[0][0];
        
        const result = await connection.execute(
            `UPDATE attendance
             SET check_in = NVL(:check_in, check_in),
                 check_out = NVL(:check_out, check_out),
                 date_attendance = NVL(:date_attendance, date_attendance)
             WHERE id = :id AND employee_id = :employee_id`,
            {
                id: attendanceId,
                employee_id: employeeId,
                check_in: check_in ? new Date(check_in) : null,
                check_out: checkOutTime,
                date_attendance: attendanceDate
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