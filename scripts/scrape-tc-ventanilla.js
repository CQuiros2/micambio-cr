/**
 * scrape-tc-ventanilla.js
 * Scrapea el tipo de cambio anunciado en ventanilla del BCCR.
 * Fuente: https://gee.bccr.fi.cr/IndicadoresEconomicos/Cuadros/frmConsultaTCVentanilla.aspx
 *
 * Extrae todas las entidades (bancos, financieras, cooperativas, casas de cambio,
 * puestos de bolsa y mutuales) con sus tipos de compra, venta y diferencial.
 *
 * Uso: node scripts/scrape-tc-ventanilla.js
 * npm:  npm run scrape:tc
 */

import axios from "axios";
import * as cheerio from "cheerio";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const URL_VENTANILLA =
  "https://gee.bccr.fi.cr/IndicadoresEconomicos/Cuadros/frmConsultaTCVentanilla.aspx";

const DATA_PATH = join(__dirname, "../src/data/tipo-cambio.json");

// ── Slugs para Clearbit Logo API ──────────────────────────────────────────────
// Uso: https://logo.clearbit.com/{slug}
const SLUG_MAP = {
  // Bancos públicos
  "banco de costa rica":                                      "bancobcr.com",
  "banco nacional de costa rica":                             "bncr.fi.cr",
  "banco popular y de desarrollo comunal":                    "bancopopular.fi.cr",

  // Bancos privados
  "banco bac san josé s.a.":                                  "bac.cr",
  "banco bct s.a.":                                           "bancobct.com",
  "banco cathay de costa rica s.a.":                          "cathay.fi.cr",
  "banco cmb":                                                "bancocmb.fi.cr",
  "banco davivienda (costa rica) s.a":                        "davivienda.com",
  "banco general (costa rica) s.a.":                          "bgeneral.com",
  "banco improsa s.a.":                                       "improsa.com",
  "banco lafise s.a.":                                        "lafise.com",
  "banco promérica s.a.":                                     "promerica.fi.cr",
  "davibank de costa rica s.a.":                              "davibank.com",

  // Financieras
  "financiera cafsa s.a.":                                    "cafsa.fi.cr",
  "financiera comeca s.a.":                                   "comeca.fi.cr",
  "financiera multimoney s.a.":                               "multimoney.fi.cr",

  // Mutuales
  "grupo mutual alajuela - la vivienda de ahorro y préstamo": "grupomutualalajuela.fi.cr",
  "mutual cartago de ahorro y préstamo":                      "mutualcartago.fi.cr",

  // Cooperativas
  "coope-ande n°1 r.l.":                                      "coopeande.com",
  "coopecaja r.l.":                                           "coopecaja.fi.cr",
  "coopemep r.l.":                                            "coopemep.fi.cr",
  "cooperativa coocique r.l.":                                "coocique.fi.cr",
  "cooperativa coopealianza r.l.":                            "coopealianza.fi.cr",
  "cooperativa credecoop r.l.":                               "credecoop.fi.cr",
  "cooperativa nacional de educadores r.l. (coopenae)":       "coopenae.fi.cr",
  "cooperativa san marcos r.l.":                              "cosanmarcos.fi.cr",

  // Casas de cambio
  "airpak casa de cambio":                                    "airpak.com",
  "ari casa de cambio internacional s.a.":                    "ari.cr",
  "casa de cambio cambia con wiz limitada":                   "cambioswiz.com",
  "casa de cambio global exchange":                           "globalexchange.com",
  "casa de cambio teledolar s. a.":                           "teledolar.com",

  // Puestos de bolsa
  "bct valores, puesto de bolsa, s.a.":                       "bctvalores.com",
  "bn valores s.a., puesto de bolsa":                         "bnvalores.com",
  "mercado valores de costa rica puesto de bolsa":            "mercadovalores.fi.cr",
  "pb inversiones sama":                                      "pbisamacr.com",
  "popular valores, puesto de bolsa":                         "popularvalores.fi.cr",
  "prival securities puesto de bolsa s.a":                    "prival.com",
};

