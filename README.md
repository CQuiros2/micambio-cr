# micambio-cr

Aplicación React para consultar el tipo de cambio en Costa Rica.

## Desarrollo

```bash
npm install
npm run dev
```

## Scripts de datos

### `scripts/scrape-tc-inicial.js`

Descarga el historial de tipo de cambio (compra/venta) del BCCR para los últimos 2 años y lo guarda en `src/data/tipo-cambio.json`.

**Requisito previo: obtener credenciales del BCCR**

1. Ingresá a [https://gee.bccr.fi.cr/Indicadores/Suscripciones/Home/ObtenerToken](https://gee.bccr.fi.cr/Indicadores/Suscripciones/Home/ObtenerToken)
2. Registrá tu correo electrónico para recibir un token de acceso
3. Revisá tu bandeja de entrada — el BCCR te enviará el token por correo

**Uso del script**

Con variables de entorno (recomendado):

```bash
BCCR_EMAIL=tu@correo.com BCCR_TOKEN=TUTOKEN node scripts/scrape-tc-inicial.js
```

O editando el script directamente: reemplazá `johndoe@gmail.com` y `JOHNDOE` con tus credenciales reales en las líneas:

```js
const EMAIL = process.env.BCCR_EMAIL ?? "johndoe@gmail.com";
const TOKEN = process.env.BCCR_TOKEN ?? "JOHNDOE";
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

## Construcción

```bash
npm run build
```

## Stack

- [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- [Tailwind CSS v3](https://tailwindcss.com/)
- [Axios](https://axios-http.com/)
- Datos: [API BCCR](https://gee.bccr.fi.cr/Indicadores/Suscripciones/WS/wsindicadoreseconomicos.asmx)
