const CURIOSIDADES = [
  {
    id: 1,
    categoria: "Tipo de cambio",
    texto: "Hace un año el dólar se compraba a ₡510 en el Banco Nacional. Hoy se compra a ₡456, una caída de ₡54 en 12 meses.",
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
    categoria: "Dato operativo",
    texto: "El diferencial cambiario varía entre ₡6 y ₡24 según la entidad financiera.",
  },
  {
    id: 5,
    categoria: "Combustibles",
    texto: "El Gas LP mantiene su precio en ₡242 por litro, sin cambios en los últimos dos meses.",
  },
  {
    id: 6,
    categoria: "Tipo de cambio",
    texto: "Las casas de cambio suelen ofrecer mejor tipo de compra que varios bancos, pero con mayor diferencial de venta.",
  },
];

const CAT_STYLES = {
  "Tipo de cambio": { color: "var(--blue)", bg: "var(--blue-dim)", border: "var(--blue-border)" },
  "Combustibles": { color: "var(--warning)", bg: "rgba(183,121,31,0.10)", border: "rgba(183,121,31,0.20)" },
  "Dato operativo": { color: "var(--accent)", bg: "var(--accent-dim)", border: "var(--accent-border)" },
};

const tickerItems = [...CURIOSIDADES, ...CURIOSIDADES];

export default function Curiosity() {
  return (
    <section className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10">
      <div className="terminal-panel rounded-2xl overflow-hidden">
        <div
          className="flex items-center gap-3 px-4 sm:px-5 py-3 border-b"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-2)" }}
        >
          <span className="eyebrow">Radar de mercado</span>
          <span className="text-xs" style={{ color: "var(--text-3)" }}>
            Indicadores rápidos para contexto diario
          </span>
        </div>

        <div className="ticker-mask px-0 py-3" style={{ backgroundColor: "var(--surface)" }}>
          <div className="ticker-track">
            {tickerItems.map((item, idx) => {
              const style = CAT_STYLES[item.categoria] ?? CAT_STYLES["Dato operativo"];
              return (
                <div key={`${item.id}-${idx}`} className="flex items-center gap-3 px-4 sm:px-5 whitespace-nowrap">
                  <span
                    className="inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]"
                    style={{ color: style.color, backgroundColor: style.bg, border: `1px solid ${style.border}` }}
                  >
                    {item.categoria}
                  </span>
                  <span className="text-sm" style={{ color: "var(--text-2)" }}>
                    {item.texto}
                  </span>
                  <span style={{ color: "var(--border-strong)" }}>•</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
