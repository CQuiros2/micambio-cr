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
  - Fuente: `https://gee.bccr.fi.cr/IndicadoresEconomicos/Cuadros/frmConsultaTCVentanilla.aspx`
- Combustibles: API abierta de ARESEP usada por el proyecto
  - Fuente: `https://datos.aresep.go.cr/ws.datosabiertos/Services/IE/TarifaCombustible.svc/ObtenerHistoricoTarifasHidrocarburos`

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

Actualiza solo el histórico oficial reciente de `tipo-cambio.json` usando la API nueva del SDDE y el mismo `BCCR_API_TOKEN`.

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
- frescura razonable de `ultimaActualizacion`
- frescura del último dato oficial del BCCR
- coherencia entre `precios` actuales de combustibles y el último histórico

También emite avisos si encuentra timestamps individuales de entidades demasiado viejos en ventanilla, sin fallar por eso porque puede ser un dato real del BCCR.

## Workflows

### Tipo de cambio

Workflow: [`.github/workflows/tc-smart-polling.yml`](./.github/workflows/tc-smart-polling.yml)

Ejecuta:

1. `node scripts/scrape-tc-ventanilla.js`
2. `node scripts/scrape-tc-diario.js`
3. `node scripts/validate-data.js tc`

Si `src/data/tipo-cambio.json` cambia, hace commit y push automático.

### Combustibles

Workflow: [`.github/workflows/combustible-polling.yml`](./.github/workflows/combustible-polling.yml)

Ejecuta:

1. `node scripts/scrape-combustible-diario.js`
2. `node scripts/validate-data.js combustible`

Si `src/data/combustible.json` cambia, hace commit y push automático.

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
