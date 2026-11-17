import { createContext, createElement, useContext, useEffect, useMemo, useState } from "react";
import { crearFormato } from "./formato.js";

/*
 * Idioma: lo que eligió la persona con el botón (se guarda) y, si nunca eligió,
 * el del navegador: español → "es"; cualquier otro (inglés, alemán, francés…)
 * → "en", que un extranjero entiende mejor que el español. Sin dato: "es".
 * index.html aplica lo mismo a <html lang> antes de cargar.
 */
const CLAVE = "micambio-idioma";

function idiomaInicial() {
  try {
    const v = localStorage.getItem(CLAVE);
    if (v === "es" || v === "en") return v;
  } catch {
    /* sin almacenamiento */
  }
  const nav = typeof navigator !== "undefined" ? navigator.languages?.[0] ?? navigator.language ?? "" : "";
  return !nav || /^es\b/i.test(nav) ? "es" : "en";
}

const TIPOS_ENTIDAD_EN = {
  "Bancos públicos": "Public banks",
  "Bancos privados": "Private banks",
  Financieras: "Finance companies",
  "Mutuales de Vivienda": "Housing mutuals",
  Cooperativas: "Credit unions",
  "Casas de Cambio": "Exchange houses",
  "Puestos de Bolsa": "Brokerage firms",
};

