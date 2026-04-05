import { useState, useEffect } from "react";

const CURIOSIDADES = [
  {
    id: 1,
    icono: "📈",
    texto:
      "Hace un año el dólar se compraba a ₡510 en el BN. Hoy se compra a ₡493 — una caída de ₡17.",
    categoria: "Tipo de cambio",
  },
  {
    id: 2,
    icono: "⛽",
    texto:
      "La gasolina súper bajó ₡95 en los últimos 12 meses: de ₡728 pasó a ₡633 por litro.",
    categoria: "Combustibles",
  },
  {
    id: 3,
    icono: "🚛",
    texto:
      "El diésel acumula una baja de ₡108 en el último año, pasando de ₡638 a ₡530 por litro.",
    categoria: "Combustibles",
  },
  {
    id: 4,
    icono: "💡",
    texto:
      "El diferencial cambiario (diferencia entre compra y venta) varía entre ₡8 y ₡17 según el banco.",
    categoria: "Dato curioso",
  },
  {
    id: 5,
    icono: "🔥",
    texto:
      "El Gas LP no ha cambiado de precio en los últimos dos meses: sigue en ₡242 por litro.",
    categoria: "Combustibles",
  },
  {
    id: 6,
    icono: "🏦",
    texto:
      "El Banco Nacional ofrece el mejor tipo de compra del dólar entre los bancos estatales.",
    categoria: "Tipo de cambio",
  },
];

const CATEGORIA_COLORS = {
  "Tipo de cambio": "bg-blue-100 text-blue-700",
  Combustibles: "bg-amber-100 text-amber-700",
  "Dato curioso": "bg-purple-100 text-purple-700",
};

export default function Curiosity() {
  const [actual, setActual] = useState(0);
  const [animando, setAnimando] = useState(false);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setAnimando(true);
      setTimeout(() => {
        setActual((prev) => (prev + 1) % CURIOSIDADES.length);
        setAnimando(false);
      }, 300);
    }, 5000);
    return () => clearInterval(intervalo);
  }, []);

  const curiosidad = CURIOSIDADES[actual];

  const irA = (idx) => {
    if (idx === actual) return;
    setAnimando(true);
    setTimeout(() => {
      setActual(idx);
      setAnimando(false);
    }, 200);
  };

  return (
    <section className="px-4 sm:px-6 py-8 max-w-5xl mx-auto w-full">
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-blue-50 overflow-hidden shadow-sm">
        <div className="px-6 pt-5 pb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">
            ¿Sabías que…?
          </h2>
          <span
            className={`text-xs font-medium rounded-full px-2.5 py-1 ${
              CATEGORIA_COLORS[curiosidad.categoria] ?? "bg-gray-100 text-gray-600"
            }`}
          >
            {curiosidad.categoria}
          </span>
        </div>

        {/* Contenido animado */}
        <div
          className={`px-6 py-4 transition-all duration-300 ${
            animando ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"
          }`}
        >
          <div className="flex items-start gap-4">
            <span className="text-4xl flex-shrink-0 mt-0.5 select-none">
              {curiosidad.icono}
            </span>
            <p className="text-gray-800 text-base sm:text-lg font-medium leading-snug">
              {curiosidad.texto}
            </p>
          </div>
        </div>

        {/* Dots + contador */}
        <div className="px-6 pb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {CURIOSIDADES.map((_, i) => (
              <button
                key={i}
                onClick={() => irA(i)}
                aria-label={`Ir a curiosidad ${i + 1}`}
                className={`rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                  i === actual
                    ? "w-5 h-2 bg-indigo-500"
                    : "w-2 h-2 bg-indigo-200 hover:bg-indigo-300"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-indigo-400 tabular-nums">
            {actual + 1} / {CURIOSIDADES.length}
          </span>
        </div>
      </div>
    </section>
  );
}
