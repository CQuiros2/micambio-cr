/*
 * URL del logo de cada entidad para la web. Las reglas viven en logos-reglas.js;
 * aquí solo se resuelven a los archivos de src/assets/logos/ que Vite empaqueta.
 */
import { claveLogo } from "./logos-reglas.js";

export { inicialesDe } from "./logos-reglas.js";

const ARCHIVOS = Object.fromEntries(
  Object.entries(import.meta.glob("../assets/logos/*.{png,svg}", { eager: true, import: "default" })).map(([ruta, url]) => [
    ruta.split("/").pop().replace(/\.[^.]+$/, ""),
    url,
  ])
);

/** URL del logo de la entidad, o null si no hay. */
export function logoDe(nombre) {
  const clave = claveLogo(nombre);
  return clave ? ARCHIVOS[clave] ?? null : null;
}
