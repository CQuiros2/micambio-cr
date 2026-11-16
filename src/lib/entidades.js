import tcData from "../data/tipo-cambio.json";
import { diaCR } from "./formato.js";

export const entidades = (tcData.entidades ?? []).filter((e) => e.compra > 0 && e.venta > 0);

// Mismo criterio que el scraper: ante empate gana la primera de la lista.
export const mejorCompra = entidades.reduce((a, b) => (b.compra > a.compra ? b : a), entidades[0]);
export const mejorVenta = entidades.reduce((a, b) => (b.venta < a.venta ? b : a), entidades[0]);

/** Filtros de la tabla: clave del texto traducido y prefijo de tipoEntidad. */
export const FILTROS = [
  { clave: "todas", prefijo: "" },
  { clave: "bancos", prefijo: "Bancos" },
  { clave: "fin", prefijo: "Financieras" },
  { clave: "mut", prefijo: "Mutuales" },
  { clave: "coop", prefijo: "Cooperativas" },
  { clave: "casas", prefijo: "Casas" },
  { clave: "pb", prefijo: "Puestos" },
].filter((fl) => !fl.prefijo || entidades.some((e) => e.tipoEntidad.startsWith(fl.prefijo)));

export const esHoyIsoCR = (iso, ahora = new Date()) => iso === diaCR(ahora);
