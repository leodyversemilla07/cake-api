require('dotenv').config({ quiet: true });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const cakesRoutes = require('./routes/cakes.routes');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Security and Rate Limiting
app.use(helmet({ contentSecurityPolicy: false })); // Disabled CSP to allow Swagger UI scripts

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

app.use(cors());

if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 200,
        success: true,
        data: { service: 'cake-api', uptime: process.uptime() }
    });
});

// Routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/cake', cakesRoutes);

app.use((req, res) => {
    res.status(404).json({ status: 404, success: false, error: 'Route not found' });
});

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
