const oracledb = require('oracledb');
const path = require('path');

require('dotenv').config({
    path: path.resolve(__dirname, '..', '.env')
});

async function createEmployeesTable() {
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
            await connection.execute('DROP TABLE employees PURGE');
            console.log('Existing employees table dropped');
        } catch (err) {
            // Table might not exist, continue
        }

        // Create table
        const createTableQuery = `
            CREATE TABLE employees (
                id NUMBER PRIMARY KEY,
                user_id NUMBER,
                position VARCHAR2(100),
                department VARCHAR2(100),
                status VARCHAR2(20),
                join_date DATE
            )
        `;

        await connection.execute(createTableQuery);
        console.log('Table employees created');

        // Create sequence for id
        try {
            await connection.execute('CREATE SEQUENCE employees_seq START WITH 1 INCREMENT BY 1 NOCACHE');
            console.log('Sequence employees_seq created');
        } catch (err) {
            // sequence may already exist
        }

        // Create trigger for auto-increment id
        try {
            await connection.execute(`
                CREATE OR REPLACE TRIGGER employees_bi
                BEFORE INSERT ON employees
                FOR EACH ROW
                BEGIN
                  IF :new.id IS NULL THEN
                    SELECT employees_seq.NEXTVAL INTO :new.id FROM dual;
                  END IF;
                END;
            `);
            console.log('Trigger employees_bi created');
        } catch (err) {
            // trigger may already exist
        }

        console.log('Migration for employees completed successfully');
    } catch (error) {
        console.error('Error creating employees table:', error);
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

createEmployeesTable();
