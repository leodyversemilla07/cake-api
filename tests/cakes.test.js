const request = require('supertest');
const app = require('../app');
const db = require('../db');

describe('Cakes API', () => {
    let testCakeId;

    beforeAll((done) => {
        // Create table before tests if not exists (though table.js should have done it)
        // We can also clear the table to ensure clean state, but for now let's just append.
        // Or better, let's create a fresh table for testing if we could, but using the same db file is easier for this context.
        done();
    });

    afterAll((done) => {
        // db.close(); // app.js keeps server running, so we might need to handle this gracefully.
        // Since app.listen is called in app.js, it might prevent Jest from exiting.
        // We'll see.
        done();
    });

    test('POST /cake - should create a new cake', async () => {
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
        testCakeId = res.body.data.id;
    });

    test('POST /cake - should fail with missing fields', async () => {
        const res = await request(app)
            .post('/cake')
            .send({ name: 'Incomplete Cake' });

        expect(res.statusCode).toEqual(400);
        expect(res.body.success).toBe(false);
    });

    test('GET /cake - should list all cakes', async () => {
        const res = await request(app).get('/cake');
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
    });

    test('GET /cake/:id - should get a cake by id', async () => {
        const res = await request(app).get(`/cake/${testCakeId}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.id).toEqual(testCakeId);
    });

    test('GET /cake/:id - should return 404 for non-existent cake', async () => {
        const res = await request(app).get('/cake/999999');
        expect(res.statusCode).toEqual(404);
        expect(res.body.success).toBe(false);
    });

    test('PATCH /cake/:id - should update a cake', async () => {
        const updates = {
            price: 12.00
        };

        const res = await request(app)
            .patch(`/cake/${testCakeId}`)
            .send(updates);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.price).toEqual(12.00);
    });

    test('DELETE /cake/:id - should delete a cake', async () => {
        const res = await request(app).delete(`/cake/${testCakeId}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
    });

    test('GET /cake/:id - should return 404 after deletion', async () => {
        const res = await request(app).get(`/cake/${testCakeId}`);
        expect(res.statusCode).toEqual(404);
    });
});
