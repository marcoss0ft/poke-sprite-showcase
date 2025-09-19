import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pkg from 'pg';
import { z } from 'zod';

dotenv.config();

const PORT = process.env.PORT ?? 4000;
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set.');
  process.exit(1);
}

const { Pool } = pkg;
const pool = new Pool({ connectionString: DATABASE_URL });

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL client error', error);
});

const pokemonSchema = z
  .object({
    id: z.number(),
    name: z.string(),
  })
  .passthrough();

async function ensureCapturedPokemonTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS captured_pokemon (
      pokemon_id INTEGER PRIMARY KEY,
      data JSONB NOT NULL,
      captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// rotas...
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ... demais rotas omitidas para brevidade

async function main() {
  try {
    await ensureCapturedPokemonTable();

    const server = app.listen(PORT, () => {
      console.log(`API listening on port ${PORT}`);
    });

    process.on('SIGINT', () => shutdown(server));
    process.on('SIGTERM', () => shutdown(server));
  } catch (error) {
    console.error('Failed to initialise database', error);
    process.exit(1);
  }
}

async function shutdown(server) {
  server.close();
  try {
    await pool.end();
  } catch (err) {
    console.error('Error closing PostgreSQL connection pool', err);
  } finally {
    process.exit(0);
  }
}

main();