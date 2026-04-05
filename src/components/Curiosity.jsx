import { useState, useEffect, useRef } from "react";

const CURIOSIDADES = [
  {
    id: 1,
    categoria: "Tipo de cambio",
    texto: "Hace un año el dólar se compraba a ₡510 en el Banco Nacional. Hoy se compra a ₡456 — una caída de ₡54 en 12 meses.",
  },
  {
    id: 2,
    categoria: "Combustibles",
    texto: "La gasolina súper bajó ₡95 en los últimos 12 meses: pasó de ₡728 a ₡633 por litro según ARESEP.",
  },
  {
    id: 3,
    categoria: "Combustibles",
    texto: "El diésel acumula una baja de ₡108 en el último año: de ₡638 bajó a ₡530 por litro.",
  },
  {
    id: 4,
    categoria: "Dato curioso",
    texto: "El diferencial cambiario (diferencia entre compra y venta) varía entre ₡6 y ₡24 según la entidad financiera.",
  },
  {
    id: 5,
    categoria: "Combustibles",
    texto: "El Gas LP mantiene su precio en ₡242 por litro, sin cambios en los últimos dos meses.",
  },
  {
    id: 6,
    categoria: "Tipo de cambio",
    texto: "Las casas de cambio suelen ofrecer mejor tipo de compra que los bancos, pero con mayor diferencial de venta.",
  },
];

const CAT_STYLES = {
  "Tipo de cambio": { bg: "rgba(59,130,246,0.1)",  color: "#3b82f6", border: "rgba(59,130,246,0.25)" },
  "Combustibles":   { bg: "rgba(245,158,11,0.1)",  color: "#f59e0b", border: "rgba(245,158,11,0.25)" },
  "Dato curioso":   { bg: "rgba(168,85,247,0.1)",  color: "#a855f7", border: "rgba(168,85,247,0.25)" },
};

export default function Curiosity() {
  const [actual, setActual] = useState(0);
  const [fade, setFade] = useState(true);
  const timerRef = useRef(null);

  const irA = (idx) => {
    if (idx === actual) return;
    setFade(false);
    setTimeout(() => {
      setActual(idx);
      setFade(true);
    }, 220);
  };

  // Reinicia el timer cuando el usuario hace click manual
  const irAManual = (idx) => {
    clearInterval(timerRef.current);
    irA(idx);
    timerRef.current = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setActual((prev) => (prev + 1) % CURIOSIDADES.length);
        setFade(true);
      }, 220);
    }, 5000);
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setActual((prev) => (prev + 1) % CURIOSIDADES.length);
        setFade(true);
      }, 220);
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, []);

  const c = CURIOSIDADES[actual];
  const catStyle = CAT_STYLES[c.categoria] ?? CAT_STYLES["Dato curioso"];

  return (
    <section className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-10">
      <div
        className="rounded-xl overflow-hidden"
        style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
      >
        {/* Barra superior con color de categoría */}
        <div className="h-0.5 w-full" style={{ backgroundColor: catStyle.color, opacity: 0.6 }} />

        {/* Contenido */}
        <div className="px-6 pt-5 pb-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-2)" }}>
              ¿Sabías que…?
            </span>
            <span
              className="text-xs font-semibold rounded-full px-2.5 py-1"
              style={{ backgroundColor: catStyle.bg, color: catStyle.color, border: `1px solid ${catStyle.border}` }}
            >
              {c.categoria}
            </span>
          </div>

          {/* Texto con fade */}
          <div
            className="min-h-[3.5rem]"
            style={{
              opacity: fade ? 1 : 0,
              transform: fade ? "translateY(0)" : "translateY(4px)",
              transition: "opacity 220ms ease, transform 220ms ease",
            }}
          >
            <p className="text-base sm:text-lg font-medium leading-snug" style={{ color: "var(--text-1)" }}>
              {c.texto}
            </p>
          </div>
        </div>

        {/* Dots */}
        <div className="px-6 pb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {CURIOSIDADES.map((_, i) => (
              <button
                key={i}
                onClick={() => irAManual(i)}
                aria-label={`Curiosidad ${i + 1}`}
                className="rounded-full focus:outline-none transition-all duration-300"
                style={{
                  width: i === actual ? "20px" : "8px",
                  height: "8px",
                  backgroundColor: i === actual ? catStyle.color : "var(--border)",
                  opacity: i === actual ? 1 : 0.6,
                }}
              />
            ))}
          </div>
          <span className="text-xs tabular-nums" style={{ color: "var(--text-2)" }}>
            {actual + 1} / {CURIOSIDADES.length}
          </span>
        </div>
      </div>
    </section>
  );
}
