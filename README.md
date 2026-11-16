# micambio-cr

Aplicación React para consultar el tipo de cambio en Costa Rica.

## Desarrollo

```bash
npm install
npm run dev
```

## Operación de datos

### Fuentes canónicas

- Tipo oficial `317/318`: API SDDE del BCCR
  - Base URL: `https://apim.bccr.fi.cr/SDDE/api/Bccr.GE.SDDE.Publico.Indicadores.API`
- Tipo de cambio en ventanilla: cuadro público del BCCR
  - Fuente vieja: `https://gee.bccr.fi.cr/IndicadoresEconomicos/Cuadros/frmConsultaTCVentanilla.aspx`
  - ⚠️ **Fuera de servicio desde el 10/09/2026** (responde 503). El BCCR migró sus indicadores
    a `https://sdd.bccr.fi.cr/es/IndicadoresEconomicos/`, donde el cuadro es el
    "Lista de intermediarios cambiarios autorizados y sus tipos de cambio vigentes de ventanilla"
    (`/Inicio/Contenedor/2039`). Falta migrar `scrape-tc-ventanilla.js` a una fuente nueva;
    mientras tanto la web muestra los últimos datos con un aviso de que no están vigentes.
- Combustibles: API abierta de ARESEP usada por el proyecto
  - Fuente: `https://datos.aresep.go.cr/ws.datosabiertos/Services/IE/TarifaCombustible.svc/ObtenerHistoricoTarifasHidrocarburos`

## Estructura de `src/data/tipo-cambio.json`

Lo escriben dos scripts distintos; cada uno tiene su propia fecha para que uno no
haga parecer fresco al otro:

| Campo | Lo escribe | Contenido |
|---|---|---|
| `entidades`, `mejorCompra`, `mejorVenta` | `scrape-tc-ventanilla.js` | Ventanilla por entidad |
| `ventanillaActualizada` | `scrape-tc-ventanilla.js` | Cuándo corrió con éxito |
| `historico` | `scrape-tc-diario.js` / `-inicial.js` | Tipo oficial 317/318 por día |
| `oficialActualizado` | `scrape-tc-diario.js` / `-inicial.js` | Cuándo corrió con éxito |
| `ultimaActualizacion` | ambos | Último cambio de cualquier tipo (compatibilidad) |

La lógica de "¿está vieja esta fuente?" vive en `src/lib/frescura.js` y la comparten
la web (aviso, badge "Datos con retraso"), `validate-data.js` y `revisar-salud.js`.

## Scripts de datos

### `scripts/scrape-tc-inicial.js`

Descarga el historial oficial de tipo de cambio (compra/venta BCCR, indicadores 317 y 318) para los últimos 2 años y lo guarda en `src/data/tipo-cambio.json`.

Usa la API nueva del SDDE del BCCR con token Bearer:

- Base URL: `https://apim.bccr.fi.cr/SDDE/api/Bccr.GE.SDDE.Publico.Indicadores.API`
- Variable requerida: `BCCR_API_TOKEN`

**Uso del script**

Local, leyendo `.env.local` con Node 20:

```bash
npm run scrape:tc:inicial
```

Sin usar `npm`, equivalente:

```bash
node --env-file=.env.local scripts/scrape-tc-inicial.js
```

**Salida**

El script genera `src/data/tipo-cambio.json` con esta estructura:

```json
{
  "ultimaActualizacion": "2024-04-04T00:00:00.000Z",
  "bancos": [],
  "historico": [
    { "fecha": "2022-04-04", "compra": 530.50, "venta": 540.00 },
    ...
  ]
}
```

Al finalizar imprime cuántos registros se obtuvieron y la fecha del más reciente.

### `scripts/scrape-tc-diario.js`

Actualiza el histórico oficial de `tipo-cambio.json` usando la API nueva del SDDE y el mismo `BCCR_API_TOKEN`. Pide desde la última fecha guardada (mínimo 7 días, máximo 400), así rellena solo los huecos si el workflow estuvo caído.

```bash
npm run scrape:tc:diario
```

### `scripts/scrape-tc-ventanilla.js`

Sigue temporalmente por scraping desde la página de ventanilla del BCCR.

Este flujo todavía no fue migrado a la API nueva para evitar riesgo sobre:

- entidades por categoría
- diferencial por entidad
- timestamps de actualización por entidad
- shape actual que consume la app

En esta etapa:

- tipo oficial diario e histórico: API nueva SDDE con Bearer token
- ventanilla por entidad: scraping legado, intacto

### `scripts/scrape-combustible-inicial.js`

Descarga el histórico reciente de combustibles desde la API de ARESEP y genera `src/data/combustible.json`.

```bash
node scripts/scrape-combustible-inicial.js
```

### `scripts/scrape-combustible-diario.js`

Consulta la API de ARESEP y solo agrega una nueva publicación si detecta una fecha más reciente en la fuente.

