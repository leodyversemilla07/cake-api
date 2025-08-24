const sqlite = require('sqlite3').verbose();
const db = new sqlite.Database('./cakes.db', sqlite.OPEN_READWRITE, (err) => {
    if (err) return console.error(err);
});

const sql = `CREATE TABLE IF NOT EXISTS cakes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    flavor TEXT NOT NULL,
    price REAL NOT NULL,
    is_available BOOLEAN NOT NULL
);`;

db.run(sql);