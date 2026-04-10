const db = require('../db');
const { z } = require('zod');

const mapCakeRow = (row) => ({
  ...row,
  is_available: Boolean(row.is_available),
});

const sendValidationError = (res, message) =>
  res.status(400).json({ status: 400, success: false, error: message });

const parseCakeId = (id) => {
  const parsedId = Number.parseInt(id, 10);
  return Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;
};

// Zod schemas for validation
const cakeSchema = z.object({
  name: z.string().trim().min(1, 'Name must be a non-empty string'),
  description: z.string().trim().min(1, 'Description must be a non-empty string'),
  flavor: z.string().trim().min(1, 'Flavor must be a non-empty string'),
  price: z.number().min(0, 'Price must be a non-negative number'),
  is_available: z.boolean({ invalid_type_error: 'is_available must be a boolean' }),
});

const partialCakeSchema = cakeSchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: 'At least one valid field is required',
});

exports.getAllCakes = (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = parseInt(req.query.offset, 10) || 0;

  const sql = 'SELECT * FROM cakes ORDER BY id ASC LIMIT ? OFFSET ?';
  db.all(sql, [limit, offset], (err, rows) => {
    if (err) return res.status(500).json({ status: 500, success: false, error: err.message });
    return res.status(200).json({ status: 200, success: true, data: rows.map(mapCakeRow) });
  });
};

exports.getCakeById = (req, res) => {
  const cakeId = parseCakeId(req.params.id);
  if (!cakeId) {
    return sendValidationError(res, 'Cake id must be a positive integer');
  }

  const sql = 'SELECT * FROM cakes WHERE id = ?';
  db.get(sql, [cakeId], (err, row) => {
    if (err) return res.status(500).json({ status: 500, success: false, error: err.message });
    if (!row) return res.status(404).json({ status: 404, success: false, error: 'Cake not found' });
    return res.status(200).json({ status: 200, success: true, data: mapCakeRow(row) });
  });
};

exports.searchCakes = (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';

  if (!q) {
    return sendValidationError(res, 'Query parameter "q" is required');
  }

  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = parseInt(req.query.offset, 10) || 0;

  const sql =
    'SELECT * FROM cakes WHERE name LIKE ? OR flavor LIKE ? OR description LIKE ? ORDER BY id ASC LIMIT ? OFFSET ?';
  const searchTerm = `%${q}%`;

  db.all(sql, [searchTerm, searchTerm, searchTerm, limit, offset], (err, rows) => {
    if (err) return res.status(500).json({ status: 500, success: false, error: err.message });
    return res.status(200).json({ status: 200, success: true, data: rows.map(mapCakeRow) });
  });
};

exports.createCake = (req, res) => {
  const parsed = cakeSchema.safeParse(req.body);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((e) => e.message);
    return sendValidationError(res, errors.join('; '));
  }

  const { name, description, flavor, price, is_available } = parsed.data;
  const isAvailableInt = is_available ? 1 : 0;

  const sql =
    'INSERT INTO cakes(name, description, flavor, price, is_available) VALUES (?, ?, ?, ?, ?)';
  db.run(sql, [name, description, flavor, price, isAvailableInt], function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ status: 500, success: false, error: err.message });
    }

    db.get('SELECT * FROM cakes WHERE id = ?', [this.lastID], (readErr, row) => {
      if (readErr) {
        return res.status(500).json({ status: 500, success: false, error: readErr.message });
      }

      return res.status(201).json({ status: 201, success: true, data: mapCakeRow(row) });
    });
  });
};

exports.updateCake = (req, res) => {
  const cakeId = parseCakeId(req.params.id);
  if (!cakeId) {
    return sendValidationError(res, 'Cake id must be a positive integer');
  }

  const parsed = partialCakeSchema.safeParse(req.body);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((e) => e.message);
    return sendValidationError(res, errors.join('; '));
  }

  const { name, description, flavor, price, is_available } = parsed.data;
  const isAvailableInt = is_available !== undefined ? (is_available ? 1 : 0) : undefined;

  const sql = `UPDATE cakes SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        flavor = COALESCE(?, flavor),
        price = COALESCE(?, price),
        is_available = COALESCE(?, is_available)
        WHERE id = ?`;

  db.run(sql, [name, description, flavor, price, isAvailableInt, cakeId], function (err) {
    if (err) return res.status(500).json({ status: 500, success: false, error: err.message });
    if (this.changes < 1)
      return res.status(404).json({ status: 404, success: false, error: 'Cake not found' });

    db.get('SELECT * FROM cakes WHERE id = ?', [cakeId], (err2, row) => {
      if (err2) return res.status(500).json({ status: 500, success: false, error: err2.message });
      return res.status(200).json({ status: 200, success: true, data: mapCakeRow(row) });
    });
  });
};

exports.deleteCake = (req, res) => {
  const cakeId = parseCakeId(req.params.id);
  if (!cakeId) {
    return sendValidationError(res, 'Cake id must be a positive integer');
  }

  const sql = 'DELETE FROM cakes WHERE id = ?';

  db.run(sql, [cakeId], function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ status: 500, success: false, error: err.message });
    }

    if (this.changes < 1)
      return res.status(404).json({ status: 404, success: false, error: 'Cake not found' });

    return res.status(200).json({ status: 200, success: true, data: { id: cakeId } });
  });
};
