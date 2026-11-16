/**
 * Frescura de los datos: cuándo se actualizó cada fuente y si está vieja.
 * Módulo sin dependencias del navegador: lo usan la web y los scripts de Node.
 */

// Límites a partir de los cuales un dato se considera viejo.
export const LIMITES_HORAS = {
  // 72 h cubre el fin de semana: el lunes a las 7 a. m. lo último es del viernes.
  ventanilla: 72,
  oficial: 96,
};
export const LIMITE_DIAS_COMBUSTIBLE = 45;

const MS_HORA = 3_600_000;

/** "08/09/2026 08:20 a.m." (hora de Costa Rica, como la publica el BCCR) → Date */
export function parseFechaEntidad(valor) {
  if (typeof valor !== "string") return null;
  const m = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2})\s+(a\.m\.|p\.m\.)$/i);
  if (!m) return null;
  const [, dd, mm, yyyy, hh, min, meridiano] = m;
  let horas = Number(hh) % 12;
  if (meridiano.toLowerCase() === "p.m.") horas += 12;
  // Costa Rica es UTC-6 todo el año (sin horario de verano).
  return new Date(Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd), horas + 6, Number(min)));
}

export function horasDesde(fecha, ahora = new Date()) {
  const d = fecha instanceof Date ? fecha : new Date(fecha);
  if (Number.isNaN(d.getTime())) return null;
  return (ahora.getTime() - d.getTime()) / MS_HORA;
}

/** "hace 5 minutos", "hace 3 horas", "hace 68 días" */
export function tiempoDesde(fecha, ahora = new Date()) {
  const h = horasDesde(fecha, ahora);
  if (h === null) return null;
  const min = Math.floor(h * 60);
  if (min < 1) return "hace menos de un minuto";
  if (min < 60) return `hace ${min} minuto${min !== 1 ? "s" : ""}`;
  if (h < 48) {
    const horas = Math.floor(h);
    return `hace ${horas} hora${horas !== 1 ? "s" : ""}`;
  }
  return `hace ${Math.floor(h / 24)} días`;
}

/** "9 sep" o "9 sep 2025" si es de otro año */
export function fechaCorta(fecha, ahora = new Date()) {
  const d = fecha instanceof Date ? fecha : new Date(fecha);
  if (Number.isNaN(d.getTime())) return "";
  const opciones = { day: "numeric", month: "short", timeZone: "America/Costa_Rica" };
  if (d.getFullYear() !== ahora.getFullYear()) opciones.year = "numeric";
  return d.toLocaleDateString("es-CR", opciones).replace(".", "");
}

/** Fecha más reciente publicada por alguna entidad de ventanilla. */
function ultimaFechaEntidades(entidades = []) {
  let max = null;
  for (const e of entidades) {
    const d = parseFechaEntidad(e.ultimaActualizacion);
    if (d && (!max || d > max)) max = d;
  }
  return max;
}

/**
 * Estado de ventanilla y del tipo oficial a partir de tipo-cambio.json.
 * Ventanilla usa la fecha que publican las entidades (lo que ve el usuario);
 * si no hay, la fecha en que corrió el scraper.
 */
export function estadoTipoCambio(data, ahora = new Date()) {
  const ventanilla =
    ultimaFechaEntidades(data.entidades) ??
    (data.ventanillaActualizada ? new Date(data.ventanillaActualizada) : null);
  const ultimoOficial = data.historico?.at(-1) ?? null;
  const oficial = ultimoOficial ? new Date(`${ultimoOficial.fecha}T12:00:00-06:00`) : null;

  const hVentanilla = ventanilla ? horasDesde(ventanilla, ahora) : Infinity;
  const hOficial = oficial ? horasDesde(oficial, ahora) : Infinity;

  return {
    ventanilla: {
      fecha: ventanilla,
      vieja: hVentanilla > LIMITES_HORAS.ventanilla,
    },
    oficial: {
      fecha: oficial,
      compra: ultimoOficial?.compra ?? null,
      venta: ultimoOficial?.venta ?? null,
      vieja: hOficial > LIMITES_HORAS.oficial,
    },
  };
}

export function entidadVieja(entidad, ahora = new Date()) {
  const d = parseFechaEntidad(entidad.ultimaActualizacion);
  return !d || horasDesde(d, ahora) > LIMITES_HORAS.ventanilla;
}
