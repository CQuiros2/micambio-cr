import axios from "axios";

const BASE_URL =
  "https://apim.bccr.fi.cr/SDDE/api/Bccr.GE.SDDE.Publico.Indicadores.API";
const DEFAULT_TIMEOUT_MS = 30_000;

function toApiDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
}

function ensureToken() {
  const token = process.env.BCCR_API_TOKEN?.trim();
  if (!token) {
    throw new Error(
      "Falta BCCR_API_TOKEN. Cargalo en .env.local para desarrollo o como secret en CI."
    );
  }
  return token;
}

function buildHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

function getErrorMessage(error) {
  if (error.response) {
    const body = typeof error.response.data === "string"
      ? error.response.data
      : JSON.stringify(error.response.data);
    return `HTTP ${error.response.status}: ${body.slice(0, 300)}`;
  }

  if (error.code === "ECONNABORTED") {
    return `Timeout al consultar la API del BCCR tras ${DEFAULT_TIMEOUT_MS}ms.`;
  }

  return error.message;
}

function normalizeSeriesPayload(payload, codigo) {
  if (!payload || typeof payload !== "object") {
    throw new Error(`Respuesta vacía o inválida para indicador ${codigo}.`);
  }

  if (payload.estado === false) {
    throw new Error(
      `La API del BCCR rechazó la consulta para indicador ${codigo}: ${payload.mensaje ?? "sin detalle"}`
    );
  }

  const item = payload.datos?.find((entry) => String(entry.codigoIndicador) === String(codigo))
    ?? payload.datos?.[0];

  if (!item || !Array.isArray(item.series)) {
    throw new Error(`La respuesta del indicador ${codigo} no incluye series.`);
  }

  return item.series.map((serie) => ({
    fecha: serie.fecha,
    valor: serie.valorDatoPorPeriodo === null || serie.valorDatoPorPeriodo === undefined
      ? null
      : Number(serie.valorDatoPorPeriodo),
  }));
}

export async function fetchIndicadorSeries(codigo, inicio, fin, idioma = "es") {
  const token = ensureToken();
  const url = `${BASE_URL}/indicadoresEconomicos/${codigo}/series`;

  try {
    const response = await axios.get(url, {
      headers: buildHeaders(token),
      params: {
        fechaInicio: inicio,
        fechaFin: fin,
        idioma,
      },
      timeout: DEFAULT_TIMEOUT_MS,
      validateStatus: (status) => status >= 200 && status < 500,
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error(`No autorizado por la API del BCCR para indicador ${codigo}. Verificá BCCR_API_TOKEN.`);
    }

    if (response.status >= 400) {
      const body = typeof response.data === "string"
        ? response.data
        : JSON.stringify(response.data);
      throw new Error(`HTTP ${response.status} al consultar indicador ${codigo}: ${body.slice(0, 300)}`);
    }

    return normalizeSeriesPayload(response.data, codigo);
  } catch (error) {
    throw new Error(`Error consultando indicador ${codigo}: ${getErrorMessage(error)}`);
  }
}

export function getRecentRange(daysBack = 7) {
  const fin = new Date();
  const inicio = new Date(fin);
  inicio.setDate(fin.getDate() - daysBack);
  return {
    inicio: toApiDate(inicio),
    fin: toApiDate(fin),
  };
}

export function getHistoricalRange(yearsBack = 2) {
  const fin = new Date();
  const inicio = new Date(fin);
  inicio.setFullYear(fin.getFullYear() - yearsBack);
  return {
    inicio: toApiDate(inicio),
    fin: toApiDate(fin),
  };
}
