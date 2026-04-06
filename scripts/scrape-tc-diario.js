/**
 * scrape-tc-diario.js
 * Consulta el tipo de cambio oficial diario (compra/venta) desde la API nueva
 * del SDDE del BCCR y actualiza src/data/tipo-cambio.json solo si hay cambios.
 *
 * Requiere:
 *   BCCR_API_TOKEN
 *
 * Uso local recomendado:
 *   node --env-file=.env.local scripts/scrape-tc-diario.js
 *
 * Nota:
 *   Este script migra únicamente los indicadores oficiales 317 y 318.
 *   El tipo de cambio de ventanilla por entidad sigue temporalmente por scraping
 *   en scripts/scrape-tc-ventanilla.js.
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { fetchIndicadorSeries, getRecentRange } from "./lib/bccr-sdde.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const INDICADOR_COMPRA = "317";
const INDICADOR_VENTA = "318";
const DATA_PATH = join(__dirname, "../src/data/tipo-cambio.json");

function loadExistingData() {
  if (!existsSync(DATA_PATH)) {
    return { ultimaActualizacion: null, bancos: [], historico: [] };
  }

  return JSON.parse(readFileSync(DATA_PATH, "utf-8"));
}

function mergeHistorico(existingHistorico, compraData, ventaData) {
  const indice = Object.fromEntries(existingHistorico.map((entry, i) => [entry.fecha, i]));
  const mapaCompra = Object.fromEntries(compraData.map(({ fecha, valor }) => [fecha, valor]));
  const mapaVenta = Object.fromEntries(ventaData.map(({ fecha, valor }) => [fecha, valor]));
  const fechas = [...new Set([...Object.keys(mapaCompra), ...Object.keys(mapaVenta)])]
    .filter(Boolean)
    .sort();

  let cambios = 0;
  const historico = [...existingHistorico];

  for (const fecha of fechas) {
    const compra = mapaCompra[fecha] ?? null;
    const venta = mapaVenta[fecha] ?? null;
    const idx = indice[fecha];

    if (idx !== undefined) {
      const actual = historico[idx];
      if (actual.compra !== compra || actual.venta !== venta) {
        historico[idx] = { fecha, compra, venta };
        cambios++;
      }
    } else {
      historico.push({ fecha, compra, venta });
      cambios++;
    }
  }

  historico.sort((a, b) => a.fecha.localeCompare(b.fecha));

  return { historico, cambios };
}

async function main() {
  const { inicio, fin } = getRecentRange(7);
  console.log(`Consultando API SDDE del BCCR (${inicio} -> ${fin})...`);

  const [compraData, ventaData] = await Promise.all([
    fetchIndicadorSeries(INDICADOR_COMPRA, inicio, fin),
    fetchIndicadorSeries(INDICADOR_VENTA, inicio, fin),
  ]);

  if (compraData.length === 0 && ventaData.length === 0) {
    console.log("La API no devolvió series para el período consultado. Se preserva el JSON actual.");
    return;
  }

  const data = loadExistingData();
  const { historico, cambios } = mergeHistorico(data.historico ?? [], compraData, ventaData);

  if (cambios === 0) {
    console.log("Sin cambios en el histórico oficial. Archivo no modificado.");
    return;
  }

  const output = {
    ...data,
    historico,
    ultimaActualizacion: new Date().toISOString(),
  };

  writeFileSync(DATA_PATH, JSON.stringify(output, null, 2), "utf-8");

  const ultimo = historico.at(-1);
  console.log(`✓ tipo-cambio.json actualizado (${cambios} entrada/s modificada/s).`);
  console.log(
    `  Último oficial: ${ultimo.fecha} | Compra ₡${ultimo.compra} | Venta ₡${ultimo.venta}`
  );
  console.log("  Ventanilla por entidad sigue temporalmente por scraping en un flujo separado.");
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
