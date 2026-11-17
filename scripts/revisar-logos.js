/**
 * revisar-logos.js
 * Revisa que cada entidad de ventanilla tenga logo. Si el BCCR agrega una
 * entidad nueva, la web le muestra sus iniciales hasta que le pongamos logo;
 * este script lo detecta, escribe logos.md y sale con código 1.
 *
 * Lo usa el workflow "Salud de datos" para abrir o cerrar un issue con la
 * etiqueta "logo-faltante".
 *
 * Uso: node scripts/revisar-logos.js
 */

import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { claveLogo } from "../src/lib/logos-reglas.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const tc = JSON.parse(readFileSync(join(ROOT, "src/data/tipo-cambio.json"), "utf-8"));
const archivos = new Set(readdirSync(join(ROOT, "src/assets/logos")).map((f) => f.replace(/\.(png|svg)$/, "")));

const faltantes = (tc.entidades ?? [])
  .map((e) => ({ nombre: e.nombre, tipo: e.tipoEntidad, clave: claveLogo(e.nombre) }))
  .filter((e) => !e.clave || !archivos.has(e.clave));

const reporte =
  faltantes.length === 0
    ? `Todas las entidades tienen logo (${tc.entidades.length}).\n`
    : `Hay **${faltantes.length}** entidad(es) sin logo. En la página se muestran sus iniciales.

| Entidad | Tipo | Qué falta |
|---|---|---|
${faltantes.map((e) => `| ${e.nombre} | ${e.tipo} | ${e.clave ? `el archivo \`src/assets/logos/${e.clave}.png\`` : "una regla en `src/lib/logos-reglas.js`"} |`).join("\n")}

Para agregarlo: guarde el logo oficial como \`src/assets/logos/<clave>.png\` (96×96) y, si hace falta, agregue la regla en \`REGLAS\`. Detalles en \`docs/DISENO.md\`, sección "Logos de las entidades".

_Revisado el ${new Date().toISOString()} por el workflow "Salud de datos". Este issue se cierra solo cuando todas tienen logo._
`;

writeFileSync(join(ROOT, "logos.md"), reporte, "utf-8");
console.log(reporte);
process.exit(faltantes.length > 0 ? 1 : 0);
