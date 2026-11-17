# Diseño de micambio.cr

Guía visual del sitio: qué se buscó, cómo está armado y qué reglas seguir al
cambiarlo. Si algo de aquí choca con el código, manda el código; actualice este
documento.

## Principios

1. **El dato primero.** Lo que la persona vino a buscar (dónde conviene cambiar
   hoy y cuánto cuesta el combustible) se ve sin hacer scroll, en cifras grandes.
2. **Nada de relleno.** Cada bloque sale de datos reales que se actualizan solos.
   No hay textos escritos a mano con cifras (se vuelven falsos al mes), ni
   adornos que no informen.
3. **Sobrio y local.** Que se sienta costarricense sin caer en el cliché: la
   bandera aparece en una franja fina arriba y en el logo, y sus dos colores
   tienen un significado en los datos.
4. **Sin señas de "plantilla".** Nada de degradados de fondo, emojis, sombras
   grandes, bordes laterales de color en las tarjetas ni animaciones de entrada.

## Estructura de la página

### Escritorio (≥ 1024 px)

```
┌──────────────────────── franja de la bandera ────────────────────────┐
│ logo                     estado de ventanilla   [🌐 EN] [☾ Oscuro]   │
├───────────────────────────────────────────────┬──────────────────────┤
│ Tipo de cambio hoy                            │ Combustibles         │
│ ┌ ¿Va a vender dólares?┐ ┌ ¿Va a comprar…? ┐  │  Súper  ▲₡41   805   │
│ │ Le conviene [logo] X │ │ Le conviene  Y  │  │  …                   │
│ │ ₡444,06 (azul)       │ │ ₡449,00 (rojo)  │  │                      │
│ └──────────────────────┘ └─────────────────┘  ├──────────────────────┤
│ Tipo de cambio oficial BCCR                   │ Dólar oficial (venta)│
│ Calculadora (monto · resultado · top 5)       │  gráfico desde marzo │
│ Todas las entidades (filtros · tabla)         │                      │
└───────────────────────────────────────────────┴──────────────────────┘
```

La columna derecha es `sticky`: los combustibles siguen a la vista mientras se
recorre la tabla.

Las dos tarjetas de arriba responden en una frase lo que la persona quiere
hacer ("¿Va a vender dólares? Le conviene X, ₡444,06 por cada dólar"), en vez
de mostrar datos sueltos como "compra" o "venta" que hay que interpretar. Se
habla siempre de vender o comprar **dólares**, nunca de "comprar colones",
para no mezclar las dos formas de decir lo mismo. Si la ventanilla está
atrasada, el pie no dice "hoy".

### Móvil

Los combustibles pasan a una **franja de cuatro cifras justo debajo del
encabezado**: es lo primero que se ve. Después vienen el título, las dos cifras
principales (en dos columnas), la calculadora, la lista de entidades y, al
final, el gráfico del dólar oficial. La tabla se convierte en una lista de tres
columnas (entidad, compra, venta) y los filtros se desplazan en horizontal.

## Marca

- **Logo:** cuadro azul de esquinas redondeadas con el símbolo ₡ en blanco y,
  abajo, una banda blanca-roja-blanca que remite a la bandera. Al lado,
  `micambio` en Archivo extra negrita y `.cr` en rojo.
- **Favicon:** [`public/favicon.svg`](../public/favicon.svg). El ₡ está dibujado
  con trazos (no es texto) para que se vea igual en cualquier dispositivo. El
  mismo dibujo está en [`src/components/Logo.jsx`](../src/components/Logo.jsx);
  si cambia uno, cambie el otro.
- **Franja de la bandera:** proporciones reales 1 : 1 : 2 : 1 : 1 (azul, blanco,
  rojo, blanco, azul). 18 px de alto en escritorio, 12 px en móvil
  (clase `.bandera`).

## Color

Todos los colores son variables CSS en [`src/index.css`](../src/index.css);
el modo oscuro las redefine bajo `.dark`. Nunca uses un color suelto en un
componente si existe la variable (la excepción son los cuadros blancos de los
logos de entidades, que no cambian con el modo).

