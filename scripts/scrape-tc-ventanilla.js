/**
 * scrape-tc-ventanilla.js
 * Tipo de cambio anunciado en ventanilla por cada intermediario cambiario.
 * Fuente: cuadro "Lista de intermediarios cambiarios autorizados y sus tipos de
 * cambio vigentes de ventanilla" del sitio del BCCR
 * (https://sdd.bccr.fi.cr/es/IndicadoresEconomicos/Inicio/Contenedor/2039).
 *
 * gee.bccr.fi.cr dejó de responder en septiembre de 2026; el sitio nuevo es una
 * SPA que consume la API interna de apim.bccr.fi.cr, que es la que usamos aquí.
 *
 * Uso: node scripts/scrape-tc-ventanilla.js
 * npm:  npm run scrape:tc
 */

import { getConReintentos } from "./lib/http.js";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const API_BASE = "https://apim.bccr.fi.cr/SDDE/api/Bccr.GE.SDDE.IndicadoresSitioExterno";
const URL_TOKEN = `${API_BASE}.ServiciosUsuario.API/Token/GenereCSRF`;
const URL_CUADRO = `${API_BASE}.GrupoVariables.API/CuadroPersonalizadoGrupoVariables/ObtenerDatosCuadroPersonalizado`;
const ID_GRUPO_VENTANILLA = 1015;

// La API responde 500 si no se envían los mismos encabezados que manda el sitio.
const HEADERS_BCCR = {
  Origin: "https://sdd.bccr.fi.cr",
  Referer: "https://sdd.bccr.fi.cr/",
  Accept: "application/json, text/plain, */*",
  "User-Agent": "Mozilla/5.0 (compatible; micambio-cr)",
};

const DATA_PATH = join(__dirname, "../src/data/tipo-cambio.json");

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Parsea "456,00" → 456 */
function parsePrecio(str) {
  const n = parseFloat(str.replace(",", "."));
  return isNaN(n) ? null : n;
}

// ── Consulta a la API del BCCR ────────────────────────────────────────────────

/** Fecha de hoy en Costa Rica (UTC-6, sin horario de verano) como aaaa-mm-dd */
function hoyCostaRica() {
  return new Date(Date.now() - 6 * 3_600_000).toISOString().slice(0, 10);
}

async function obtenerTokenCsrf() {
  const { data } = await getConReintentos(URL_TOKEN, {
    headers: HEADERS_BCCR,
    responseType: "text",
    timeout: 20_000,
  });
  const token = String(data).trim().replace(/^"|"$/g, "");
  if (!token.includes(".")) throw new Error("El BCCR no devolvió un token CSRF válido.");
  return token;
}

async function scrapeVentanilla() {
  const token = await obtenerTokenCsrf();
  const { data } = await getConReintentos(URL_CUADRO, {
    params: { idGrupoVariable: ID_GRUPO_VENTANILLA, fechaAConsultar: hoyCostaRica() },
    headers: { ...HEADERS_BCCR, token_csrf: token },
    timeout: 30_000,
  });

  if (!data?.estado || !Array.isArray(data?.datos?.indicadores)) {
    throw new Error(`Respuesta inesperada del BCCR: ${JSON.stringify(data).slice(0, 200)}`);
  }

  // Cada fila es una lista de celdas. Las filas de una sola celda son el tipo de
  // entidad ("Bancos públicos", …); las de cinco son: entidad, compra, venta,
  // diferencial y última actualización. La primera fila es el encabezado.
  const entidades = [];
  let tipoActual = "";

  for (const fila of data.datos.indicadores) {
    const celdas = fila.map((c) => String(c.valorEspanol ?? "").replace(/\s+/g, " ").trim());

    if (celdas.length === 1) {
      tipoActual = celdas[0];
      continue;
    }
    if (celdas.length < 5 || celdas[0] === "Entidad autorizada") continue;

    const [nombre, txtCompra, txtVenta, txtDiferencial, ultimaActualizacion] = celdas;
    const compra = parsePrecio(txtCompra);
    const venta = parsePrecio(txtVenta);
    if (!nombre || compra === null || venta === null) continue;

    entidades.push({
      tipoEntidad: tipoActual,
      nombre,
      compra,
      venta,
      diferencial: parsePrecio(txtDiferencial) ?? Math.round((venta - compra) * 100) / 100,
      ultimaActualizacion,
    });
  }

  return entidades;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Consultando tipo de cambio en ventanilla (BCCR)…");

  const entidades = await scrapeVentanilla();

  if (entidades.length === 0) {
    throw new Error("El BCCR no devolvió entidades de ventanilla.");
  }

  // Mejor compra: paga MÁS colones al comprar dólares del cliente
  const mejorCompra = entidades.reduce((a, b) => (b.compra > a.compra ? b : a));
  // Mejor venta: cobra MENOS colones al vender dólares al cliente
  const mejorVenta = entidades.reduce((a, b) => (b.venta < a.venta ? b : a));

  // Preservar lo que escribe el script del tipo oficial (histórico y su fecha)
  const existente = existsSync(DATA_PATH)
    ? JSON.parse(readFileSync(DATA_PATH, "utf-8"))
    : { historico: [] };

  const ahora = new Date().toISOString();
  const output = {
    ...existente,
    ultimaActualizacion: ahora,
    ventanillaActualizada: ahora,
    entidades,
    mejorCompra: { nombre: mejorCompra.nombre, valor: mejorCompra.compra },
    mejorVenta:  { nombre: mejorVenta.nombre,  valor: mejorVenta.venta  },
    historico: existente.historico ?? [],
  };

  mkdirSync(join(__dirname, "../src/data"), { recursive: true });
  writeFileSync(DATA_PATH, JSON.stringify(output, null, 2), "utf-8");

  // Resumen
  const porTipo = entidades.reduce((acc, e) => {
    acc[e.tipoEntidad] = (acc[e.tipoEntidad] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`\n✓ Guardado en src/data/tipo-cambio.json`);
  console.log(`  Total entidades: ${entidades.length}`);
  for (const [tipo, count] of Object.entries(porTipo)) {
    console.log(`    ${tipo.padEnd(22)}: ${count}`);
  }
  console.log(`\n  Mejor compra → ${mejorCompra.nombre}: ₡${mejorCompra.compra}`);
  console.log(`  Mejor venta  → ${mejorVenta.nombre}: ₡${mejorVenta.venta}`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