export const TEXTOS = {
  es: {
    tituloPestana: "Tipo de cambio hoy en Costa Rica · micambio.cr",
    estadoAlDia: (f) => `Ventanilla al día · ${f}`,
    estadoRetraso: (f) => `Ventanilla con retraso · datos del ${f}`,
    aModoOscuro: "Cambiar a modo oscuro",
    aModoClaro: "Cambiar a modo claro",
    botonOscuro: "Oscuro",
    botonClaro: "Claro",
    aOtroIdioma: "Switch to English",
    botonIdioma: "EN",

    titulo: "Tipo de cambio hoy",
    subtitulo: (n) => `Precios de ventanilla de ${n} entidades autorizadas por el BCCR.`,
    preguntaVender: "¿Va a vender dólares?",
    preguntaComprar: "¿Va a comprar dólares?",
    leConviene: "Le conviene",
    porDolar: "por cada dólar",
    masPagaHoy: "Es la que más paga hoy",
    menosCobraHoy: "Es la que menos cobra hoy",
    masPaga: "Es la que más paga",
    menosCobra: "Es la que menos cobra",
    actualizado: (cuando) => `actualizado ${cuando}`,
    hoyA: (h) => `hoy, ${h}`,
    oficial: (cuando) => `Tipo de cambio oficial BCCR ${cuando}:`,
    oficialHoy: "de hoy",
    oficialDel: (f) => `del ${f}`,
    compra: "compra",
    venta: "venta",

    calculadora: "Calculadora",
    operacion: "Operación",
    monedaMonto: "Moneda del monto",
    vendo: "Vendo dólares",
    compro: "Compro dólares",
    enUsd: "en $",
    enCrc: "en ₡",
    escenarios: {
      venderUsd: ["Dólares que vende", "Recibe"],
      venderCrc: ["Colones que necesita", "Dólares que debe vender"],
      comprarUsd: ["Dólares que quiere", "Le cuestan"],
      comprarCrc: ["Colones que tiene", "Le alcanzan para"],
    },
    enEntidad: "en",
    diferencia: (monto, mas, peor) => `, ${monto} ${mas ? "más" : "menos"} que en ${peor}.`,
    ingresaMonto: "Ingrese un monto para comparar.",
    topVender: "Las 5 que más pagan por su dólar",
    topComprar: "Las 5 que menos cobran por el dólar",
    aTasa: "a",

    todas: "Todas las entidades",
    conteo: (n) => `${n} ${n === 1 ? "entidad" : "entidades"} · toque una columna para ordenar`,
    filtrarTipo: "Filtrar por tipo",
    filtros: { todas: "Todas", bancos: "Bancos", fin: "Financieras", mut: "Mutuales", coop: "Cooperativas", casas: "Casas de cambio", pb: "Puestos de bolsa" },
    colEntidad: "Entidad",
    colCompra: "Compra",
    colVenta: "Venta",
    colDif: "Diferencial",
    colAct: "Actualizado",
    ordenarPor: "Ordenar por",
    notaAtrasadas:
      "Si la fecha de una entidad no es de hoy, es porque todavía no ha enviado al BCCR su tipo de cambio del día. Se muestra el último que reportó; confirme con la entidad antes de ir.",
    glosario: "Compra: lo que la entidad le paga por cada dólar. Venta: lo que le cobra. Diferencial: la resta entre ambas. Fuente:",
    tipoEntidad: (t) => t,

    combustibles: "Combustibles",
    porLitro: "₡ por litro",
    desde: (f) => `desde ${f}`,
    vigentes: (f) => `Vigentes desde el ${f} · `,
    ajusteUsual: "Suelen ajustarse el segundo viernes de cada mes.",
    sinCambio: "sin cambio",
    antes: (p) => `antes ${p}`,
    comparadoCon: (f) => `Ajuste comparado con los precios del ${f}.`,
    subio: (m) => `subió ${m}`,
    bajo: (m) => `bajó ${m}`,
    nombresCombustible: { super: "Súper", regular: "Regular", diesel: "Diésel", gaslp: "Gas LP" },
    cuantoLeSale: "¿Cuánto le sale?",
    combustible: "Combustible",
    calcularPor: "Calcular por",
    modoLitros: "Litros",
    modoColones: "Colones",
    litrosACargar: "Litros que va a cargar",
    colonesACargar: "Colones que va a cargar",
    unidadLitros: "litros",
    litros: (n) => `${n} litros`,
    aPrecioPorLitro: (nombre, precio) => `${nombre} a ${precio} por litro`,
    notaGasLP: "Precio por litro para vehículos a gas. No aplica a cilindros de uso doméstico.",

    dolarOficial: "Dólar oficial (venta)",
    desdeMes: (m) => `desde ${m}`,
    graficoAria: (a, b, va, vb) => `Venta oficial del dólar del ${a} al ${b}: de ${va} a ${vb}`,

    avisoTitulo: (f) => `Los precios de ventanilla son del ${f} y pueden no estar vigentes.`,
    avisoCuerpo: "No se han podido actualizar desde esa fecha. Confirme con la entidad antes de ir.",
    avisoOficial: (f) => `Tipo de cambio oficial del ${f}:`,

    pieDatos: "Datos:",
    pieY: "y",
    pieUso: "Uso informativo; confirme con la entidad antes de ir.",
    pieHecho: "Hecho en Costa Rica por",
  },

  en: {
    tituloPestana: "Costa Rica dollar exchange rate today · micambio.cr",
    estadoAlDia: (f) => `Rates up to date · ${f}`,
    estadoRetraso: (f) => `Rates delayed · last data from ${f}`,
    aModoOscuro: "Switch to dark mode",
    aModoClaro: "Switch to light mode",
    botonOscuro: "Dark",
    botonClaro: "Light",
    aOtroIdioma: "Cambiar a español",
    botonIdioma: "ES",

    titulo: "Dollar exchange rate today",
    subtitulo: (n) => `Over-the-counter rates from ${n} institutions authorized by Costa Rica's Central Bank (BCCR).`,
    preguntaVender: "Selling dollars?",
    preguntaComprar: "Buying dollars?",
    leConviene: "Your best option",
    porDolar: "per dollar",
    masPagaHoy: "Pays the most today",
    menosCobraHoy: "Charges the least today",
    masPaga: "Pays the most",
    menosCobra: "Charges the least",
    actualizado: (cuando) => `updated ${cuando}`,
    hoyA: (h) => `today, ${h}`,
    oficial: (cuando) => `Official BCCR rate ${cuando}:`,
    oficialHoy: "today",
    oficialDel: (f) => `on ${f}`,
    compra: "buy",
    venta: "sell",

    calculadora: "Calculator",
    operacion: "Transaction",
    monedaMonto: "Amount currency",
    vendo: "I'm selling $",
    compro: "I'm buying $",
    enUsd: "in $",
    enCrc: "in ₡",
    escenarios: {
      venderUsd: ["Dollars you sell", "You get"],
      venderCrc: ["Colones you need", "Dollars you need to sell"],
      comprarUsd: ["Dollars you want", "They cost"],
      comprarCrc: ["Colones you have", "You can buy"],
    },
    enEntidad: "at",
    diferencia: (monto, mas, peor) => `, ${monto} ${mas ? "more" : "less"} than at ${peor}.`,
    ingresaMonto: "Enter an amount to compare.",
    topVender: "Top 5 paying the most per dollar",
    topComprar: "Top 5 charging the least per dollar",
    aTasa: "at",

    todas: "All institutions",
    conteo: (n) => `${n} ${n === 1 ? "institution" : "institutions"} · tap a column to sort`,
    filtrarTipo: "Filter by type",
    filtros: { todas: "All", bancos: "Banks", fin: "Finance cos.", mut: "Mutuals", coop: "Credit unions", casas: "Exchange houses", pb: "Brokers" },
    colEntidad: "Institution",
    colCompra: "Buy",
    colVenta: "Sell",
    colDif: "Spread",
    colAct: "Updated",
    ordenarPor: "Sort by",
    notaAtrasadas:
      "If an institution's date isn't today, it hasn't sent today's rate to the BCCR yet. We show the last one it reported; check with the institution before you go.",
    glosario: "Buy: what the institution pays you per dollar. Sell: what it charges you per dollar. Spread: the difference between them. Source:",
    tipoEntidad: (t) => TIPOS_ENTIDAD_EN[t] ?? t,

    combustibles: "Fuel prices",
    porLitro: "₡ per liter",
    desde: (f) => `since ${f}`,
    vigentes: (f) => `In effect since ${f} · `,
    ajusteUsual: "Usually adjusted on the second Friday of each month.",
    sinCambio: "no change",
    antes: (p) => `was ${p}`,
    comparadoCon: (f) => `Change compared with prices on ${f}.`,
    subio: (m) => `up ${m}`,
    bajo: (m) => `down ${m}`,
    nombresCombustible: { super: "Super", regular: "Regular", diesel: "Diesel", gaslp: "LPG" },
    cuantoLeSale: "How much will it cost?",
    combustible: "Fuel",
    calcularPor: "Calculate by",
    modoLitros: "Liters",
    modoColones: "Colones",
    litrosACargar: "Liters to fill",
    colonesACargar: "Colones to spend",
    unidadLitros: "liters",
    litros: (n) => `${n} liters`,
    aPrecioPorLitro: (nombre, precio) => `${nombre} at ${precio} per liter`,
    notaGasLP: "Price per liter for LPG vehicles. Does not apply to household gas cylinders.",

    dolarOficial: "Official dollar (sell)",
    desdeMes: (m) => `since ${m}`,
    graficoAria: (a, b, va, vb) => `Official dollar sell rate from ${a} to ${b}: from ${va} to ${vb}`,

    avisoTitulo: (f) => `Rates are from ${f} and may no longer be current.`,
    avisoCuerpo: "They haven't been updated since then. Check with the institution before you go.",
    avisoOficial: (f) => `Official rate on ${f}:`,

    pieDatos: "Data:",
    pieY: "and",
    pieUso: "For reference only; confirm with the institution before you go.",
    pieHecho: "Made in Costa Rica by",
  },
};

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [idioma, setIdioma] = useState(idiomaInicial);

  useEffect(() => {
    document.documentElement.lang = idioma;
    document.title = TEXTOS[idioma].tituloPestana;
  }, [idioma]);

  const valor = useMemo(
    () => ({
      idioma,
      t: TEXTOS[idioma],
      f: crearFormato(idioma),
      alternarIdioma: () => {
        const nuevo = idioma === "es" ? "en" : "es";
        setIdioma(nuevo);
        try {
          localStorage.setItem(CLAVE, nuevo);
        } catch {
          /* navegación privada */
        }
      },
    }),
    [idioma]
  );

  return createElement(I18nContext.Provider, { value: valor }, children);
}

export function useI18n() {
  return useContext(I18nContext);
}
