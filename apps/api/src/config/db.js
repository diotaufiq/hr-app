const oracledb = require('oracledb');
const path = require('path');

require('dotenv').config({
    path: path.resolve(__dirname, '..', '..', '.env')
});

async function connectDB(){
    try {
        const connection = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectString: process.env.DB_CONNECT_STRING
        });
        console.log('Connected to Oracle Database');
        return connection;
    } catch (err) {
        console.error('Error connecting to Oracle Database:', err);
        throw err;
    }
}
module.exports = connectDB;