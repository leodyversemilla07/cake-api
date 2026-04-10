import { DatabaseSync, StatementSync } from 'node:sqlite';
import path from 'node:path';

type DbParam = string | number | null;
type DbCallback<T = unknown> = (err: Error | null, result?: T) => void;
type RunCallback = (this: { lastID?: number; changes: number }, err: Error | null) => void;

type RunResult = {
  lastInsertRowid?: bigint | number;
  changes?: number;
};

const configuredDbPath = process.env.DB_PATH?.trim();
const dbPath = configuredDbPath
  ? path.resolve(process.cwd(), configuredDbPath)
  : path.resolve(__dirname, 'cakes.db');

const createTableSql = `CREATE TABLE IF NOT EXISTS cakes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    flavor TEXT NOT NULL,
    price REAL NOT NULL CHECK(price >= 0),
    is_available INTEGER NOT NULL CHECK(is_available IN (0, 1))
);`;

const normalizeParams = (
  params: DbParam[] | DbCallback<unknown> | undefined,
  callback?: DbCallback<unknown>
): { params: DbParam[]; callback: DbCallback<unknown> } => {
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
    callback: callback ?? (() => {}),
  };
};

const createRunContext = (result: RunResult = {}) => ({
  lastID: result.lastInsertRowid === undefined ? undefined : Number(result.lastInsertRowid),
  changes: result.changes ?? 0,
});

class DatabaseAdapter {
  private connection: DatabaseSync;

  constructor(filename: string) {
    this.connection = new DatabaseSync(filename);
  }

  all(sql: string, params: DbParam[] | DbCallback<unknown>, callback?: DbCallback<unknown>): void {
    const normalized = normalizeParams(params, callback);

    try {
      const rows = this.connection.prepare(sql).all(...normalized.params);
      normalized.callback(null, rows);
    } catch (err) {
      normalized.callback(err as Error);
    }
  }

  get(sql: string, params: DbParam[] | DbCallback<unknown>, callback?: DbCallback<unknown>): void {
    const normalized = normalizeParams(params, callback);

    try {
      const row = this.connection.prepare(sql).get(...normalized.params);
      normalized.callback(null, row);
    } catch (err) {
      normalized.callback(err as Error);
    }
  }

  run(sql: string, params: DbParam[] | RunCallback, callback?: RunCallback): this {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }

    const normalizedParams: DbParam[] = Array.isArray(params)
      ? params.map((value) => {
          if (value === undefined) {
            return null;
          }
          if (typeof value === 'boolean') {
            return value ? 1 : 0;
          }
          return value;
        })
      : [];

    try {
      const result = this.connection.prepare(sql).run(...normalizedParams) as RunResult;

      if (callback) {
        callback.call(createRunContext(result), null);
      }
    } catch (err) {
      if (callback) {
        callback.call(createRunContext(), err as Error);
      } else {
        throw err;
      }
    }

    return this;
  }

  close(callback?: (err: Error | null) => void): void {
    try {
      this.connection.close();
      callback?.(null);
    } catch (err) {
      if (callback) {
        callback(err as Error);
      } else {
        throw err;
      }
    }
  }

  exec(sql: string): void {
    this.connection.exec(sql);
  }
}

const db = new DatabaseAdapter(dbPath) as DatabaseAdapter & { createTableSql: string };

try {
  db.exec(createTableSql);
  console.log(`Connected to database at ${dbPath}`);
} catch (err) {
  console.error('Could not initialize database', err);
}

db.createTableSql = createTableSql;

export default db;
