const mysql = require('mysql2/promise');
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'dq_user',
    password: 'dq_pass',
    database: 'diario_quest'
});
module.exports = pool;
