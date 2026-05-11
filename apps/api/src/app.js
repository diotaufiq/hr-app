const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API is running...');
});
app.use('/api/users', require('./routes/Users'));
app.use('/api/attendance', require('./routes/Attendance'));
module.exports = app;