// Palabras que identifican una fila como encabezado de categoría
const PREFIJOS_CATEGORIA = [
  "Bancos públicos",
  "Bancos privados",
  "Financieras",
  "Mutuales",
  "Cooperativas",
  "Casas de Cambio",
  "Puestos de Bolsa",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Texto limpio de una celda: sin &nbsp;, sin espacios múltiples */
function texto(el, $) {
  return $(el)
    .text()
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Parsea "456,00" → 456 */
function parsePrecio(str) {
  const n = parseFloat(str.replace(",", "."));
  return isNaN(n) ? null : n;
}

/** Normaliza nombre → slug */
function resolverSlug(nombre) {
  const key = nombre.toLowerCase().trim();

  if (SLUG_MAP[key]) return SLUG_MAP[key];

  for (const [k, slug] of Object.entries(SLUG_MAP)) {
    if (key.includes(k) || k.includes(key)) return slug;
  }

  return (
    nombre
      .toLowerCase()
      .replace(
        /\b(s\.a\.|r\.l\.|s\. a\.|banco|financiera|cooperativa|casa de cambio|puesto de bolsa)\b/g,
        ""
      )
      .replace(/[^a-z0-9]/g, "")
      .trim() + ".com"
  );
}

/** Detecta si un texto corresponde a una categoría de entidad */
function esCategoria(str) {
  return PREFIJOS_CATEGORIA.some((p) => str.startsWith(p));
}

// ── Scraping ──────────────────────────────────────────────────────────────────

async function scrapeVentanilla() {
  const response = await axios.get(URL_VENTANILLA, {
    responseType: "arraybuffer",
    timeout: 20_000,
    headers: { "Accept-Language": "es-CR,es;q=0.9" },
  });

  // La página sirve UTF-8 (a pesar de ser ASP.NET clásico)
  const html = Buffer.from(response.data).toString("utf8");
  const $ = cheerio.load(html, { decodeEntities: true });

  const entidades = [];
  let tipoActual = "";

  // Buscar la tabla que contiene el encabezado "Tipo de Entidad" / "Entidad Autorizada"
  // Usamos children("td") en cada fila para NO capturar TDs de tablas anidadas
  let tablaVentanilla = null;

  $("table").each((_, tabla) => {
    const txt = $(tabla).children("tbody, tr").first().text();
    if (
      $(tabla).text().includes("Tipo de Entidad") &&
      $(tabla).text().includes("Entidad Autorizada") &&
      $(tabla).text().includes("Compra")
    ) {
      // Preferir la tabla más interna (la que tiene filas con 6 celdas directas)
      $(tabla)
        .find("tr")
        .each((_, fila) => {
          if ($(fila).children("td").length === 6) {
            tablaVentanilla = tabla;
            return false;
          }
        });
    }
  });

  if (!tablaVentanilla) {
    throw new Error("No se encontró la tabla de ventanilla en la página del BCCR.");
  }

  $(tablaVentanilla)
    .find("tr")
    .each((_, fila) => {
      // CLAVE: children("td") — solo celdas directas, ignora tablas anidadas
      const celdas = $(fila).children("td");
      if (celdas.length !== 6) return;

      const celda0 = texto(celdas[0], $);
      const celda1 = texto(celdas[1], $);
      const celda2 = texto(celdas[2], $);
      const celda3 = texto(celdas[3], $);
      const celda4 = texto(celdas[4], $);
      const celda5 = texto(celdas[5], $);

      // Encabezado de columnas
      if (celda0 === "Tipo de Entidad") return;

      // Si celda0 tiene un tipo de entidad, actualizamos el tipo actual
      if (esCategoria(celda0)) tipoActual = celda0;

      // Validar nombre de entidad
      const nombre = celda1;
      if (!nombre || nombre === "Entidad Autorizada") return;

      const compra = parsePrecio(celda2);
      const venta = parsePrecio(celda3);
      if (compra === null || venta === null) return;

      const diferencial =
        parsePrecio(celda4) ?? Math.round((venta - compra) * 100) / 100;
      const ultimaActualizacion = celda5;

      entidades.push({
        tipoEntidad: tipoActual,
        nombre,
        slug: resolverSlug(nombre),
        compra,
        venta,
        diferencial,
        ultimaActualizacion,
      });
    });

  return entidades;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Consultando tipo de cambio en ventanilla (BCCR)…");

  const entidades = await scrapeVentanilla();

  if (entidades.length === 0) {
    throw new Error("No se encontraron entidades en la página.");
  }

  // Mejor compra: paga MÁS colones al comprar dólares del cliente
  const mejorCompra = entidades.reduce((a, b) => (b.compra > a.compra ? b : a));
  // Mejor venta: cobra MENOS colones al vender dólares al cliente
  const mejorVenta = entidades.reduce((a, b) => (b.venta < a.venta ? b : a));

  // Preservar histórico existente
  let historicoExistente = [];
  if (existsSync(DATA_PATH)) {
    const existing = JSON.parse(readFileSync(DATA_PATH, "utf-8"));
    historicoExistente = existing.historico ?? [];
  }

  const output = {
    ultimaActualizacion: new Date().toISOString(),
    entidades,
    mejorCompra: { nombre: mejorCompra.nombre, valor: mejorCompra.compra },
    mejorVenta:  { nombre: mejorVenta.nombre,  valor: mejorVenta.venta  },
    historico: historicoExistente,
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
