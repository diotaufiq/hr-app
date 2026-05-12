const oracledb = require('oracledb');
const path = require('path');

require('dotenv').config({
    path: path.resolve(__dirname, '..', '.env')
});

async function seedEmployees() {
    let connection;
    try {
        connection = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectString: process.env.DB_CONNECT_STRING || 'localhost:1521/xepdb1'
        });
        console.log('Connected to Oracle Database');

        const employees = [
            {user_id:21, position: 'Developer', department: 'R&D', status: 'active', join_date: new Date('2021-03-15') },
            {user_id:22, position: 'QA Engineer', department: 'QA', status: 'active', join_date: new Date('2021-06-01') },
            {user_id:24, position: 'HR Specialist', department: 'HR', status: 'active', join_date: new Date('2020-11-20') },
            {user_id:31, position: 'Manager', department: 'Management', status: 'active', join_date: new Date('2019-09-10') },
            {user_id:25, position: 'Designer', department: 'Design', status: 'active', join_date: new Date('2022-01-05') },
            {user_id:26, position: 'DevOps Engineer', department: 'DevOps', status: 'active', join_date: new Date('2020-02-28') },
            {user_id:27, position: 'Product Manager', department: 'Product', status: 'active', join_date: new Date('2018-07-16') },
            {user_id:28, position: 'Accountant', department: 'Finance', status: 'active', join_date: new Date('2019-12-02') },
            {user_id:29, position: 'Sales Rep', department: 'Sales', status: 'active', join_date: new Date('2022-05-30') },
            {user_id:30, position: 'Support Engineer', department: 'Support', status: 'active', join_date: new Date('2023-04-12') }
        ];

        const sql = `INSERT INTO employees (user_id, position, department, status, join_date)
                     VALUES (:user_id, :position, :department, :status, :join_date)`;

        const binds = employees.map(e => ({
            user_id: e.user_id,
            position: e.position,
            department: e.department,
            status: e.status,
            join_date: e.join_date
        }));

        const options = { autoCommit: false, bindDefs: {
            user_id: { type: oracledb.NUMBER },
            position: { type: oracledb.STRING, maxSize: 100 },
            department: { type: oracledb.STRING, maxSize: 100 },
            status: { type: oracledb.STRING, maxSize: 20 },
            join_date: { type: oracledb.DATE }
        }};

        console.log('Planned binds:', binds);
        try {
            const result = await connection.executeMany(sql, binds, options);
            await connection.commit();
            console.log('Inserted rows:', result.rowsAffected);
        } catch (err) {
            console.error('Batch insert failed, attempting per-row insert to locate error');
            for (let i = 0; i < binds.length; i++) {
                const b = binds[i];
                try {
                    await connection.execute(sql, b, { autoCommit: false });
                    await connection.commit();
                    console.log(`Inserted row ${i} user_id=${b.user_id}`);
                } catch (rowErr) {
                    console.error(`Error inserting row ${i} with user_id=${b.user_id}:`, rowErr.message || rowErr);
                }
            }
        }
    } catch (err) {
        console.error('Error seeding employees:', err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
}

seedEmployees();