```bash
npm run scrape:combustible
```

### `scripts/revisar-salud.js`

Revisa la frescura de las tres fuentes, escribe `salud.md` y sale con código 1 si alguna está vieja (ventanilla > 72 h, oficial > 96 h, combustibles > 45 días).

```bash
npm run revisar:salud
```

### `scripts/validate-data.js`

Smoke check de confiabilidad sobre los JSON que consume la app.

```bash
npm run validate:data
```

Valida:

- shape básico de `src/data/tipo-cambio.json`
- shape básico de `src/data/combustible.json`
- consistencia de `mejorCompra` y `mejorVenta`
- consistencia de `diferencial` respecto a `venta - compra`
- frescura razonable de `ultimaActualizacion` (ventanilla vieja solo da aviso, no falla, para que el oficial se siga publicando)
- frescura del último dato oficial del BCCR
- coherencia entre `precios` actuales de combustibles y el último histórico

También emite avisos si encuentra timestamps individuales de entidades demasiado viejos en ventanilla, sin fallar por eso porque puede ser un dato real del BCCR.

## Workflows

Todos los scrapers reintentan con espera creciente ante caídas momentáneas (5xx, 429, timeouts).

### Tipo de cambio

Workflow: [`.github/workflows/tc-smart-polling.yml`](./.github/workflows/tc-smart-polling.yml) — cada 10 minutos, lunes a viernes, 7:00 a. m.–5:50 p. m. hora CR.

Ejecuta:

1. `node scripts/scrape-tc-ventanilla.js` (con `continue-on-error`: si falla, el oficial se actualiza igual)
2. `node scripts/scrape-tc-diario.js`
3. `node scripts/validate-data.js tc`

Si `src/data/tipo-cambio.json` cambia, hace commit y push automático.

### Combustibles

Workflow: [`.github/workflows/combustible-polling.yml`](./.github/workflows/combustible-polling.yml) — lunes a viernes, 8:00 a. m. hora CR. Solo hace commit si ARESEP publicó algo nuevo.

Ejecuta:

1. `node scripts/scrape-combustible-diario.js`
2. `node scripts/validate-data.js combustible`

Si `src/data/combustible.json` cambia, hace commit y push automático.

### Salud de datos

Workflow: [`.github/workflows/salud-datos.yml`](./.github/workflows/salud-datos.yml) — lunes a viernes, 9:00 a. m. hora CR.

Corre `revisar-salud.js`. Si alguna fuente está vieja, abre un issue con la etiqueta `datos-desactualizados` (o comenta en el que ya está abierto). Cuando todo vuelve a estar al día, lo cierra solo.

## Variables de entorno y secrets

### Requeridas

- `BCCR_API_TOKEN`
  - uso local: `.env.local`
  - uso en GitHub Actions: `secrets.BCCR_API_TOKEN`
  - lo usan `scripts/scrape-tc-diario.js` y `scripts/scrape-tc-inicial.js`

### No requeridas para combustibles

- El flujo de combustibles no necesita token ni autenticación adicional.

## Diagnóstico y mantenimiento

### Si falla una validación

1. Corré:

```bash
npm run validate:data
```

2. Si falla `tipo-cambio`:

```bash
npm run scrape:tc
npm run scrape:tc:diario
```

3. Si falla `combustible`:

```bash
npm run scrape:combustible
```

Después revisá el JSON afectado y el mensaje exacto del validador.

### Si falla un scraper

- `scrape-tc-diario.js`
  - verificar `BCCR_API_TOKEN`
  - verificar conectividad a `apim.bccr.fi.cr`
  - revisar si la API SDDE cambió shape o devolvió error de autorización

- `scrape-tc-ventanilla.js`
  - ver primero si `gee.bccr.fi.cr` responde (desde el 10/09/2026 está fuera de servicio)
  - revisar si cambió el HTML del cuadro del BCCR
  - confirmar que la tabla siga incluyendo encabezados como `Tipo de Entidad`, `Entidad Autorizada`, `Compra`
  - este es el flujo más frágil del sistema

- `scrape-combustible-diario.js`
  - revisar disponibilidad de la API de ARESEP
  - revisar si cambiaron nombres de productos o campos de precio

### Puntos más frágiles

- Scraping de ventanilla del BCCR por dependencia en markup HTML.
- Mapeo de nombres de combustibles si ARESEP renombra productos.
- Timestamps individuales de ventanilla: una entidad puede verse vieja aunque el scraper funcione bien, porque el dato ya viene así desde el BCCR.
- Token del SDDE: si expira o pierde permisos, el histórico oficial deja de actualizar.

## Construcción

```bash
npm run build
```

## Stack

- [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- [Tailwind CSS v3](https://tailwindcss.com/)
- [Axios](https://axios-http.com/)
- Datos oficiales: API SDDE del BCCR + scraping temporal de ventanilla + API abierta de ARESEP
