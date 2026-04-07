import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const TC_PATH = join(ROOT, "src/data/tipo-cambio.json");
const COMBUSTIBLE_PATH = join(ROOT, "src/data/combustible.json");

function loadJson(path) {
  return JSON.parse(readFileSync(path, "utf-8"));
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function daysBetween(from, to = new Date()) {
  return Math.floor((to.getTime() - from.getTime()) / 86_400_000);
}

function parseIsoDate(value, fieldName) {
  const date = new Date(value);
  assert(!Number.isNaN(date.getTime()), `Fecha ISO inválida en ${fieldName}: ${value}`);
  return date;
}

function parseEntityTimestamp(value) {
  if (typeof value !== "string") return null;
  const match = value.match(
    /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})\s+(a\.m\.|p\.m\.)$/i
  );
  if (!match) return null;

  const [, dd, mm, yyyy, hh, min, meridiem] = match;
  let hours = Number(hh);
  if (meridiem.toLowerCase() === "p.m." && hours !== 12) hours += 12;
  if (meridiem.toLowerCase() === "a.m." && hours === 12) hours = 0;

  return new Date(
    Number(yyyy),
    Number(mm) - 1,
    Number(dd),
    hours,
    Number(min),
    0,
    0
  );
}

function validateTipoCambio() {
  const data = loadJson(TC_PATH);
  const updatedAt = parseIsoDate(data.ultimaActualizacion, "tipo-cambio.ultimaActualizacion");
  const updatedDays = daysBetween(updatedAt);

  assert(Array.isArray(data.entidades) && data.entidades.length > 0, "tipo-cambio.json no tiene entidades.");
  assert(Array.isArray(data.historico) && data.historico.length > 0, "tipo-cambio.json no tiene histórico oficial.");
  assert(data.mejorCompra?.nombre && typeof data.mejorCompra?.valor === "number", "mejorCompra inválido.");
  assert(data.mejorVenta?.nombre && typeof data.mejorVenta?.valor === "number", "mejorVenta inválido.");
  assert(updatedDays <= 5, `tipo-cambio.json parece stale: última actualización hace ${updatedDays} días.`);

  let staleEntities = 0;
  let invalidEntityDates = 0;

  for (const entity of data.entidades) {
    assert(typeof entity.nombre === "string" && entity.nombre.length > 0, "Entidad sin nombre.");
    assert(typeof entity.tipoEntidad === "string" && entity.tipoEntidad.length > 0, `Entidad sin tipo: ${entity.nombre}`);
    assert(typeof entity.compra === "number" && entity.compra > 0, `Compra inválida en ${entity.nombre}`);
    assert(typeof entity.venta === "number" && entity.venta > 0, `Venta inválida en ${entity.nombre}`);
    assert(entity.venta >= entity.compra, `Venta menor que compra en ${entity.nombre}`);
    assert(typeof entity.diferencial === "number" && entity.diferencial >= 0, `Diferencial inválido en ${entity.nombre}`);

    const delta = Math.abs(entity.diferencial - (entity.venta - entity.compra));
    assert(delta < 0.02, `Diferencial inconsistente en ${entity.nombre}`);

    const entityDate = parseEntityTimestamp(entity.ultimaActualizacion);
    if (!entityDate) {
      invalidEntityDates++;
      continue;
    }

    if (daysBetween(entityDate) > 14) staleEntities++;
  }

  const bestCompra = data.entidades.reduce((a, b) => (b.compra > a.compra ? b : a));
  const bestVenta = data.entidades.reduce((a, b) => (b.venta < a.venta ? b : a));
  assert(bestCompra.nombre === data.mejorCompra.nombre && bestCompra.compra === data.mejorCompra.valor, "mejorCompra no coincide con entidades.");
  assert(bestVenta.nombre === data.mejorVenta.nombre && bestVenta.venta === data.mejorVenta.valor, "mejorVenta no coincide con entidades.");

  const latestOfficial = data.historico.at(-1);
  assert(typeof latestOfficial.fecha === "string", "Última fecha oficial inválida.");
  const latestOfficialDate = parseIsoDate(`${latestOfficial.fecha}T00:00:00Z`, "tipo-cambio.historico[-1].fecha");
  const latestOfficialDays = daysBetween(latestOfficialDate);
  assert(latestOfficialDays <= 7, `Histórico oficial del BCCR parece stale: último día ${latestOfficial.fecha}.`);
  assert(typeof latestOfficial.compra === "number" && typeof latestOfficial.venta === "number", "Último histórico oficial inválido.");

  console.log(`[tc] OK: ${data.entidades.length} entidades, histórico hasta ${latestOfficial.fecha}, actualizado hace ${updatedDays} día(s).`);
  if (staleEntities > 0 || invalidEntityDates > 0) {
    console.log(`[tc] Aviso: ${staleEntities} entidad(es) con timestamp > 14 días y ${invalidEntityDates} timestamp(s) no parseables.`);
  }
}

function validateCombustible() {
  const data = loadJson(COMBUSTIBLE_PATH);
  const updatedAt = parseIsoDate(data.ultimaActualizacion, "combustible.ultimaActualizacion");
  const updatedDays = daysBetween(updatedAt);
  const fuelKeys = ["super", "regular", "diesel", "gaslp"];

  assert(data.precios && typeof data.precios === "object", "combustible.json no tiene precios.");
  assert(Array.isArray(data.historico) && data.historico.length > 0, "combustible.json no tiene histórico.");
  assert(updatedDays <= 45, `combustible.json parece stale: última actualización hace ${updatedDays} días.`);

  for (const key of fuelKeys) {
    const current = data.precios[key];
    assert(current?.label, `Falta label de combustible ${key}.`);
    assert(typeof current?.precio === "number" && current.precio > 0, `Precio inválido en combustible ${key}.`);
  }

  for (const entry of data.historico) {
    assert(typeof entry.fecha === "string", "Entrada de histórico de combustible sin fecha.");
    for (const key of fuelKeys) {
      assert(entry[key] === null || typeof entry[key] === "number", `Histórico de combustible inválido en ${entry.fecha}/${key}.`);
    }
  }

  const latest = data.historico.at(-1);
  const latestDate = parseIsoDate(`${latest.fecha}T00:00:00Z`, "combustible.historico[-1].fecha");
  const latestDays = daysBetween(latestDate);
  assert(latestDays <= 60, `Histórico de combustibles parece stale: último día ${latest.fecha}.`);

  for (const key of fuelKeys) {
    assert(data.precios[key].precio === latest[key], `Precio actual de ${key} no coincide con el último histórico.`);
  }

  console.log(`[combustible] OK: histórico hasta ${latest.fecha}, actualizado hace ${updatedDays} día(s).`);
}

function main() {
  const target = process.argv[2] ?? "all";

  if (target === "tc" || target === "all") validateTipoCambio();
  if (target === "combustible" || target === "all") validateCombustible();
}

main();
