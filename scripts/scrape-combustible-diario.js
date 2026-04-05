/**
 * scrape-combustible-diario.js
 * Versión liviana: consulta la API de ARESEP y actualiza src/data/combustible.json
 * solo si hay una nueva fecha de publicación.
 *
 * Se ejecuta el 2do viernes de cada mes vía GitHub Actions.
 * No escribe el archivo si no hubo cambio → git diff queda limpio → no hay commit.
 *
 * Uso: node scripts/scrape-combustible-diario.js
 */

import axios from "axios";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Constantes ────────────────────────────────────────────────────────────────
const API_URL =
  "https://datos.aresep.go.cr/ws.datosabiertos/Services/IE/TarifaCombustible.svc/ObtenerHistoricoTarifasHidrocarburos";
const DATA_PATH = join(__dirname, "../src/data/combustible.json");

const COMBUSTIBLES = {
  super: {
    label: "Gasolina Super",
    nombres: ["Gasolina RON 95", "Gasolina RON 95 ", "Gasolina súper"],
  },
  regular: {
    label: "Gasolina Regular",
    nombres: ["Gasolina RON 91", "Gasolina RON 91 ", "Gasolina plus 91"],
  },
  diesel: {
    label: "Diésel",
    nombres: [
      "Diésel para uso automotriz de 50 ppm de azufre",
      "Diésel 50 ppm de azufre",
      "Diésel 15 ppm de azufre",
      "Diésel 15",
      "Diésel 0,05% S",
      "Diésel ",
    ],
  },
  gaslp: {
    label: "Gas LP",
    nombres: ["LPG (70-30)", "LPG -mezcla 70-30", "Gas Licuado de Petróleo"],
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function extraerPrecio(fila) {
  const p = fila.precioFinal;
  if (p && p > 0) return p;
  const g = fila.precioConsumidorFinalGas;
  if (g && g > 0) return g;
  return null;
}

function calcularPrecios(historico) {
  const precios = {};
  for (const [tipo, { label }] of Object.entries(COMBUSTIBLES)) {
    let ultimo = null;
    let penultimo = null;
    for (let i = historico.length - 1; i >= 0; i--) {
      const p = historico[i][tipo];
      if (p !== null) {
        if (ultimo === null) ultimo = p;
        else if (penultimo === null) { penultimo = p; break; }
      }
    }
    const variacion =
      ultimo !== null && penultimo !== null
        ? Math.round((ultimo - penultimo) * 100) / 100
        : null;
    precios[tipo] = { label, precio: ultimo, variacion };
  }
  return precios;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Consultando API de ARESEP…");
  const response = await axios.get(API_URL, { timeout: 60_000 });

  const filas = response.data?.value;
  if (!Array.isArray(filas) || filas.length === 0) {
    throw new Error("La API de ARESEP no devolvió datos.");
  }

  // Construir lookups de nombre → tipo y prioridad
  const nombreATipo = {};
  const prioridadPorTipo = {};
  for (const [tipo, { nombres }] of Object.entries(COMBUSTIBLES)) {
    prioridadPorTipo[tipo] = Object.fromEntries(
      nombres.map((n, i) => [n, i])
    );
    for (const nombre of nombres) {
      if (!(nombre in nombreATipo)) nombreATipo[nombre] = tipo;
    }
  }

  // Encontrar la fecha de publicación más reciente en la API
  const fechasDisponibles = new Set();
  for (const fila of filas) {
    const tipo = nombreATipo[fila.producto];
    if (!tipo) continue;
    if (extraerPrecio(fila)) fechasDisponibles.add(fila.fechaPublicacion);
  }

  if (fechasDisponibles.size === 0) {
    throw new Error("No se encontraron registros con precio en la API.");
  }

  const fechaMasReciente = [...fechasDisponibles].sort().at(-1);

  // Cargar JSON existente
  const data = existsSync(DATA_PATH)
    ? JSON.parse(readFileSync(DATA_PATH, "utf-8"))
    : { ultimaActualizacion: null, precios: {}, historico: [] };

  // ¿Ya tenemos esta fecha en el histórico?
  const ultimoHistorico = data.historico.at(-1);
  if (ultimoHistorico?.fecha === fechaMasReciente) {
    console.log(
      `Sin cambios: la fecha más reciente (${fechaMasReciente}) ya está en el histórico.`
    );
    return;
  }

  console.log(`Nueva publicación detectada: ${fechaMasReciente}`);

  // Extraer precios para esa fecha concreta
  const entrada = { fecha: fechaMasReciente, super: null, regular: null, diesel: null, gaslp: null };
  const mejorPrioridad = {};

  for (const fila of filas) {
    if (fila.fechaPublicacion !== fechaMasReciente) continue;
    const tipo = nombreATipo[fila.producto];
    if (!tipo) continue;
    const precio = extraerPrecio(fila);
    if (!precio) continue;
    const prioridad = prioridadPorTipo[tipo][fila.producto];
    if (mejorPrioridad[tipo] === undefined || prioridad < mejorPrioridad[tipo]) {
      entrada[tipo] = precio;
      mejorPrioridad[tipo] = prioridad;
    }
  }

  // Agregar al histórico y actualizar precios actuales
  data.historico.push(entrada);
  data.historico.sort((a, b) => a.fecha.localeCompare(b.fecha));
  data.precios = calcularPrecios(data.historico);
  data.ultimaActualizacion = new Date().toISOString();

  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");

  console.log(`✓ combustible.json actualizado.`);
  console.log(`  Registros históricos: ${data.historico.length}`);
  console.log("  Precios nuevos:");
  for (const [tipo, info] of Object.entries(data.precios)) {
    const variStr =
      info.variacion !== null
        ? ` (${info.variacion >= 0 ? "+" : ""}${info.variacion})`
        : "";
    console.log(`    ${info.label.padEnd(18)}: ₡${info.precio}${variStr}`);
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
