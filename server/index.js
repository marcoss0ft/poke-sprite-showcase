import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";
import { z } from "zod";

dotenv.config();

const PORT = process.env.PORT ?? 4000;
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is not set.");
  process.exit(1);
}

const { Pool } = pkg;
const pool = new Pool({ connectionString: DATABASE_URL });

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL client error", error);
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
app.use(express.json({ limit: "1mb" }));

// ==================== Rotas ====================

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/captured", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT data, captured_at FROM captured_pokemon ORDER BY captured_at DESC"
    );

    res.json(
      result.rows.map((row) => ({
        ...row.data,
        captured_at: row.captured_at,
      }))
    );
  } catch (error) {
    console.error("Failed to fetch captured Pokémon", error);
    res
      .status(500)
      .json({ status: "error", message: "Falha ao buscar Pokémon capturados." });
  }
});

app.post("/api/captured", async (req, res) => {
  try {
    const pokemon = pokemonSchema.parse(req.body);

    try {
      await pool.query(
        "INSERT INTO captured_pokemon (pokemon_id, data) VALUES ($1, $2)",
        [pokemon.id, pokemon]
      );

      res.status(201).json({ status: "captured", pokemon });
    } catch (error) {
      if (error.code === "23505") {
        const existing = await pool.query(
          "SELECT data, captured_at FROM captured_pokemon WHERE pokemon_id = $1",
          [pokemon.id]
        );

        if (existing.rowCount === 0) {
          res.status(500).json({
            status: "error",
            message: "Pokémon já existia, mas não pôde ser recuperado.",
          });
          return;
        }

        res.status(200).json({
          status: "already_captured",
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
        status: "error",
        message: "Payload de Pokémon inválido.",
        details: error.flatten(),
      });
      return;
    }

    console.error("Failed to persist captured Pokémon", error);
    res.status(500).json({ status: "error", message: "Falha ao capturar Pokémon." });
  }
});

app.delete("/api/captured/:id", async (req, res) => {
  const pokemonId = Number.parseInt(req.params.id, 10);

  if (Number.isNaN(pokemonId)) {
    res
      .status(400)
      .json({ status: "error", message: "ID de Pokémon inválido." });
    return;
  }

  try {
    const result = await pool.query(
      "DELETE FROM captured_pokemon WHERE pokemon_id = $1 RETURNING data",
      [pokemonId]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ status: "error", message: "Pokémon não encontrado." });
      return;
    }

    res.json({ status: "released", pokemon: result.rows[0].data });
  } catch (error) {
    console.error("Failed to release Pokémon", error);
    res.status(500).json({ status: "error", message: "Falha ao liberar Pokémon." });
  }
});

// ==================== Inicialização ====================

async function main() {
  try {
    await ensureCapturedPokemonTable();

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`API listening on port ${PORT}`);
    });

    process.on("SIGINT", () => shutdown(server));
    process.on("SIGTERM", () => shutdown(server));
  } catch (error) {
    console.error("Failed to initialise database", error);
    process.exit(1);
  }
}

async function shutdown(server) {
  console.log("Shutting down gracefully...");
  server.close();
  try {
    await pool.end();
  } catch (err) {
    console.error("Error closing PostgreSQL connection pool", err);
  } finally {
    process.exit(0);
  }
}

main();