import { useEffect, useState } from "react";

/*
 * Tema: lo que eligió la persona con el botón (se guarda) y, si nunca eligió,
 * lo que tiene configurado el dispositivo, siguiéndolo en vivo. Sin preferencia
 * del sistema, claro. index.html aplica lo mismo antes del primer pintado.
 *
 * La clave es nueva a propósito: la versión anterior guardaba "theme" en cada
 * visita aunque nadie lo eligiera, y eso taparía la preferencia del sistema.
 */
const CLAVE = "micambio-tema";
const CONSULTA = "(prefers-color-scheme: dark)";

function leerElegido() {
  try {
    const v = localStorage.getItem(CLAVE);
    return v === "oscuro" || v === "claro" ? v : null;
  } catch {
    return null;
  }
}

const sistemaOscuro = () => typeof window !== "undefined" && !!window.matchMedia?.(CONSULTA).matches;

export function useTema() {
  const [elegido, setElegido] = useState(leerElegido);
  const [sistema, setSistema] = useState(sistemaOscuro);

  useEffect(() => {
    const media = window.matchMedia?.(CONSULTA);
    if (!media) return;
    const alCambiar = (e) => setSistema(e.matches);
    media.addEventListener("change", alCambiar);
    return () => media.removeEventListener("change", alCambiar);
  }, []);

  const oscuro = elegido ? elegido === "oscuro" : sistema;

  useEffect(() => {
    const html = document.documentElement;
    html.classList.toggle("dark", oscuro);
    html.style.colorScheme = oscuro ? "dark" : "light";
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", oscuro ? "#0A101C" : "#F2F3EF");
  }, [oscuro]);

  const alternar = () => {
    const nuevo = oscuro ? "claro" : "oscuro";
    setElegido(nuevo);
    try {
      localStorage.setItem(CLAVE, nuevo);
    } catch {
      /* navegación privada: el cambio dura hasta recargar */
    }
  };

  return { oscuro, alternar };
}
