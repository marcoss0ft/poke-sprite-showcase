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
const pool = new Pool({
  connectionString: DATABASE_URL,
});

// Prevent the process from crashing when the database connection resets.
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

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/captured', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT data, captured_at FROM captured_pokemon ORDER BY captured_at DESC'
    );

    res.json(
      result.rows.map((row) => ({
        ...row.data,
        captured_at: row.captured_at,
      }))
    );
  } catch (error) {
    console.error('Failed to fetch captured Pokémon', error);
    res.status(500).json({ status: 'error', message: 'Falha ao buscar Pokémon capturados.' });
  }
});

app.post('/api/captured', async (req, res) => {
  try {
    const pokemon = pokemonSchema.parse(req.body);

    try {
      await pool.query(
        'INSERT INTO captured_pokemon (pokemon_id, data) VALUES ($1, $2)',
        [pokemon.id, pokemon]
      );

      res.status(201).json({ status: 'captured', pokemon });
    } catch (error) {
      if (error.code === '23505') {
        const existing = await pool.query(
          'SELECT data, captured_at FROM captured_pokemon WHERE pokemon_id = $1',
          [pokemon.id]
        );

        if (existing.rowCount === 0) {
          res.status(500).json({
            status: 'error',
            message: 'Pokémon já existia, mas não pôde ser recuperado.',
          });
          return;
        }

        res.status(200).json({
          status: 'already_captured',
          pokemon: existing.rows[0].data,
          captured_at: existing.rows[0].captured_at,
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        status: 'error',
        message: 'Payload de Pokémon inválido.',
        details: error.flatten(),
      });
      return;
    }

    console.error('Failed to persist captured Pokémon', error);
    res.status(500).json({ status: 'error', message: 'Falha ao capturar Pokémon.' });
  }
});

app.delete('/api/captured/:id', async (req, res) => {
  const pokemonId = Number.parseInt(req.params.id, 10);

  if (Number.isNaN(pokemonId)) {
    res.status(400).json({ status: 'error', message: 'ID de Pokémon inválido.' });
    return;
  }

  try {
    const result = await pool.query(
      'DELETE FROM captured_pokemon WHERE pokemon_id = $1 RETURNING data',
      [pokemonId]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ status: 'error', message: 'Pokémon não encontrado.' });
      return;
    }

    res.json({ status: 'released', pokemon: result.rows[0].data });
  } catch (error) {
    console.error('Failed to release Pokémon', error);
    res.status(500).json({ status: 'error', message: 'Falha ao liberar Pokémon.' });
  }
});

try {
  await ensureCapturedPokemonTable();
} catch (error) {
  console.error('Failed to initialise database', error);
  process.exit(1);
}

const server = app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});

// Ensure the HTTP server keeps the Node.js event loop alive.
if (typeof server.ref === 'function') {
  server.ref();
}

server.on('close', () => {
  console.log('HTTP server closed.');
});

async function shutdown() {
  server.close();
  try {
    await pool.end();
  } catch (shutdownError) {
    console.error('Error closing PostgreSQL connection pool', shutdownError);
  } finally {
    process.exit(0);
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

process.on('beforeExit', (code) => {
  const handles = process._getActiveHandles?.() ?? [];
  console.log('Process beforeExit event with code', code);
  if (handles.length === 0) {
    console.log('No active handles remain.');
  } else {
    console.log('Active handles:');
    for (const handle of handles) {
      console.log('-', handle.constructor?.name ?? typeof handle);
    }
  }
});

process.on('exit', (code) => {
  console.log('Process exit event with code', code);
});
