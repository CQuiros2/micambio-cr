/**
 * scrape-tc-inicial.js
 * Descarga el histórico oficial de tipo de cambio (compra/venta) de los últimos
 * 2 años usando la API nueva del SDDE del BCCR y lo guarda en src/data/tipo-cambio.json.
 *
 * Requiere:
 *   BCCR_API_TOKEN
 *
 * Uso local recomendado:
 *   node --env-file=.env.local scripts/scrape-tc-inicial.js
 *
 * Nota:
 *   Este script migra únicamente indicadores oficiales 317 y 318.
 *   El tipo de cambio de ventanilla por entidad sigue temporalmente por scraping
 *   en scripts/scrape-tc-ventanilla.js.
 */

import { writeFileSync, mkdirSync, readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { fetchIndicadorSeries, getHistoricalRange } from "./lib/bccr-sdde.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const INDICADOR_COMPRA = "317";
const INDICADOR_VENTA = "318";

function buildHistorico(compraData, ventaData) {
  const mapaCompra = Object.fromEntries(compraData.map(({ fecha, valor }) => [fecha, valor]));
  const mapaVenta = Object.fromEntries(ventaData.map(({ fecha, valor }) => [fecha, valor]));
  const fechas = [...new Set([...Object.keys(mapaCompra), ...Object.keys(mapaVenta)])]
    .filter(Boolean)
    .sort();

  return fechas.map((fecha) => ({
    fecha,
    compra: mapaCompra[fecha] ?? null,
    venta: mapaVenta[fecha] ?? null,
  }));
}

function loadExistingData(outPath) {
  if (!existsSync(outPath)) {
    return { ultimaActualizacion: null, bancos: [], historico: [] };
  }

  return JSON.parse(readFileSync(outPath, "utf-8"));
}

async function main() {
  const { inicio, fin } = getHistoricalRange(2);
  console.log(`Consultando histórico oficial SDDE del BCCR (${inicio} -> ${fin})...`);

  const [compraData, ventaData] = await Promise.all([
    fetchIndicadorSeries(INDICADOR_COMPRA, inicio, fin),
    fetchIndicadorSeries(INDICADOR_VENTA, inicio, fin),
  ]);

  const historico = buildHistorico(compraData, ventaData);

  if (historico.length === 0) {
    throw new Error("La API del BCCR no devolvió histórico para el rango solicitado.");
  }

  const outDir = join(__dirname, "../src/data");
  mkdirSync(outDir, { recursive: true });

  const outPath = join(outDir, "tipo-cambio.json");
  const existing = loadExistingData(outPath);
  const output = {
    ...existing,
    historico,
    ultimaActualizacion: new Date().toISOString(),
  };

  writeFileSync(outPath, JSON.stringify(output, null, 2), "utf-8");

  console.log("✓ Guardado en src/data/tipo-cambio.json");
  console.log(`  Registros históricos: ${historico.length}`);
  console.log(`  Registro más reciente: ${historico.at(-1)?.fecha ?? "desconocido"}`);
  console.log("  Ventanilla por entidad sigue temporalmente por scraping en un flujo separado.");
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
