import combustibleData from "../data/combustible.json";
import { fechaDeIso } from "./formato.js";

const { precios, historico = [] } = combustibleData;

const TIPOS = [
  { clave: "super", color: "#3F659C" },
  { clave: "regular", color: "#B53E36" },
  { clave: "diesel", color: "#2D7A5B" },
  { clave: "gaslp", color: "#9A5B34" },
];

/*
 * Contra qué precio se mide el ajuste. ARESEP hace un ajuste grande al mes y a
 * veces una corrección de ₡1 días después; comparar con el registro inmediato
 * anterior mostraría "−₡1". Se compara con el último registro de al menos 20
 * días antes del vigente, que es el precio antes del ajuste mensual.
 */
const DIAS_MIN = 20;
export const vigente = historico.at(-1) ?? null;
export const referencia = vigente
  ? [...historico].reverse().find((h) => (fechaDeIso(vigente.fecha) - fechaDeIso(h.fecha)) / 86_400_000 >= DIAS_MIN) ?? historico.at(-2) ?? null
  : null;

/** Combustibles con precio vigente, precio anterior al último ajuste y la diferencia. */
export const combustibles = TIPOS.filter((c) => precios[c.clave]).map((c) => {
  const precio = precios[c.clave].precio;
  const anterior = typeof referencia?.[c.clave] === "number" ? referencia[c.clave] : null;
  return { ...c, precio, anterior, ajuste: anterior === null ? precios[c.clave].variacion ?? null : precio - anterior };
});
