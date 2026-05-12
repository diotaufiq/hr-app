const oracledb = require('oracledb');
const path = require('path');

require('dotenv').config({
    path: path.resolve(__dirname, '..', '.env')
});

async function createLeaveRequestTable() {
    let connection;
    try {
        connection = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectString: process.env.DB_CONNECT_STRING || 'localhost:1521/xepdb1'
        });
        console.log('Connected to Oracle Database');

        // Drop table if exists
        try {
            await connection.execute('DROP TABLE leave_request PURGE');
            console.log('Existing leave_request table dropped');
        } catch (err) {
            // Table might not exist, continue
        }

        // Create table
        const createTableQuery = `
            CREATE TABLE leave_request (
                id NUMBER PRIMARY KEY,
                employee_id NUMBER NOT NULL,
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                reason CLOB,
                status VARCHAR2(20) DEFAULT 'pending',
                approved_by VARCHAR2(36),
                approved_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        await connection.execute(createTableQuery);
        console.log('Table leave_request created');

        // Create sequence for id
        try {
            await connection.execute('CREATE SEQUENCE leave_request_seq START WITH 1 INCREMENT BY 1 NOCACHE');
            console.log('Sequence leave_request_seq created');
        } catch (err) {
            // sequence may already exist
        }

        // Create trigger for auto-increment id
        try {
            await connection.execute(`
                CREATE OR REPLACE TRIGGER leave_request_bi
                BEFORE INSERT ON leave_request
                FOR EACH ROW
                BEGIN
                  IF :new.id IS NULL THEN
                    SELECT leave_request_seq.NEXTVAL INTO :new.id FROM dual;
                  END IF;
                END;
            `);
            console.log('Trigger leave_request_bi created');
        } catch (err) {
            // trigger may already exist
        }

        console.log('Migration for leave_request completed successfully');
    } catch (error) {
        console.error('Error creating leave_request table:', error);
    } finally {
        if (connection) {
            try {
                await connection.close();
                console.log('Database connection closed');
            } catch (error) {
                console.error('Error closing database connection:', error);
            }
        }
    }
}

createLeaveRequestTable();