| Variable    | Claro     | Oscuro    | Uso |
|-------------|-----------|-----------|-----|
| `--bg`      | `#F2F3EF` | `#0A101C` | Fondo de la página |
| `--surface` | `#FFFFFF` | `#111A2A` | Tarjetas |
| `--sunk`    | `#E9EBE5` | `#0D1523` | Encabezado de tabla, fondo de controles segmentados |
| `--ink`     | `#0D1B2A` | `#E9EDF3` | Texto principal |
| `--muted`   | `#475160` | `#A9B3C2` | Texto secundario |
| `--faint`   | `#5C6470` | `#8D99AA` | Notas, fechas, fuentes |
| `--line`    | `#D8DBD3` | `#233049` | Bordes y separadores |
| `--blue`    | `#002B7F` | `#9DB8FF` | **Compra** (le conviene a quien vende dólares), enlaces |
| `--red`     | `#C8102E` | `#FF8592` | **Venta** (le conviene a quien compra dólares), `.cr` del logo |
| `--up` / `--up-bg` | `#B4321F` / `#FBE6E1` | `#FF9A7A` / `#3A1D16` | Subió (combustible), dato viejo |
| `--ok` / `--ok-bg` | `#23683F` / `#E0F0E6` | `#6BD39A` / `#11301F` | Bajó (combustible), ventanilla al día |
| `--warn` / `--warn-bg` | `#8A5300` / `#FBF1DE` | `#F0B860` / `#2A2112` | Aviso de datos con retraso |

Reglas:

- **Azul y rojo son los de la bandera** y tienen un solo significado cada uno:
  azul = compra, rojo = venta. No los uses para otra cosa.
- En oscuro se aclaran para mantener **contraste de texto de al menos 4.5:1**.
  Si agrega un color, verifique el contraste en los dos modos.
- Los colores de los combustibles (cuadritos) son fijos en los dos modos:
  Súper `#3F659C`, Regular `#B53E36`, Diésel `#2D7A5B`, Gas LP `#9A5B34`.
- Subir/bajar nunca se comunica solo con color: siempre va la flecha ▲/▼.

## Tipografía

- **Archivo** (Google Fonts, variable en peso y ancho), con `system-ui` de
  respaldo. Se carga desde [`index.html`](../index.html).
- **Cifras:** clase `.num` → números tabulares (todos del mismo ancho) y un poco
  angostos (`font-stretch: 88%`), para que las columnas de precios queden
  alineadas. Úsela en todo número que se compare.
- Escala usada: títulos 30/40 px (móvil/escritorio), cifra principal hasta
  64 px, cifras de tabla 16–17 px, texto 14–16 px, notas 12–13 px. Títulos con
  `letter-spacing` negativo (−0.02 a −0.03 em).

## Componentes

| Pieza | Dónde | Notas |
|---|---|---|
| `.tarjeta` | `index.css` | Superficie blanca/oscura, borde de 1 px, radio 10 px. Sin sombra. |
| `.segmentado` | `index.css` | Vendo/Compro y $/₡. El botón activo lleva `aria-pressed="true"`. |
| `.chip` | `index.css` | Filtros de la tabla. Activo = relleno de tinta. |
| `.ajuste` | `index.css` | Pastilla ▲/▼ con el ajuste del combustible (`-sube`, `-baja`, `-igual`). |
| `.bandera` | `index.css` | Franja superior. |
| `MarcaLogo` / `Logo` | `components/Logo.jsx` | Marca sola o con el nombre. |
| `EntidadLogo` | `components/EntidadLogo.jsx` | Logo de una entidad sobre un cuadro blanco (o sus iniciales si no hay). |

## Logos de las entidades

Ayudan a reconocer cada entidad de un vistazo. Viven en
[`src/assets/logos/`](../src/assets/logos/) y se asocian por palabras clave del
nombre en [`src/lib/logos.js`](../src/lib/logos.js).

- **Se usa el logo oficial cuando se puede**: el ícono del sitio de la entidad,
  descargado una vez y guardado en el repo (no se cargan en vivo desde sitios
  ajenos). Se normalizan a PNG de 96×96, recortando el margen blanco; los que
  son un cuadro de color se dejan enteros.
- **Si no se pudo obtener**, va una versión propia lo más parecida posible
  (SVG). Hoy solo Coopemep: su sitio bloquea descargas y el único ícono era de
  16 px, así que se redibujó nítido con su forma y colores.
- **DAVIbank** (antes Scotiabank) solo tiene logotipo horizontal; su cuadro se
  armó con piezas del logo oficial de davibank.cr ("DAVI" arriba, "bank"
  abajo). Ojo: su sitio todavía sirve imágenes de Scotiabank; no usarlas.
- Las filiales usan la marca del grupo: BN Valores → BN, Popular Valores → BP,
  BCT Valores → BCT, Banco CMB → Citi (es la filial de Citi en Costa Rica).
- **Verificar siempre el origen**: que el archivo venga del dominio oficial de
  la entidad (y que ese dominio sea de verdad el suyo). Un logo de otra entidad
  confunde más que unas iniciales.
