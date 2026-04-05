/**
 * scrape-tc-diario.js
 * Versión liviana: consulta el tipo de cambio de los últimos 7 días al BCCR
 * y actualiza src/data/tipo-cambio.json solo si hay datos nuevos o modificados.
 *
 * Diseñado para ejecutarse frecuentemente (cada 10 min en GitHub Actions).
 * No escribe el archivo si no hubo cambio → git diff queda limpio → no hay commit.
 *
 * Uso:
 *   BCCR_EMAIL=tu@correo.com BCCR_TOKEN=TUTOKEN node scripts/scrape-tc-diario.js
 */

import axios from "axios";
import { parseStringPromise } from "xml2js";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Credenciales ──────────────────────────────────────────────────────────────
const EMAIL = process.env.BCCR_EMAIL ?? "johndoe@gmail.com";
const TOKEN = process.env.BCCR_TOKEN ?? "JOHNDOE";

// ── Constantes ────────────────────────────────────────────────────────────────
const BASE_URL =
  "https://gee.bccr.fi.cr/Indicadores/Suscripciones/WS/wsindicadoreseconomicos.asmx/ObtenerIndicadoresEconomicos";
const INDICADOR_COMPRA = "317";
const INDICADOR_VENTA = "318";
const DATA_PATH = join(__dirname, "../src/data/tipo-cambio.json");

// ── Helpers ───────────────────────────────────────────────────────────────────

function toBCCRDate(date) {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${d}/${m}/${date.getFullYear()}`;
}

function parseISODate(str) {
  return str ? str.slice(0, 10) : null;
}

async function fetchIndicador(indicador, inicio, fin) {
  const response = await axios.get(BASE_URL, {
    params: {
      Indicador: indicador,
      FechaInicio: inicio,
      FechaFinal: fin,
      Nombre: "micambio-cr",
      SubNiveles: "N",
      CorreoElectronico: EMAIL,
      Token: TOKEN,
    },
    timeout: 30_000,
  });

  if (
    typeof response.data === "string" &&
    response.data.includes("<DataSet") &&
    response.data.includes("Error")
  ) {
    throw new Error(
      `BCCR rechazó la solicitud (indicador ${indicador}). ` +
        `Verificá BCCR_EMAIL y BCCR_TOKEN.`
    );
  }

  const parsed = await parseStringPromise(response.data, {
    explicitArray: false,
  });
  const innerXml = parsed?.string?._ ?? parsed?.string;
  if (!innerXml) {
    throw new Error(
      `Respuesta inesperada del BCCR para indicador ${indicador}.`
    );
  }

  const inner = await parseStringPromise(innerXml, { explicitArray: false });
  const tabla = inner?.Datos?.INGC011_CAT_INDICADORECONOMIC;
  if (!tabla) return [];

  return (Array.isArray(tabla) ? tabla : [tabla]).map((f) => ({
    fecha: parseISODate(f.DES_FECHA),
    valor: parseFloat(f.NUM_VALOR),
  }));
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  // Rango: últimos 7 días (cubre fines de semana y feriados)
  const hoy = new Date();
  const hace7 = new Date(hoy);
  hace7.setDate(hoy.getDate() - 7);

  const inicio = toBCCRDate(hace7);
  const fin = toBCCRDate(hoy);
  console.log(`Consultando BCCR (${inicio} → ${fin})…`);

  const [compraData, ventaData] = await Promise.all([
    fetchIndicador(INDICADOR_COMPRA, inicio, fin),
    fetchIndicador(INDICADOR_VENTA, inicio, fin),
  ]);

  if (compraData.length === 0 && ventaData.length === 0) {
    console.log("Sin datos del BCCR para el período (feriado o fin de semana). Sin cambios.");
    return;
  }

  // Mapas fecha → valor para los datos frescos
  const mapaCompra = Object.fromEntries(
    compraData.map(({ fecha, valor }) => [fecha, valor])
  );
  const mapaVenta = Object.fromEntries(
    ventaData.map(({ fecha, valor }) => [fecha, valor])
  );
  const fechasNuevas = [
    ...new Set([...Object.keys(mapaCompra), ...Object.keys(mapaVenta)]),
  ].filter(Boolean);

  // Cargar JSON existente
  const data = existsSync(DATA_PATH)
    ? JSON.parse(readFileSync(DATA_PATH, "utf-8"))
    : { ultimaActualizacion: null, bancos: [], historico: [] };

  // Índice del histórico existente por fecha
  const indice = Object.fromEntries(
    data.historico.map((e, i) => [e.fecha, i])
  );

  let cambios = 0;

  for (const fecha of fechasNuevas) {
    const compra = mapaCompra[fecha] ?? null;
    const venta = mapaVenta[fecha] ?? null;
    const idx = indice[fecha];

    if (idx !== undefined) {
      // Fecha ya existe: actualizar solo si los valores difieren
      const existente = data.historico[idx];
      if (existente.compra !== compra || existente.venta !== venta) {
        data.historico[idx] = { fecha, compra, venta };
        cambios++;
      }
    } else {
      // Fecha nueva: agregar al histórico
      data.historico.push({ fecha, compra, venta });
      cambios++;
    }
  }

  if (cambios === 0) {
    console.log("Sin cambios en el tipo de cambio. Archivo no modificado.");
    return;
  }

  // Reordenar cronológicamente y actualizar timestamp
  data.historico.sort((a, b) => a.fecha.localeCompare(b.fecha));
  data.ultimaActualizacion = new Date().toISOString();

  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");

  const ultimo = data.historico.at(-1);
  console.log(`✓ tipo-cambio.json actualizado (${cambios} entrada/s modificada/s).`);
  console.log(
    `  Último: ${ultimo.fecha} | Compra ₡${ultimo.compra} | Venta ₡${ultimo.venta}`
  );
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
