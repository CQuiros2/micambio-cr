const MOCK_COMBUSTIBLES = [
  {
    tipo: "super",
    label: "Gasolina Super",
    precio: 633,
    anterior: 628,
    icono: "⛽",
    color: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      badge: "bg-amber-100 text-amber-800",
      precio: "text-amber-700",
      icon: "bg-amber-100 text-amber-600",
    },
  },
  {
    tipo: "regular",
    label: "Gasolina Regular",
    precio: 607,
    anterior: 593,
    icono: "⛽",
    color: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      badge: "bg-orange-100 text-orange-800",
      precio: "text-orange-700",
      icon: "bg-orange-100 text-orange-600",
    },
  },
  {
    tipo: "diesel",
    label: "Diésel",
    precio: 530,
    anterior: 549,
    icono: "🚛",
    color: {
      bg: "bg-slate-50",
      border: "border-slate-200",
      badge: "bg-slate-100 text-slate-700",
      precio: "text-slate-700",
      icon: "bg-slate-100 text-slate-600",
    },
  },
  {
    tipo: "gaslp",
    label: "Gas LP",
    precio: 242,
    anterior: 242,
    icono: "🔥",
    color: {
      bg: "bg-sky-50",
      border: "border-sky-200",
      badge: "bg-sky-100 text-sky-800",
      precio: "text-sky-700",
      icon: "bg-sky-100 text-sky-500",
    },
  },
];

function VariacionBadge({ precio, anterior }) {
  const diff = precio - anterior;
  if (diff === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-full px-2.5 py-1">
        <span>→</span> Sin cambio
      </span>
    );
  }
  const sube = diff > 0;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2.5 py-1 ${
        sube
          ? "bg-red-100 text-red-600"
          : "bg-emerald-100 text-emerald-600"
      }`}
    >
      <span>{sube ? "↑" : "↓"}</span>
      {sube ? "+" : ""}
      {diff} vs anterior
    </span>
  );
}

export default function Combustible() {
  return (
    <section className="px-4 sm:px-6 py-8 max-w-5xl mx-auto w-full">
      {/* Encabezado */}
      <div className="flex items-start justify-between mb-5 gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-gray-900 leading-tight">
            Combustibles
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Precio en colones por litro · Tarifa ARESEP vigente
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5">
          <span>🗓️</span>
          ARESEP actualiza cada 2do viernes del mes
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {MOCK_COMBUSTIBLES.map((c) => (
          <div
            key={c.tipo}
            className={`rounded-2xl border p-5 flex flex-col gap-3 ${c.color.bg} ${c.color.border} shadow-sm hover:shadow-md transition-shadow`}
          >
            {/* Icono + label */}
            <div className="flex items-center justify-between">
              <span
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${c.color.icon}`}
              >
                {c.icono}
              </span>
              <span
                className={`text-xs font-semibold rounded-full px-2.5 py-1 ${c.color.badge}`}
              >
                {c.label}
              </span>
            </div>

            {/* Precio */}
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                Precio / litro
              </p>
              <p className={`text-4xl font-bold leading-none tabular-nums ${c.color.precio}`}>
                ₡{c.precio}
              </p>
            </div>

            {/* Variación */}
            <VariacionBadge precio={c.precio} anterior={c.anterior} />
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-3 text-right">
        * Datos de ejemplo — se conectarán a ARESEP en producción
      </p>
    </section>
  );
}
