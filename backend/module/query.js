const { Pool } = require('pg');
const { backendUrl, backendHost } = require('../config');

const pool = new Pool({
    user: 'handalab',
    host: `${backendHost}`,
    database: 'nsk',
    password: 'handalab',
    port: 5433,
    idleTimeoutMillis: 3000,
    connectionTimeoutMillis: 30000,
    max: 10,
});

// pool.on('connect', () => {
//     console.log('New Client Connected');
// });

// pool.on('remove', () => {
//     console.log('Client removed from the pool');
// });

module.exports = pool;
