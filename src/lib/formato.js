import { parseFechaEntidad } from "./frescura.js";

const TZ = "America/Costa_Rica";
const LOCALES = { es: "es-CR", en: "en-US" };

/** "Banco Cathay de Costa Rica S.A." → "Banco Cathay de Costa Rica" */
export function nombreCorto(nombre) {
  return nombre.replace(/,?\s*(S\.\s?A\.?|R\.\s?L\.?|Limitada)\s*$/i, "").trim();
}

/** Día calendario en Costa Rica, "aaaa-mm-dd". */
export const diaCR = (d) => d.toLocaleDateString("en-CA", { timeZone: TZ });

export const fechaDeIso = (iso) => new Date(`${iso}T12:00:00-06:00`);

/** Formateadores ligados a un idioma ("es" | "en"). */
export function crearFormato(idioma) {
  const loc = LOCALES[idioma] ?? LOCALES.es;

  // En español, como el BCCR: punto para miles y coma para decimales (₡44.406,10).
  // "es-CR" usa un espacio fino para los miles; se cambia por punto.
  const numero = (n, decimales = 2) => {
    const s = n.toLocaleString(loc, { minimumFractionDigits: decimales, maximumFractionDigits: decimales });
    return idioma === "es" ? s.replace(/[\s\u00a0\u202f]/g, ".") : s;
  };

  const hora = (d) => {
    const h = d.toLocaleTimeString(loc, { hour: "numeric", minute: "2-digit", hour12: true, timeZone: TZ }).replace(/\s+/g, " ");
    return idioma === "es" ? h.replace(/a\.\s?m\./i, "a.m.").replace(/p\.\s?m\./i, "p.m.") : h;
  };

  // "9 nov" / "Nov 9"
  const diaMes = (d) => d.toLocaleDateString(loc, { day: "numeric", month: "short", timeZone: TZ }).replace(".", "");

  return {
    numero,
    colones: (n, decimales = 2) => `₡${numero(n, decimales)}`,
    dolares: (n) => `$${numero(n, 2)}`,
    hora,
    diaMes,
    fechaIso: (iso) => diaMes(fechaDeIso(iso)),
    mes: (iso) => fechaDeIso(iso).toLocaleDateString(loc, { month: "long", timeZone: TZ }),
    // "lunes 16 nov, 3:34 p.m." / "Monday, Nov 16, 3:34 PM"
    fechaLarga: (d) => {
      const dia = d.toLocaleDateString(loc, { weekday: "long", day: "numeric", month: "short", timeZone: TZ }).replace(".", "");
      return `${idioma === "es" ? dia.replace(",", "") : dia}, ${hora(d)}`;
    },
    /** Actualización de una entidad: si es de hoy da la hora; si no, la fecha. */
    cuandoEntidad: (entidad, ahora = new Date()) => {
      const d = parseFechaEntidad(entidad.ultimaActualizacion);
      if (!d) return { hoy: false, hora: null, fecha: entidad.ultimaActualizacion ?? "" };
      return { hoy: diaCR(d) === diaCR(ahora), hora: hora(d), fecha: diaMes(d) };
    },
  };
}
