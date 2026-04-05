/**
 * scrape-combustible-inicial.js
 * Descarga el historial de precios de combustibles desde la API de ARESEP
 * y lo guarda en src/data/combustible.json
 *
 * Uso: node scripts/scrape-combustible-inicial.js
 *
 * Fuente: API abierta de ARESEP (no requiere autenticación)
 * https://datos.aresep.go.cr/ws.datosabiertos/Services/IE/TarifaCombustible.svc/ObtenerHistoricoTarifasHidrocarburos
 */

import axios from "axios";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Constantes ────────────────────────────────────────────────────────────────

const API_URL =
  "https://datos.aresep.go.cr/ws.datosabiertos/Services/IE/TarifaCombustible.svc/ObtenerHistoricoTarifasHidrocarburos";

/**
 * Mapeo de cada tipo de combustible a sus posibles nombres en la API,
 * ordenados de más reciente/prioritario a más antiguo.
 * Se usa el primer nombre que tenga precio válido en cada fecha.
 */
const COMBUSTIBLES = {
  super: {
    label: "Gasolina Super",
    nombres: [
      "Gasolina RON 95",
      "Gasolina RON 95 ",
      "Gasolina súper",
    ],
  },
  regular: {
    label: "Gasolina Regular",
    nombres: [
      "Gasolina RON 91",
      "Gasolina RON 91 ",
      "Gasolina plus 91",
    ],
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
    nombres: [
      "LPG (70-30)",
      "LPG -mezcla 70-30",
      "Gas Licuado de Petróleo",
    ],
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Devuelve la fecha de hace exactamente N años como "YYYY-MM-DD" */
function fechaHaceAnios(n) {
  const d = new Date();
  d.setFullYear(d.getFullYear() - n);
  return d.toISOString().slice(0, 10);
}

/** Extrae el precio final de una fila (distintos campos según producto) */
function extraerPrecio(fila) {
  const p = fila.precioFinal;
  if (p && p > 0) return p;
  const g = fila.precioConsumidorFinalGas;
  if (g && g > 0) return g;
  return null;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Descargando datos de ARESEP…");
  const response = await axios.get(API_URL, { timeout: 60_000 });

  const filas = response.data?.value;
  if (!Array.isArray(filas) || filas.length === 0) {
    throw new Error("La API no devolvió datos en el campo 'value'.");
  }
  console.log(`  Total registros en la API: ${filas.length}`);

  // Límite: últimos 2 años
  const fechaCorte = fechaHaceAnios(2);
  console.log(`  Filtrando desde: ${fechaCorte}`);

  // Construir mapa: { fecha -> { super: precio, regular: precio, ... } }
  // Para cada tipo, construimos un lookup: nombreProducto -> tipo
  const nombreATipo = {};
  for (const [tipo, { nombres }] of Object.entries(COMBUSTIBLES)) {
    for (const nombre of nombres) {
      // No sobrescribir: el primero en la lista tiene prioridad
      if (!(nombre in nombreATipo)) nombreATipo[nombre] = tipo;
    }
  }

  // Para cada tipo, construimos un Map de prioridad: nombreProducto -> posición
  const prioridadPorTipo = {};
  for (const [tipo, { nombres }] of Object.entries(COMBUSTIBLES)) {
    prioridadPorTipo[tipo] = Object.fromEntries(
      nombres.map((nombre, idx) => [nombre, idx])
    );
  }

  // Acumular por fecha: { fecha: { tipo: { precio, prioridad } } }
  const porFecha = {};

  for (const fila of filas) {
    const fecha = fila.fechaPublicacion;
    if (!fecha || fecha < fechaCorte) continue;

    const producto = fila.producto;
    const tipo = nombreATipo[producto];
    if (!tipo) continue;

    const precio = extraerPrecio(fila);
    if (!precio) continue;

    const prioridad = prioridadPorTipo[tipo][producto];

    if (!porFecha[fecha]) porFecha[fecha] = {};
    const actual = porFecha[fecha][tipo];

    // Quedarse con la entrada de mayor prioridad (menor índice)
    if (!actual || prioridad < actual.prioridad) {
      porFecha[fecha][tipo] = { precio, prioridad };
    }
  }

  // Convertir a array ordenado cronológicamente
  const fechas = Object.keys(porFecha).sort();

  const historico = fechas.map((fecha) => {
    const entry = porFecha[fecha];
    return {
      fecha,
      super: entry.super?.precio ?? null,
      regular: entry.regular?.precio ?? null,
      diesel: entry.diesel?.precio ?? null,
      gaslp: entry.gaslp?.precio ?? null,
    };
  });

  if (historico.length === 0) {
    throw new Error("No se encontraron registros en el rango de 2 años.");
  }

  // Precios actuales: último registro con valor no nulo por tipo
  const precioActual = {};
  const precioAnterior = {};

  for (const tipo of Object.keys(COMBUSTIBLES)) {
    // Buscar de atrás hacia adelante el último y penúltimo precio
    let ultimo = null;
    let penultimo = null;
    for (let i = historico.length - 1; i >= 0; i--) {
      const p = historico[i][tipo];
      if (p !== null) {
        if (ultimo === null) {
          ultimo = p;
        } else if (penultimo === null) {
          penultimo = p;
          break;
        }
      }
    }
    precioActual[tipo] = ultimo;
    precioAnterior[tipo] = penultimo;
  }

  const precios = {};
  for (const [tipo, { label }] of Object.entries(COMBUSTIBLES)) {
    const actual = precioActual[tipo];
    const anterior = precioAnterior[tipo];
    const variacion =
      actual !== null && anterior !== null
        ? Math.round((actual - anterior) * 100) / 100
        : null;

    precios[tipo] = {
      label,
      precio: actual,
      variacion,
    };
  }

  const output = {
    ultimaActualizacion: new Date().toISOString(),
    precios,
    historico,
  };

  // Guardar archivo
  const outDir = join(__dirname, "../src/data");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "combustible.json");
  writeFileSync(outPath, JSON.stringify(output, null, 2), "utf-8");

  // Resumen en consola
  const ultimaFecha = historico.at(-1).fecha;
  console.log(`\n✓ Guardado en src/data/combustible.json`);
  console.log(`  Registros históricos: ${historico.length}`);
  console.log(`  Registro más reciente: ${ultimaFecha}`);
  console.log("\n  Precios actuales:");
  for (const [tipo, info] of Object.entries(precios)) {
    const variStr =
      info.variacion !== null
        ? ` (${info.variacion > 0 ? "+" : ""}${info.variacion} vs anterior)`
        : "";
    console.log(
      `    ${info.label.padEnd(18)}: ₡${info.precio}${variStr}`
    );
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
