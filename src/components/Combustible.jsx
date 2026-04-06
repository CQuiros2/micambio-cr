import combustibleData from "../data/combustible.json";

const { precios, ultimaActualizacion } = combustibleData;

const COMBUSTIBLE_CONFIG = {
  super: { label: "Gasolina Super", color: "#2457d6" },
  regular: { label: "Gasolina Regular", color: "#0b6b57" },
  diesel: { label: "Diésel", color: "#b7791f" },
  gaslp: { label: "Gas LP", color: "#9a5b1b" },
};

function VariacionBadge({ variacion, color }) {
  if (variacion === null || variacion === undefined) return null;
  if (variacion === 0) {
    return (
      <span className="text-xs font-medium uppercase tracking-[0.08em]" style={{ color: "var(--text-3)" }}>
        Sin cambio
      </span>
    );
  }

  const sube = variacion > 0;

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.08em]" style={{ color: sube ? "#c2410c" : color }}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
        {sube ? <path d="M6 1l4 5H2z" /> : <path d="M6 11L2 6h8z" />}
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
    <section className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-5">
        <div>
          <p className="eyebrow mb-2">Energía</p>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: "var(--text-1)" }}>
            Combustibles
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--text-2)" }}>
            Tarifas vigentes por litro según ARESEP.
          </p>
        </div>
        <p className="text-xs sm:text-sm" style={{ color: "var(--text-3)" }}>
          Actualización regulatoria usual: segundo viernes de cada mes.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Object.entries(COMBUSTIBLE_CONFIG).map(([tipo, { label, color }]) => {
          const info = precios[tipo];
          if (!info) return null;

          return (
            <article
              key={tipo}
              className="terminal-panel rounded-2xl p-5 flex flex-col gap-4"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="eyebrow" style={{ color }}>{label}</p>
                  <p className="mt-1 text-xs" style={{ color: "var(--text-3)" }}>
                    Mercado regulado
                  </p>
                </div>
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
              </div>

              <div className="terminal-inset rounded-2xl p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-2" style={{ color: "var(--text-2)" }}>
                  Precio por litro
                </p>
                <p className="metric-value font-black leading-none" style={{ color, fontSize: "clamp(34px, 6vw, 48px)" }}>
                  ₡{info.precio}
                </p>
              </div>

              <div className="flex items-center justify-between gap-3">
                <VariacionBadge variacion={info.variacion} color={color} />
              </div>
            </article>
          );
        })}
      </div>

      {fechaActualizacion && (
        <p className="mt-3 text-right text-xs sm:text-sm" style={{ color: "var(--text-3)" }}>
          Actualizado: {fechaActualizacion}. Fuente: ARESEP.
        </p>
      )}
    </section>
  );
}
