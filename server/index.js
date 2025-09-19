import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";
import { z } from "zod";

dotenv.config();

const PORT = process.env.PORT ?? 4000;
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is not set.");
  process.exit(1);
}

const { Pool } = pkg;
const pool = new Pool({ connectionString: DATABASE_URL });

// Logs para entender o comportamento do pool
pool.on("connect", () => {
  console.log("✅ Novo cliente conectado ao Postgres");
});
pool.on("acquire", () => {
  console.log("🔗 Cliente adquirido do pool");
});
pool.on("remove", () => {
  console.log("❌ Cliente removido do pool");
});
pool.on("error", (err) => {
  console.error("🔥 Erro inesperado no pool do Postgres", err);
});

const pokemonSchema = z
  .object({
    id: z.number(),
    name: z.string(),
  })
  .passthrough();

async function ensureCapturedPokemonTable() {
  console.log("🔄 Verificando/Inicializando tabela captured_pokemon...");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS captured_pokemon (
      pokemon_id INTEGER PRIMARY KEY,
      data JSONB NOT NULL,
      captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  console.log("✅ Tabela captured_pokemon pronta");
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// ==================== Rotas ====================
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// (coloque aqui as outras rotas /api/captured, etc. se já tiver)

// ==================== Inicialização ====================
async function main() {
  try {
    await ensureCapturedPokemonTable();

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 API ouvindo na porta ${PORT}`);
    });

    // Forçar um handle no loop para confirmar se o processo fecha sozinho
    setInterval(() => {
      console.log("⏳ Servidor ainda ativo...");
    }, 5000);

    process.on("SIGINT", () => shutdown(server));
    process.on("SIGTERM", () => shutdown(server));
  } catch (error) {
    console.error("❌ Erro ao inicializar aplicação", error);
  }
}

async function shutdown(server) {
  console.log("⚠️ Encerrando servidor...");
  server.close();
  try {
    await pool.end();
    console.log("✅ Pool de conexões fechado");
  } catch (err) {
    console.error("🔥 Erro fechando pool", err);
  } finally {
    process.exit(0);
  }
}

main();