const db = require('../db');

const mapCakeRow = (row) => ({
    ...row,
    is_available: Boolean(row.is_available)
});

const sendValidationError = (res, message) =>
    res.status(400).json({ status: 400, success: false, error: message });

const normalizeTextField = (value) => {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
};

const parseCakeId = (id) => {
    const parsedId = Number.parseInt(id, 10);
    return Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;
};

const validateCakePayload = (payload, { partial = false } = {}) => {
    const errors = [];
    const normalized = {};
    const requiredFields = ['name', 'description', 'flavor', 'price', 'is_available'];

    if (!partial) {
        const missingFields = requiredFields.filter((field) => payload[field] === undefined);
        if (missingFields.length > 0) {
            errors.push(`Missing required fields: ${missingFields.join(', ')}`);
        }
    }

    if (payload.name !== undefined) {
        normalized.name = normalizeTextField(payload.name);
        if (!normalized.name) {
            errors.push('Name must be a non-empty string');
        }
    }

    if (payload.description !== undefined) {
        normalized.description = normalizeTextField(payload.description);
        if (!normalized.description) {
            errors.push('Description must be a non-empty string');
        }
    }

    if (payload.flavor !== undefined) {
        normalized.flavor = normalizeTextField(payload.flavor);
        if (!normalized.flavor) {
            errors.push('Flavor must be a non-empty string');
        }
    }

    if (payload.price !== undefined) {
        if (typeof payload.price !== 'number' || !Number.isFinite(payload.price) || payload.price < 0) {
            errors.push('Price must be a non-negative number');
        } else {
            normalized.price = payload.price;
        }
    }

    if (payload.is_available !== undefined) {
        if (typeof payload.is_available !== 'boolean') {
            errors.push('is_available must be a boolean');
        } else {
            normalized.is_available = payload.is_available ? 1 : 0;
        }
    }

    if (partial && Object.keys(normalized).length === 0) {
        errors.push('At least one valid field is required');
    }

    return { errors, value: normalized };
};

exports.getAllCakes = (req, res) => {
    const sql = 'SELECT * FROM cakes ORDER BY id ASC';
    db.all(sql, [], (err, rows) => {
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

    const sql = 'SELECT * FROM cakes WHERE name LIKE ? OR flavor LIKE ? OR description LIKE ? ORDER BY id ASC';
    const searchTerm = `%${q}%`;

    db.all(sql, [searchTerm, searchTerm, searchTerm], (err, rows) => {
        if (err) return res.status(500).json({ status: 500, success: false, error: err.message });
        return res.status(200).json({ status: 200, success: true, data: rows.map(mapCakeRow) });
    });
};

exports.createCake = (req, res) => {
    const validation = validateCakePayload(req.body);
    if (validation.errors.length > 0) {
        return sendValidationError(res, validation.errors.join('; '));
    }

    const { name, description, flavor, price, is_available } = validation.value;
    const sql = 'INSERT INTO cakes(name, description, flavor, price, is_available) VALUES (?, ?, ?, ?, ?)';
    db.run(sql, [name, description, flavor, price, is_available], function (err) {
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

    const validation = validateCakePayload(req.body, { partial: true });
    if (validation.errors.length > 0) {
        return sendValidationError(res, validation.errors.join('; '));
    }

    const { name, description, flavor, price, is_available } = validation.value;
    const sql = `UPDATE cakes SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        flavor = COALESCE(?, flavor),
        price = COALESCE(?, price),
        is_available = COALESCE(?, is_available)
        WHERE id = ?`;

    db.run(sql, [name, description, flavor, price, is_available, cakeId], function (err) {
        if (err) return res.status(500).json({ status: 500, success: false, error: err.message });
        if (this.changes < 1) return res.status(404).json({ status: 404, success: false, error: 'Cake not found' });

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

        if (this.changes < 1) return res.status(404).json({ status: 404, success: false, error: 'Cake not found' });

        return res.status(200).json({ status: 200, success: true, data: { id: cakeId } });
    });
};
