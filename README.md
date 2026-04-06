# micambio-cr

Aplicación React para consultar el tipo de cambio en Costa Rica.

## Desarrollo

```bash
npm install
npm run dev
```

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

## Construcción

```bash
npm run build
```

## Stack

- [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- [Tailwind CSS v3](https://tailwindcss.com/)
- [Axios](https://axios-http.com/)
- Datos oficiales: API SDDE del BCCR + scraping temporal de ventanilla
