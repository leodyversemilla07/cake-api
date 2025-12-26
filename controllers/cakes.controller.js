const db = require('../db');

exports.getAllCakes = (req, res) => {
    const sql = "SELECT * FROM cakes";
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ status: 500, success: false, error: err.message });
        if (rows.length < 1) return res.status(404).json({ status: 404, success: false, error: 'No cakes found' });
        return res.status(200).json({ status: 200, success: true, data: rows });
    });
};

exports.getCakeById = (req, res) => {
    const { id } = req.params;
    const sql = "SELECT * FROM cakes WHERE id = ?";
    db.get(sql, [id], (err, row) => {
        if (err) return res.status(500).json({ status: 500, success: false, error: err.message });
        if (!row) return res.status(404).json({ status: 404, success: false, error: 'Cake not found' });
        return res.status(200).json({ status: 200, success: true, data: row });
    });
};

exports.searchCakes = (req, res) => {
    const { q } = req.query;

    if (!q) {
        return res.status(400).json({ status: 400, success: false, error: 'Query parameter "q" is required' });
    }

    const sql = "SELECT * FROM cakes WHERE name LIKE ? OR flavor LIKE ?";
    const searchTerm = `%${q}%`;

    db.all(sql, [searchTerm, searchTerm], (err, rows) => {
        if (err) return res.status(500).json({ status: 500, success: false, error: err.message });
        if (rows.length < 1) return res.status(404).json({ status: 404, success: false, error: 'No cakes found matching your search' });
        return res.status(200).json({ status: 200, success: true, data: rows });
    });
};

exports.createCake = (req, res) => {
    const { name, description, flavor, price, is_available } = req.body;

    if (!name || !description || !flavor || price === undefined || is_available === undefined) {
         return res.status(400).json({ status: 400, success: false, error: 'Missing required fields' });
    }

    // Basic type validation
    if (typeof price !== 'number') {
         return res.status(400).json({ status: 400, success: false, error: 'Price must be a number' });
    }

    const sql = "INSERT INTO cakes( name, description, flavor, price, is_available ) VALUES (?,?,?,?,?)";
    db.run(sql, [name, description, flavor, price, is_available], function (err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ status: 500, success: false, error: err.message });
        }
        return res.status(201).json({ status: 201, success: true, data: { id: this.lastID } });
    });
};

exports.updateCake = (req, res) => {
    const { id } = req.params;
    const { name, description, flavor, price, is_available } = req.body;

    if (name === undefined && description === undefined && flavor === undefined && price === undefined && is_available === undefined) {
        return res.status(400).json({ status: 400, success: false, error: 'At least one field is required' });
    }

    const sql = `UPDATE cakes SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        flavor = COALESCE(?, flavor),
        price = COALESCE(?, price),
        is_available = COALESCE(?, is_available)
        WHERE id = ?`;

    db.run(sql, [name, description, flavor, price, is_available, id], function (err) {
        if (err) return res.status(500).json({ status: 500, success: false, error: err.message });
        if (this.changes < 1) return res.status(404).json({ status: 404, success: false, error: 'Cake not found' });

        db.get("SELECT * FROM cakes WHERE id = ?", [id], (err2, row) => {
            if (err2) return res.status(500).json({ status: 500, success: false, error: err2.message });
            return res.status(200).json({ status: 200, success: true, data: row });
        });
    });
};

exports.deleteCake = (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM cakes WHERE id = ?";

    db.run(sql, [id], function (err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ status: 500, success: false, error: err.message });
        }

        if (this.changes < 1) return res.status(404).json({ status: 404, success: false, error: 'Cake not found' });

        return res.status(200).json({ status: 200, success: true, data: { id } });
    });
};
