import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { execSync } from 'child_process';
import authRoutes from './routes/auth.routes';
import recommendationsRoutes from './routes/recommendations.routes';
import plaidRoutes from './routes/plaid.routes';

// Load environment variables from backend .env file
dotenv.config();

const runMigrations = () => {
  const schemaPath = path.resolve(__dirname, '../../prisma/schema.prisma');
  const projectRoot = path.resolve(__dirname, '..', '..');

  try {
    execSync(`npx prisma migrate deploy --schema "${schemaPath}"`, {
      cwd: projectRoot,
      stdio: 'inherit',
    });
  } catch (error) {
    console.warn(
      '[Backend] Warning: failed to run Prisma migrations automatically. ' +
        'Make sure your database schema is up to date.',
      error
    );
  }
};

runMigrations();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/plaid', plaidRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
