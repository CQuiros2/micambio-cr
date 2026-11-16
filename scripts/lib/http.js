import axios from "axios";

// Códigos que suelen ser caídas momentáneas del servidor de origen.
const REINTENTABLES = new Set([408, 429, 500, 502, 503, 504, 520, 521, 522, 523, 524]);

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * axios.get con reintentos y espera creciente (5 s, 15 s, 45 s por defecto).
 * Reintenta ante timeouts, errores de red y respuestas 5xx/429.
 */
export async function getConReintentos(url, config = {}, { intentos = 4, esperaMs = 5_000 } = {}) {
  let ultimoError;
  for (let i = 1; i <= intentos; i++) {
    try {
      return await axios.get(url, config);
    } catch (error) {
      ultimoError = error;
      const status = error.response?.status;
      const reintentable = !error.response || REINTENTABLES.has(status);
      if (!reintentable || i === intentos) break;
      const ms = esperaMs * 3 ** (i - 1);
      console.warn(`  Intento ${i}/${intentos} falló (${status ?? error.code ?? error.message}); reintento en ${ms / 1000} s…`);
      await esperar(ms);
    }
  }
  throw ultimoError;
}
