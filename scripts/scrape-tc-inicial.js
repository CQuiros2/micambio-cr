/**
 * scrape-tc-inicial.js
 * Descarga el historial de tipo de cambio (compra/venta) del BCCR
 * para los últimos 2 años y lo guarda en src/data/tipo-cambio.json
 *
 * Uso: node scripts/scrape-tc-inicial.js
 *
 * Reemplazá BCCR_EMAIL y BCCR_TOKEN con tus credenciales reales,
 * o definílas como variables de entorno:
 *   BCCR_EMAIL=tu@correo.com BCCR_TOKEN=TUTOKEN node scripts/scrape-tc-inicial.js
 */

import axios from "axios";
import { parseStringPromise } from "xml2js";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Credenciales ─────────────────────────────────────────────────────────────
const EMAIL = process.env.BCCR_EMAIL ?? "johndoe@gmail.com";
const TOKEN = process.env.BCCR_TOKEN ?? "JOHNDOE";

// ── Constantes ────────────────────────────────────────────────────────────────
const BASE_URL =
  "https://gee.bccr.fi.cr/Indicadores/Suscripciones/WS/wsindicadoreseconomicos.asmx/ObtenerIndicadoresEconomicos";

const INDICADOR_COMPRA = "317";
const INDICADOR_VENTA = "318";

// ── Helpers de fecha ──────────────────────────────────────────────────────────

/** Formatea un Date como "DD/MM/YYYY" (formato que acepta el BCCR) */
function toBCCRDate(date) {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

/** Convierte "YYYY-MM-DDThh:mm:ss" (respuesta BCCR) a "YYYY-MM-DD" */
function parseISODate(str) {
  if (!str) return null;
  return str.slice(0, 10);
}

/** Calcula fechas: hoy y hace exactamente 2 años */
function getDateRange() {
  const hoy = new Date();
  const hace2Anos = new Date(hoy);
  hace2Anos.setFullYear(hoy.getFullYear() - 2);
  return { inicio: toBCCRDate(hace2Anos), fin: toBCCRDate(hoy) };
}

// ── Consulta al BCCR ──────────────────────────────────────────────────────────

/**
 * Trae los datos de un indicador para el rango de fechas dado.
 * Devuelve un array de { fecha: "YYYY-MM-DD", valor: number }.
 */
async function fetchIndicador(indicador, inicio, fin) {
  const params = {
    Indicador: indicador,
    FechaInicio: inicio,
    FechaFinal: fin,
    Nombre: "micambio-cr",
    SubNiveles: "N",
    CorreoElectronico: EMAIL,
    Token: TOKEN,
  };

  const response = await axios.get(BASE_URL, { params, timeout: 30_000 });

  // La respuesta es XML envuelto en JSON-string dentro de un nodo <string>
  const parsed = await parseStringPromise(response.data, {
    explicitArray: false,
  });

  // El cuerpo real viene como string XML dentro de parsed.string._
  // Si la respuesta trae un DataSet de error (credenciales inválidas u otro)
  if (
    typeof response.data === "string" &&
    response.data.includes("<DataSet") &&
    response.data.includes("Error")
  ) {
    throw new Error(
      `El BCCR rechazó la solicitud para el indicador ${indicador}.\n` +
        `Verificá que EMAIL y TOKEN sean válidos.\n` +
        `Registrate en: https://gee.bccr.fi.cr/Indicadores/Suscripciones/Home/ObtenerToken`
    );
  }

  const innerXml = parsed?.string?._ ?? parsed?.string;
  if (!innerXml) {
    throw new Error(
      `Respuesta inesperada para indicador ${indicador}:\n${response.data}`
    );
  }

  const inner = await parseStringPromise(innerXml, { explicitArray: false });
  const tabla = inner?.Datos?.INGC011_CAT_INDICADORECONOMIC;

  if (!tabla) return [];

  const filas = Array.isArray(tabla) ? tabla : [tabla];

  return filas.map((fila) => ({
    fecha: parseISODate(fila.DES_FECHA),
    valor: parseFloat(fila.NUM_VALOR),
  }));
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const { inicio, fin } = getDateRange();
  console.log(`Consultando BCCR del ${inicio} al ${fin}…`);

  const [compraData, ventaData] = await Promise.all([
    fetchIndicador(INDICADOR_COMPRA, inicio, fin),
    fetchIndicador(INDICADOR_VENTA, inicio, fin),
  ]);

  // Combinar por fecha en un mapa
  const mapaCompra = Object.fromEntries(
    compraData.map(({ fecha, valor }) => [fecha, valor])
  );
  const mapaVenta = Object.fromEntries(
    ventaData.map(({ fecha, valor }) => [fecha, valor])
  );

  // Unión de todas las fechas presentes en alguno de los dos indicadores
  const todasFechas = [
    ...new Set([...Object.keys(mapaCompra), ...Object.keys(mapaVenta)]),
  ]
    .filter(Boolean)
    .sort(); // orden cronológico

  const historico = todasFechas.map((fecha) => ({
    fecha,
    compra: mapaCompra[fecha] ?? null,
    venta: mapaVenta[fecha] ?? null,
  }));

  const ultimaFecha = historico.at(-1)?.fecha ?? "desconocida";

  const output = {
    ultimaActualizacion: new Date().toISOString(),
    bancos: [],
    historico,
  };

  // Asegurar que el directorio existe
  const outDir = join(__dirname, "../src/data");
  mkdirSync(outDir, { recursive: true });

  const outPath = join(outDir, "tipo-cambio.json");
  writeFileSync(outPath, JSON.stringify(output, null, 2), "utf-8");

  console.log(`\n✓ Guardado en src/data/tipo-cambio.json`);
  console.log(`  Registros históricos: ${historico.length}`);
  console.log(`  Registro más reciente: ${ultimaFecha}`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