- Las reglas están en [`src/lib/logos-reglas.js`](../src/lib/logos-reglas.js)
  (sin dependencias de Vite, para que también las use el aviso automático).
- **Aviso automático**: el workflow "Salud de datos" corre
  `scripts/revisar-logos.js` y, si una entidad no tiene logo, abre un issue
  con la etiqueta `logo-faltante`; se cierra solo cuando se le agrega.
- Se muestran siempre sobre un cuadro blanco con borde, también en modo oscuro,
  porque los logos están pensados para fondo claro. Son decorativos
  (`alt=""`): el nombre va siempre al lado como texto.
- Para una entidad nueva: guarde el logo como `src/assets/logos/<clave>.png`
  (96×96) y agregue la regla en `REGLAS` de `logos-reglas.js`. Si no hay
  regla, se muestran las iniciales.

Botones e interactivos: mínimo 44 px de alto (36 px en chips y orden de tabla)
y foco visible (`:focus-visible`, contorno azul).

## Combustibles: el ajuste

La pastilla compara el precio vigente con el que regía **antes del último
ajuste mensual**: el último registro del histórico con al menos 20 días de
antigüedad respecto del vigente. ARESEP a veces publica una corrección de ₡1
días después del ajuste grande; comparar con el registro inmediato anterior
mostraría "−₡1" cuando lo que pasó en el mes fue, por ejemplo, "▲₡41". La
lógica está en [`src/lib/combustibles.js`](../src/lib/combustibles.js).

## Combustibles: la calculadora

"¿Cuánto le sale?" calcula en los dos sentidos, porque en la bomba se pide de
las dos formas: por litros ("60 litros de diésel" → ₡48.420) o por monto
("póngame 20 mil" → 24,8 litros). En escritorio va dentro del panel de
combustibles, que se queda fijo al hacer scroll; en móvil es una tarjeta debajo
de la calculadora de dólares (la franja de arriba se deja solo para leer).

El precio de Gas LP de ARESEP es **por litro, para vehículos**; una nota lo
aclara para que nadie calcule con él un cilindro de uso doméstico.

## Modo oscuro

- **Al entrar:** si la persona eligió un modo con el botón, se respeta. Si no,
  se usa el del dispositivo (`prefers-color-scheme`) y se sigue en vivo si lo
  cambia. Sin preferencia del sistema: **claro**.
- **Sin destello:** un script síncrono en el `<head>` de `index.html` pone la
  clase `dark` antes del primer pintado. La pantalla de carga usa sus propios
  estilos en línea, así que también sale en el modo correcto.
- La elección se guarda en `localStorage` con la clave `micambio-tema`
  (`"claro"` / `"oscuro"`). Solo se guarda cuando la persona toca el botón.
- Lógica en [`src/lib/useTema.js`](../src/lib/useTema.js).

## Pantalla de carga

Vive dentro de `#root` en `index.html`; React la reemplaza al montar. Aparece con
un retraso de 0,35 s, así que en una carga normal no se ve. Respeta modo e
idioma, y `prefers-reduced-motion`.

## Idioma (español / inglés)

- **Al entrar:** el idioma elegido con el botón o, si no, el del navegador:
  español → `es`; **cualquier otro** (inglés, alemán, francés…) → `en`, porque
  un extranjero entiende mejor el inglés que el español. Se guarda en
  `localStorage` con la clave `micambio-idioma`.
- **Textos:** todos están en [`src/lib/i18n.js`](../src/lib/i18n.js), en
  `TEXTOS.es` y `TEXTOS.en`. Al agregar un texto, agréguelo en los dos. Los
  componentes los leen con `const { t, f } = useI18n()`.
- **Formatos:** `f` (de [`src/lib/formato.js`](../src/lib/formato.js)) formatea
  números, colones, horas y fechas según el idioma: `₡44.406,10` / `₡44,406.10`
  (en español, punto para miles y coma para decimales, como el BCCR),
  `1:15 p.m.` / `1:15 PM`. Las horas siempre se muestran en hora de Costa Rica.
- El español usa **ustedeo**, como se habla en Costa Rica ("Si vende dólares",
  "Ingrese un monto", "Confirme con la entidad"). Nada de voseo ni tuteo.

## Qué evitar

- Degradados de fondo, sombras grandes, "glassmorphism".
- Emojis como íconos (los íconos son SVG de trazo, en línea).
- Bordes de color a un costado de las tarjetas.
- Cifras escritas a mano en textos ("hoy el dólar está a…").
- Animaciones de entrada en tarjetas o filas.
- Más de un significado para azul o rojo.
