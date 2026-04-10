import dotenv from 'dotenv';
import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import cakesRoutes from './routes/cakes.routes';
import swaggerSpec from './swagger';

dotenv.config({ quiet: true });

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

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 200,
    success: true,
    data: { service: 'cake-api', uptime: process.uptime() },
  });
});

// Routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Preferred versioned API route
app.use('/api/v1/cake', cakesRoutes);

// Backward-compatible legacy route (to be deprecated in a future major version)
app.use(
  '/cake',
  (_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Deprecation', 'true');
    res.setHeader('Sunset', 'Wed, 01 Jan 2027 00:00:00 GMT');
    res.setHeader('Link', '</api/v1/cake>; rel="successor-version"');
    next();
  },
  cakesRoutes
);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ status: 404, success: false, error: 'Route not found' });
});

// Error handling middleware
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof Error) {
    console.error(err.stack);
  } else {
    console.error(err);
  }
  res.status(500).json({ status: 500, success: false, error: 'Internal Server Error' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`The server is running on http://localhost:${PORT}`);
  });
}

export default app;
