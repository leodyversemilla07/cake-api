const sqlite = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'cakes.db');
const db = new sqlite.Database(dbPath, sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to database');
    }
});

module.exports = db;
