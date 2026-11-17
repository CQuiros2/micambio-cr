/*
 * Qué logo le toca a cada entidad. Módulo sin dependencias del navegador ni de
 * Vite: lo usan la web (logos.js) y el aviso de logos faltantes
 * (scripts/revisar-logos.js). Los archivos están en src/assets/logos/<clave>.(png|svg).
 *
 * La asociación es por palabras clave del nombre normalizado, para que siga
 * funcionando si el BCCR cambia "S.A.", mayúsculas o el orden del nombre.
 */

// [patrón sobre el nombre normalizado, clave del archivo]. Gana el primero que coincide.
export const REGLAS = [
  [/banco de costa rica/, "banco-de-costa-rica"],
  [/banco nacional|^bn valores/, "banco-nacional"],
  [/banco popular|popular valores/, "banco-popular"],
  [/\bbac\b/, "bac"],
  [/\bbct\b/, "bct"],
  [/davivienda/, "davivienda"],
  [/davibank/, "davibank"],
  [/cathay/, "banco-cathay"],
  [/banco general/, "banco-general"],
  [/improsa/, "improsa"],
  [/lafise/, "lafise"],
  [/promerica/, "promerica"],
  [/\bcmb\b|citi/, "citi"], // Banco CMB es la filial de Citi en Costa Rica
  [/cafsa/, "cafsa"],
  [/comeca/, "comeca"],
  [/multimoney/, "multimoney"],
  [/mutual alajuela|grupo mutual/, "grupo-mutual"],
  [/mutual cartago|mucap/, "mucap"],
  [/coope ?ande/, "coopeande"],
  [/coopecaja/, "coopecaja"],
  [/coopemep/, "coopemep"],
  [/coocique/, "coocique"],
  [/coopealianza/, "coopealianza"],
  [/credecoop/, "credecoop"],
  [/coopenae/, "coopenae"],
  [/san marcos/, "san-marcos"],
  [/airpak/, "airpak"],
  [/\bari\b/, "ari"],
  [/\bwiz\b/, "wiz"],
  [/global exchange/, "global-exchange"],
  [/teledolar/, "teledolar"],
  [/mercado (de )?valores/, "mercado-valores"],
  [/\bsama\b/, "sama"],
  [/prival/, "prival"],
];

export function normalizarNombre(nombre) {
  return nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Clave del archivo de logo que le corresponde a la entidad, o null si ninguna regla coincide. */
export function claveLogo(nombre) {
  const n = normalizarNombre(nombre);
  return REGLAS.find(([patron]) => patron.test(n))?.[1] ?? null;
}

const GENERICAS = new Set(["banco", "casa", "de", "cambio", "financiera", "cooperativa", "mutual", "grupo", "puesto", "bolsa", "valores", "y", "s", "a", "r", "l"]);

/** Iniciales para cuando no hay logo: "Financiera Nueva S.A." → "NU". */
export function inicialesDe(nombre) {
  const palabras = normalizarNombre(nombre).split(" ").filter((p) => p && !GENERICAS.has(p));
  if (palabras.length === 0) return "?";
  return (palabras.length === 1 ? palabras[0].slice(0, 2) : palabras[0][0] + palabras[1][0]).toUpperCase();
}
