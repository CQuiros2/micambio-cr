/*
 * Logo de cada entidad. Los archivos están en src/assets/logos/ (PNG 96×96 de
 * los logos oficiales; SVG propios donde no se pudo obtener el original).
 * La asociación es por palabras clave del nombre normalizado, para que siga
 * funcionando si el BCCR cambia "S.A.", mayúsculas o el orden del nombre.
 */
const ARCHIVOS = Object.fromEntries(
  Object.entries(import.meta.glob("../assets/logos/*.{png,svg}", { eager: true, import: "default" })).map(([ruta, url]) => [
    ruta.split("/").pop().replace(/\.[^.]+$/, ""),
    url,
  ])
);

// [patrón sobre el nombre normalizado, archivo]. Gana el primero que coincide.
const REGLAS = [
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
  [/\bcmb\b/, "banco-cmb"],
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

/** URL del logo de la entidad, o null si no hay. */
export function logoDe(nombre) {
  const n = normalizarNombre(nombre);
  const regla = REGLAS.find(([patron]) => patron.test(n));
  return regla ? ARCHIVOS[regla[1]] ?? null : null;
}

const GENERICAS = new Set(["banco", "casa", "de", "cambio", "financiera", "cooperativa", "mutual", "grupo", "puesto", "bolsa", "valores", "y", "s", "a", "r", "l"]);

/** Iniciales para cuando no hay logo: "Financiera Nueva S.A." → "NU". */
export function inicialesDe(nombre) {
  const palabras = normalizarNombre(nombre).split(" ").filter((p) => p && !GENERICAS.has(p));
  if (palabras.length === 0) return "?";
  return (palabras.length === 1 ? palabras[0].slice(0, 2) : palabras[0][0] + palabras[1][0]).toUpperCase();
}
