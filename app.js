const express = require('express');
const cors = require('cors');
const cakesRoutes = require('./routes/cakes.routes');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/cake', cakesRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ status: 500, success: false, error: 'Internal Server Error' });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`The server is running on http://localhost:${PORT}`);
    });
}

module.exports = app;
