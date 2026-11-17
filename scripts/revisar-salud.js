/**
 * revisar-salud.js
 * Revisa qué tan frescos están los datos publicados y escribe un reporte en
 * Markdown (salud.md). Sale con código 1 si alguna fuente está vieja.
 *
 * Lo usa el workflow "Salud de datos" para abrir o cerrar un issue de aviso,
 * en vez de mandar un correo de falla cada 10 minutos.
 *
 * Uso: node scripts/revisar-salud.js
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import {
  estadoTipoCambio,
  fechaCorta,
  tiempoDesde,
  horasDesde,
  LIMITES_HORAS,
  LIMITE_DIAS_COMBUSTIBLE,
} from "../src/lib/frescura.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const leer = (ruta) => JSON.parse(readFileSync(join(ROOT, ruta), "utf-8"));

const tc = leer("src/data/tipo-cambio.json");
const combustible = leer("src/data/combustible.json");
const estado = estadoTipoCambio(tc);

const fechaCombustible = new Date(`${combustible.historico.at(-1).fecha}T12:00:00-06:00`);
const combustibleViejo = horasDesde(fechaCombustible) / 24 > LIMITE_DIAS_COMBUSTIBLE;

const fuentes = [
  {
    nombre: "Ventanilla por entidad (BCCR)",
    fecha: estado.ventanilla.fecha,
    vieja: estado.ventanilla.vieja,
    limite: `${LIMITES_HORAS.ventanilla} h`,
    workflow: "tc-smart-polling.yml",
  },
  {
    nombre: "Tipo de cambio oficial (BCCR 317/318)",
    fecha: estado.oficial.fecha,
    vieja: estado.oficial.vieja,
    limite: `${LIMITES_HORAS.oficial} h`,
    workflow: "tc-smart-polling.yml",
  },
  {
    nombre: "Combustibles (ARESEP)",
    fecha: fechaCombustible,
    vieja: combustibleViejo,
    limite: `${LIMITE_DIAS_COMBUSTIBLE} días`,
    workflow: "combustible-polling.yml",
  },
];

const viejas = fuentes.filter((f) => f.vieja);

const filas = fuentes
  .map((f) => `| ${f.vieja ? "🔴" : "🟢"} | ${f.nombre} | ${f.fecha ? `${fechaCorta(f.fecha)} (${tiempoDesde(f.fecha)})` : "sin datos"} | ${f.limite} |`)
  .join("\n");

const reporte = `${viejas.length > 0
  ? `Hay **${viejas.length}** fuente(s) sin actualizar. Revise los últimos runs de ${[...new Set(viejas.map((f) => `\`${f.workflow}\``))].join(" y ")} en la pestaña Actions.`
  : "Todas las fuentes están al día."}

| | Fuente | Último dato | Límite |
|---|---|---|---|
${filas}

_Revisado el ${new Date().toISOString()} por el workflow "Salud de datos". Este issue se cierra solo cuando todo vuelve a estar al día._
`;

writeFileSync(join(ROOT, "salud.md"), reporte, "utf-8");
console.log(reporte);
process.exit(viejas.length > 0 ? 1 : 0);
