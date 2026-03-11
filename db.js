const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.resolve(__dirname, 'cakes.db');

const createTableSql = `CREATE TABLE IF NOT EXISTS cakes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    flavor TEXT NOT NULL,
    price REAL NOT NULL CHECK(price >= 0),
    is_available INTEGER NOT NULL CHECK(is_available IN (0, 1))
);`;

const normalizeParams = (params, callback) => {
    if (typeof params === 'function') {
        return { params: [], callback: params };
    }

    return {
        params: Array.isArray(params)
            ? params.map((value) => {
                if (value === undefined) {
                    return null;
                }

                if (typeof value === 'boolean') {
                    return value ? 1 : 0;
                }

                return value;
            })
            : [],
        callback
    };
};

const createRunContext = (result = {}) => ({
    lastID: result.lastInsertRowid === undefined ? undefined : Number(result.lastInsertRowid),
    changes: result.changes ?? 0
});

class DatabaseAdapter {
    constructor(filename) {
        this.connection = new DatabaseSync(filename);
    }

    all(sql, params, callback) {
        const normalized = normalizeParams(params, callback);

        try {
            const rows = this.connection.prepare(sql).all(...normalized.params);
            normalized.callback(null, rows);
        } catch (err) {
            normalized.callback(err);
        }
    }

    get(sql, params, callback) {
        const normalized = normalizeParams(params, callback);

        try {
            const row = this.connection.prepare(sql).get(...normalized.params);
            normalized.callback(null, row);
        } catch (err) {
            normalized.callback(err);
        }
    }

    run(sql, params, callback) {
        const normalized = normalizeParams(params, callback);

        try {
            const result = this.connection.prepare(sql).run(...normalized.params);

            if (normalized.callback) {
                normalized.callback.call(createRunContext(result), null);
            }
        } catch (err) {
            if (normalized.callback) {
                normalized.callback.call(createRunContext(), err);
            } else {
                throw err;
            }
        }

        return this;
    }

    close(callback) {
        try {
            this.connection.close();
            if (callback) {
                callback(null);
            }
        } catch (err) {
            if (callback) {
                callback(err);
            } else {
                throw err;
            }
        }
    }
}

const db = new DatabaseAdapter(dbPath);

try {
    db.connection.exec(createTableSql);
    console.log(`Connected to database at ${dbPath}`);
} catch (err) {
    console.error('Could not initialize database', err);
}

db.createTableSql = createTableSql;

module.exports = db;
