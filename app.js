const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const sqlite = require('sqlite3').verbose();
let sql;
const db = new sqlite.Database('./cakes.db', sqlite.OPEN_READWRITE, (err) => {
    if (err) return console.error(err);
});

const PORT = 3000;

app.use(bodyParser.json());

app.post('/cake', (req, res) => {
    try {
        const { name, description, flavor, price, is_available } = req.body;
        sql = "INSERT INTO cakes( name, description, flavor, price, is_available ) VALUES (?,?,?,?,?)";

        db.run(sql, [name, description, flavor, price, is_available], function (err) {
            if (err) {
                console.error(err);
                return res.json({ status: 500, success: false, error: err.message });
            }

            console.log(`The cake with the attribute of ${name}, ${description}, ${flavor}, ${price}, ${is_available} has been added.`);
            return res.json({ status: 201, success: true, data: { id: this.lastID } });
        });

    } catch (error) {
        console.error(error);
        return res.json({
            status: 400,
            success: false,
            error: error.message
        });
    }
});

app.get('/cake', (req, res) => {
    try {
        const sql = "SELECT * FROM cakes";
        db.all(sql, [], (err, rows) => {
            if (err) return res.json({ status: 500, success: false, error: err.message });

            if (rows.length < 1) return res.json({ status: 404, success: false, error: 'No cakes found' });

            return res.json({ status: 200, success: true, data: rows });
        });
    } catch (error) {
        console.error(error);
        return res.json({ status: 500, success: false, error: error.message });
    }
});

app.get('/cake/:id', (req, res) => {
    try {
        const { id } = req.params;
        const sql = "SELECT * FROM cakes WHERE id = ?";
        db.get(sql, [id], (err, row) => {
            if (err) return res.json({ status: 500, success: false, error: err.message });
            if (!row) return res.json({ status: 404, success: false, error: 'Cake not found' });
            return res.json({ status: 200, success: true, data: row });
        });
    } catch (error) {
        console.error(error);
        return res.json({ status: 500, success: false, error: error.message });
    }
});

app.patch('/cake/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, flavor, price, is_available } = req.body;

        if (name === undefined && description === undefined && flavor === undefined && price === undefined && is_available === undefined) {
            return res.json({ status: 400, success: false, error: 'At least one field is required' });
        }

        const sql = `UPDATE cakes SET
            name = COALESCE(?, name),
            description = COALESCE(?, description),
            flavor = COALESCE(?, flavor),
            price = COALESCE(?, price),
            is_available = COALESCE(?, is_available)
            WHERE id = ?`;

        db.run(sql, [name, description, flavor, price, is_available, id], function (err) {
            if (err) return res.json({ status: 500, success: false, error: err.message });
            if (this.changes < 1) return res.json({ status: 404, success: false, error: 'Cake not found' });

            db.get("SELECT * FROM cakes WHERE id = ?", [id], (err2, row) => {
                if (err2) return res.json({ status: 500, success: false, error: err2.message });
                return res.json({ status: 200, success: true, data: row });
            });
        });
    } catch (error) {
        console.error(error);
        return res.json({ status: 500, success: false, error: error.message });
    }
});

app.delete('/cake/:id', (req, res) => {
    try {
        const { id } = req.params;
        const sql = "DELETE FROM cakes WHERE id = ?";

        db.run(sql, [id], function (err) {
            if (err) {
                console.error(err);
                return res.json({ status: 500, success: false, error: err.message });
            }

            if (this.changes < 1) return res.json({ status: 404, success: false, error: 'Cake not found' });

            return res.json({ status: 200, success: true, data: { id } });
        });
    } catch (error) {
        console.error(error);
        return res.json({ status: 500, success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`The server is running on http://localhost:${PORT}`);
});
