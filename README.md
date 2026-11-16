# micambio.cr

Tipo de cambio del dólar y precios de combustibles en Costa Rica, en una sola
página.

- **Ventanilla:** compra y venta de las 37 entidades autorizadas por el BCCR,
  cada una con su logo, con la mejor para vender y la mejor para comprar.
- **Calculadora:** cuánto recibe o paga en la mejor entidad y cuánto gana
  frente a las otras del top 5.
- **Combustibles:** precios vigentes de ARESEP y cuánto subieron o bajaron en el
  último ajuste.
- **Dólar oficial:** tipo de cambio de referencia del BCCR y su evolución.
- Español e inglés, modo claro y oscuro según el dispositivo.

El sitio es estático: los datos viven en JSON dentro del repo y los actualizan
workflows de GitHub Actions. No hay servidor ni base de datos.

**Diseño:** colores, tipografía, componentes y reglas en
[`docs/DISENO.md`](docs/DISENO.md).

## Desarrollo

Requiere Node 20.19 o más reciente.

```bash
npm install
npm run dev          # servidor local
npm run build        # build de producción en dist/
npm run lint
npm run validate:data
```

## Estructura

```
index.html                 tema e idioma antes del primer pintado, pantalla de carga
public/favicon.svg
src/
  App.jsx                  layout de la página
  index.css                variables de color y piezas base (ver docs/DISENO.md)
  components/
    Header.jsx             logo, estado de ventanilla, botones de idioma y tema
    Logo.jsx               marca (mismo dibujo que el favicon)
    EntidadLogo.jsx        logo pequeño de cada entidad
    MejoresPrecios.jsx     las dos cifras principales y el tipo oficial
    AvisoDatos.jsx         aviso cuando la ventanilla está vieja
    Calculadora.jsx
    TablaEntidades.jsx     todas las entidades, con filtros y orden
    Combustible.jsx        panel (escritorio) y franja (móvil), con el ajuste
    DolarOficial.jsx       gráfico de la venta oficial
    Footer.jsx
  lib/
    entidades.js           entidades válidas, mejor compra/venta, filtros
    formato.js             números, colones, fechas y horas por idioma
    frescura.js            ¿está vieja cada fuente? (lo usan la web y los scripts)
    i18n.js                textos en español (ustedeo) e inglés
    logos.js               qué logo le toca a cada entidad
    useTema.js             modo claro/oscuro
  assets/logos/            logos de las entidades (ver docs/DISENO.md)
  data/
    tipo-cambio.json       lo escriben los scripts de tipo de cambio
    combustible.json       lo escriben los scripts de combustibles
scripts/                   scrapers, validación y revisión de salud (Node)
.github/workflows/         actualización automática de datos
docs/DISENO.md             guía de diseño
```

## Fuentes de datos

| Dato | Fuente | Script |
|---|---|---|
| Ventanilla por entidad | API interna del sitio de indicadores del BCCR (`sdd.bccr.fi.cr`), cuadro 2039 / grupo de variables 1015 | `scrape-tc-ventanilla.js` |
| Tipo oficial (indicadores 317/318) | API pública SDDE del BCCR, con token | `scrape-tc-diario.js`, `scrape-tc-inicial.js` |
| Combustibles | API de datos abiertos de ARESEP | `scrape-combustible-diario.js`, `scrape-combustible-inicial.js` |

### Ventanilla (BCCR)

El sitio viejo (`gee.bccr.fi.cr`) dejó de responder en septiembre de 2026. El
nuevo es una SPA que consume una API interna en `apim.bccr.fi.cr`, que es la que
usa el scraper:

1. `GET …/Bccr.GE.SDDE.IndicadoresSitioExterno.ServiciosUsuario.API/Token/GenereCSRF`
   devuelve un token (JWT en texto plano).
2. `GET …/Bccr.GE.SDDE.IndicadoresSitioExterno.GrupoVariables.API/CuadroPersonalizadoGrupoVariables/ObtenerDatosCuadroPersonalizado?idGrupoVariable=1015&fechaAConsultar=aaaa-mm-dd`
   con el token en el header `token_csrf`.

Si faltan los headers `Origin`/`Referer` de `sdd.bccr.fi.cr` o
`Accept: application/json, text/plain, */*`, la API responde 500. El endpoint
`ObtenerDatosCuadro` (sin "Personalizado") siempre da 500 para este cuadro.

### Tipo oficial (BCCR)

API SDDE pública con token Bearer:

- Base: `https://apim.bccr.fi.cr/SDDE/api/Bccr.GE.SDDE.Publico.Indicadores.API`
- Variable: `BCCR_API_TOKEN`

`scrape-tc-inicial.js` descarga los últimos 2 años. `scrape-tc-diario.js` pide
desde la última fecha guardada (mínimo 7 días, máximo 400), así rellena huecos si
el workflow estuvo caído.

