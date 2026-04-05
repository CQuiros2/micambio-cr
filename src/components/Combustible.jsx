import combustibleData from "../data/combustible.json";

const { precios, ultimaActualizacion } = combustibleData;

const COMBUSTIBLE_CONFIG = {
  super:   { label: "Gasolina Super",   color: "#3b82f6" },
  regular: { label: "Gasolina Regular", color: "#22c55e" },
  diesel:  { label: "Diésel",           color: "#f59e0b" },
  gaslp:   { label: "Gas LP",           color: "#f97316" },
};

function VariacionBadge({ variacion }) {
  if (variacion === null || variacion === undefined) return null;
  if (variacion === 0) {
    return (
      <span className="text-xs font-medium" style={{ color: "var(--text-2)" }}>
        Sin cambio
      </span>
    );
  }
  const sube = variacion > 0;
  return (
    <span className="flex items-center gap-1 text-sm font-semibold" style={{ color: sube ? "#ef4444" : "#22c55e" }}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
        {sube
          ? <path d="M6 1l4 5H2z" />
          : <path d="M6 11L2 6h8z" />}
      </svg>
      {sube ? "+" : ""}{variacion} vs anterior
    </span>
  );
}

export default function Combustible() {
  const fechaActualizacion = ultimaActualizacion
    ? new Date(ultimaActualizacion).toLocaleDateString("es-CR", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <section className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-1.5 mb-5">
        <div>
          <h2 className="text-lg font-bold" style={{ color: "var(--text-1)" }}>
            Combustibles
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-2)" }}>
            Precio en colones por litro · Tarifa ARESEP vigente
          </p>
        </div>
        <p className="text-xs font-medium" style={{ color: "var(--text-2)" }}>
          ARESEP actualiza cada 2do viernes del mes
        </p>
      </div>

      {/* Cards — 2 col en móvil, 4 col en desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Object.entries(COMBUSTIBLE_CONFIG).map(([tipo, { label, color }]) => {
          const info = precios[tipo];
          if (!info) return null;
          return (
            <div
              key={tipo}
              className="rounded-xl p-4 sm:p-5 flex flex-col gap-3 sm:gap-4"
              style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
            >
              {/* Label + punto de color */}
              <div className="flex items-center justify-between gap-2">
                <span
                  className="font-bold uppercase tracking-widest leading-tight"
                  style={{ color, fontSize: 11 }}
                >
                  {label}
                </span>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
              </div>

              {/* Precio — más pequeño en móvil */}
              <div>
                <p className="font-medium uppercase tracking-wide mb-1" style={{ color: "var(--text-2)", fontSize: 10 }}>
                  Precio / litro
                </p>
                <span
                  className="tabular-nums font-black leading-none block"
                  style={{ color, fontSize: "clamp(32px, 7vw, 48px)" }}
                >
                  ₡{info.precio}
                </span>
              </div>

              {/* Variación */}
              <VariacionBadge variacion={info.variacion} />
            </div>
          );
        })}
      </div>

      {fechaActualizacion && (
        <p className="mt-3 text-right text-xs" style={{ color: "var(--text-2)" }}>
          Actualizado: {fechaActualizacion} · Fuente: ARESEP
        </p>
      )}
    </section>
  );
}
