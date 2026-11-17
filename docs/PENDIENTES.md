# Pendientes y sugerencias

Ideas y detalles menores que quedaron fuera del rediseño de noviembre de 2026.
Nada de esto es urgente: la página funciona completa sin ellos. Cuando se haga
uno, bórrelo de esta lista (el historial queda en git).

## Verificar

- **Que los avisos por issue lleguen por correo.** El workflow "Salud de datos"
  (lunes a viernes, 9:00 a.m.) abre y cierra issues con las etiquetas
  `datos-desactualizados` y `logo-faltante`. Para recibirlos por correo, en el
  repositorio el botón **Watch** debe estar en "All Activity", o en "Custom"
  con **Issues** marcado. Una prueba fácil: el issue #1 se abrió el 16/11/2026
  cuando la ventanilla estaba caída y debería cerrarse solo en la siguiente
  corrida; si llega el correo del cierre, todo funciona.

## Logos de entidades

- **Coopemep** usa una versión redibujada por nosotros (`src/assets/logos/coopemep.svg`):
  su sitio bloquea descargas automáticas y el único ícono disponible era de
  16 px. Si se consigue el logo oficial, reemplazarlo por
  `src/assets/logos/coopemep.png` (96×96) y borrar el SVG.
- **Popular Valores** usa la marca BP del Banco Popular (es su subsidiaria al
  100 %). Su sitio (`popularvalores.com`) tiene el certificado HTTPS mal
  configurado y no se pudo bajar su ícono propio; si lo arreglan, se puede
  probar de nuevo.

Cómo agregar o cambiar un logo: `docs/DISENO.md`, sección "Logos de las entidades".

## Ideas

- **Propuesta de precios de combustibles del mes siguiente.** RECOPE publica su
  propuesta antes de que ARESEP la apruebe (por ejemplo, "súper ₡805 → ₡777,
  ▼₡28") y los medios la difunden. Mostrar "lo que viene" aportaría mucho,
  pero primero hay que encontrar una fuente que se pueda leer de forma
  automática (RECOPE o ARESEP) para no escribir cifras a mano.
- **Categoría nueva de entidades.** Si el BCCR agrega un tipo de entidad nuevo
  (por ejemplo, "Fintech"), sus entidades aparecen en "Todas" pero sin botón de
  filtro propio, y en inglés el tipo se muestra en español. Se arregla
  agregando el filtro en `FILTROS` (`src/lib/entidades.js`) y la traducción en
  `TIPOS_ENTIDAD_EN` (`src/lib/i18n.js`).

## Diseño

- **El lienzo de diseño** (artifact privado en claude.ai, "Rediseño micambio-cr")
  quedó atrás del código: no tiene los logos de entidades ni las tarjetas
  "¿Va a vender dólares?". La referencia vigente es la página y
  `docs/DISENO.md`. Actualizarlo solo si se va a seguir diseñando ahí.