### Combustibles (ARESEP)

`https://datos.aresep.go.cr/ws.datosabiertos/Services/IE/TarifaCombustible.svc/ObtenerHistoricoTarifasHidrocarburos`.
No necesita token. El script diario solo agrega una publicación si encuentra
una fecha más reciente.

## Estructura de `src/data/tipo-cambio.json`

Lo escriben dos scripts; cada uno guarda su propia fecha para que uno no haga
parecer fresco al otro.

| Campo | Lo escribe | Contenido |
|---|---|---|
| `entidades` | `scrape-tc-ventanilla.js` | `tipoEntidad`, `nombre`, `compra`, `venta`, `diferencial`, `ultimaActualizacion` (`"dd/mm/aaaa hh:mm a.m."`, hora de Costa Rica) |
| `mejorCompra`, `mejorVenta` | `scrape-tc-ventanilla.js` | Nombre y valor de la mejor de cada una |
| `ventanillaActualizada` | `scrape-tc-ventanilla.js` | Cuándo corrió con éxito |
| `historico` | `scrape-tc-diario.js` / `-inicial.js` | `{ fecha, compra, venta }` del tipo oficial por día |
| `oficialActualizado` | `scrape-tc-diario.js` / `-inicial.js` | Cuándo corrió con éxito |
| `ultimaActualizacion` | ambos | Último cambio de cualquiera |

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run scrape:tc` | Ventanilla por entidad |
| `npm run scrape:tc:diario` | Tipo oficial, desde la última fecha guardada (lee `.env.local`) |
| `npm run scrape:tc:inicial` | Tipo oficial, últimos 2 años (lee `.env.local`) |
| `npm run scrape:combustible` | Combustibles, si ARESEP publicó algo nuevo |
| `node scripts/scrape-combustible-inicial.js` | Histórico reciente de combustibles |
| `npm run validate:data` | Revisa forma y coherencia de los JSON |
| `npm run revisar:salud` | Revisa la frescura de las tres fuentes y escribe `salud.md` |

`validate-data.js` revisa la forma de los dos JSON, que `mejorCompra`/`mejorVenta`
coincidan con las entidades, que `diferencial` sea `venta − compra`, la frescura
del tipo oficial y la coherencia de los precios de combustibles con su
histórico. Si la ventanilla está vieja solo avisa, sin fallar, para que el
oficial se siga publicando.

`revisar-salud.js` sale con código 1 si alguna fuente está vieja: ventanilla
más de 72 h, oficial más de 96 h, combustibles más de 45 días. Los límites
viven en `src/lib/frescura.js` y los comparte la web (aviso de datos con
retraso).

Todos los scrapers reintentan con espera creciente ante caídas momentáneas
(5xx, 429, timeouts).

## Workflows

| Workflow | Cuándo | Qué hace |
|---|---|---|
| [`tc-smart-polling.yml`](.github/workflows/tc-smart-polling.yml) | Cada 10 min, lun–vie, 7:00 a.m.–5:50 p.m. (CR) | Ventanilla (si falla, sigue), tipo oficial y validación. Commit si cambió `tipo-cambio.json`. |
| [`combustible-polling.yml`](.github/workflows/combustible-polling.yml) | Lun–vie, 8:00 a.m. (CR) | Combustibles y validación. Commit solo si ARESEP publicó algo nuevo. |
| [`salud-datos.yml`](.github/workflows/salud-datos.yml) | Lun–vie, 9:00 a.m. (CR) | Si alguna fuente está vieja, abre (o comenta) un issue con la etiqueta `datos-desactualizados`; lo cierra solo cuando todo vuelve a estar al día. |

## Variables de entorno

- `BCCR_API_TOKEN`: token de la API SDDE del BCCR. Local en `.env.local`; en
  GitHub Actions como secret. Lo usan los scripts del tipo oficial.

Ventanilla y combustibles no necesitan token.

## Si algo falla

1. Corra `npm run validate:data` y lea el mensaje exacto.
2. Vuelva a correr el scraper de la fuente afectada.

Por fuente:

- **Ventanilla:** revise que la API responda con los headers de arriba y que el
  token CSRF salga bien. Si el BCCR cambia el cuadro, revise la forma de
  `datos.indicadores`: filas de una celda son el tipo de entidad; filas de cinco
  son entidad, compra, venta, diferencial y fecha.
- **Tipo oficial:** verifique `BCCR_API_TOKEN` (si expira, el histórico deja de
  actualizar) y la conectividad a `apim.bccr.fi.cr`.
- **Combustibles:** revise que la API de ARESEP responda y que no hayan
  cambiado los nombres de productos o campos.

Una entidad con fecha vieja no siempre es un error: el dato puede venir así desde
el BCCR.

## Stack

React 19, Vite, Tailwind CSS 3, Axios (scripts). Fuente Archivo (Google Fonts).
