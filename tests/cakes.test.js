const request = require('supertest');
const app = require('../app');
const db = require('../db');

// Helper function to run database queries within tests
const runQuery = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(query, params, function(err) {
            if (err) reject(err);
            resolve(this);
        });
    });
};

const getQuery = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
            if (err) reject(err);
            resolve(row);
        });
    });
}

describe('Cakes API', () => {

    beforeAll(async () => {
        // Create the cakes table before running tests
        await runQuery(`CREATE TABLE IF NOT EXISTS cakes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            flavor TEXT NOT NULL,
            price REAL NOT NULL,
            is_available BOOLEAN NOT NULL
        );`);
    });


    // Clean the database before and after each test
    beforeEach(async () => {
        await runQuery('DELETE FROM cakes');
    });

    afterAll((done) => {
        db.close((err) => {
            if (err) {
                console.error(err.message);
                done(err);
            } else {
                done();
            }
        });
    });

    describe('POST /cake', () => {
        test('should create a new cake', async () => {
            const newCake = {
                name: 'Test Cake',
                description: 'A delicious test cake',
                flavor: 'Vanilla',
                price: 10.00,
                is_available: true
            };

            const res = await request(app)
                .post('/cake')
                .send(newCake);

            expect(res.statusCode).toEqual(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('id');

            // Verify the cake was actually inserted into the DB
            const cakeInDb = await getQuery("SELECT * FROM cakes WHERE id = ?", [res.body.data.id]);
            expect(cakeInDb.name).toBe(newCake.name);
        });

        test('should fail with missing fields', async () => {
            const res = await request(app)
                .post('/cake')
                .send({ name: 'Incomplete Cake' });

            expect(res.statusCode).toEqual(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe('GET /cake', () => {
        test('should list all cakes', async () => {
            // Add a cake to the DB first
            await runQuery("INSERT INTO cakes (name, description, flavor, price, is_available) VALUES (?, ?, ?, ?, ?)",
                ['Chocolate Cake', 'Rich and moist', 'Chocolate', 20.00, true]);

            const res = await request(app).get('/cake');
            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBe(1);
            expect(res.body.data[0].name).toBe('Chocolate Cake');
        });

        test('should return 404 if no cakes are found', async () => {
            const res = await request(app).get('/cake');
            expect(res.statusCode).toEqual(404);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('No cakes found');
        });
    });


    describe('GET /cake/:id', () => {
        test('should get a cake by id', async () => {
            const result = await runQuery("INSERT INTO cakes (name, description, flavor, price, is_available) VALUES (?, ?, ?, ?, ?)",
                ['Vanilla Cake', 'Simple and sweet', 'Vanilla', 15.00, true]);
            const cakeId = result.lastID;

            const res = await request(app).get(`/cake/${cakeId}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.id).toEqual(cakeId);
        });

        test('should return 404 for non-existent cake', async () => {
            const res = await request(app).get('/cake/999999');
            expect(res.statusCode).toEqual(404);
            expect(res.body.success).toBe(false);
        });
    });

    describe('GET /cake/search', () => {
        beforeEach(async () => {
            // Add some cakes to the DB first
            await runQuery("INSERT INTO cakes (name, description, flavor, price, is_available) VALUES (?, ?, ?, ?, ?)",
                ['Chocolate Cake', 'Rich and moist', 'Chocolate', 20.00, true]);
            await runQuery("INSERT INTO cakes (name, description, flavor, price, is_available) VALUES (?, ?, ?, ?, ?)",
                ['Vanilla Cake', 'Simple and sweet', 'Vanilla', 15.00, true]);
            await runQuery("INSERT INTO cakes (name, description, flavor, price, is_available) VALUES (?, ?, ?, ?, ?)",
                ['Carrot Cake', 'Spiced and nutty', 'Carrot', 22.00, true]);
        });

        test('should find cakes by name', async () => {
            const res = await request(app).get('/cake/search?q=Chocolate');
            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.length).toBe(1);
            expect(res.body.data[0].name).toBe('Chocolate Cake');
        });

        test('should find cakes by flavor', async () => {
            const res = await request(app).get('/cake/search?q=Vanilla');
            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.length).toBe(1);
            expect(res.body.data[0].flavor).toBe('Vanilla');
        });

        test('should return 404 for no matching cakes', async () => {
            const res = await request(app).get('/cake/search?q=nonexistent');
            expect(res.statusCode).toEqual(404);
            expect(res.body.success).toBe(false);
        });

        test('should return 400 if query parameter is missing', async () => {
            const res = await request(app).get('/cake/search');
            expect(res.statusCode).toEqual(400);
            expect(res.body.success).toBe(false);
        });
    });


    describe('PATCH /cake/:id', () => {
        test('should update a cake', async () => {
            const result = await runQuery("INSERT INTO cakes (name, description, flavor, price, is_available) VALUES (?, ?, ?, ?, ?)",
                ['Lemon Tart', 'Zesty and refreshing', 'Lemon', 18.00, true]);
            const cakeId = result.lastID;

            const updates = { price: 20.00 };

            const res = await request(app)
                .patch(`/cake/${cakeId}`)
                .send(updates);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.price).toEqual(20.00);
        });

        test('should return 404 for non-existent cake', async () => {
            const res = await request(app).patch('/cake/999999').send({ price: 10 });
            expect(res.statusCode).toEqual(404);
        });
    });

    describe('DELETE /cake/:id', () => {
        test('should delete a cake', async () => {
            const result = await runQuery("INSERT INTO cakes (name, description, flavor, price, is_available) VALUES (?, ?, ?, ?, ?)",
                ['Carrot Cake', 'Spiced and nutty', 'Carrot', 22.00, true]);
            const cakeId = result.lastID;

            const res = await request(app).delete(`/cake/${cakeId}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);

            // Verify it's gone
            const res2 = await request(app).get(`/cake/${cakeId}`);
            expect(res2.statusCode).toEqual(404);
        });

        test('should return 404 for non-existent cake', async () => {
            const res = await request(app).delete('/cake/999999');
            expect(res.statusCode).toEqual(404);
        });
    });
});