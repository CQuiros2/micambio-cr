import { useState } from "react";
import tcData from "../data/tipo-cambio.json";

const { entidades, mejorCompra, mejorVenta, historico } = tcData;

// Sparkline: usa historico real si existe, si no mock representativo de CR
const MOCK_TC = [514,511,509,513,507,502,498,500,495,491,488,485,482,479,476,473,470,468,465,463,461,460,458,456];
const sparkValues =
  historico.length > 0 ? historico.map((d) => d.compra).filter(Boolean) : MOCK_TC;

// ── Sparkline SVG ─────────────────────────────────────────────────────────────
function Sparkline({ values }) {
  if (!values || values.length < 2) return null;
  const W = 200, H = 52, PAD = 3;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = PAD + (i / (values.length - 1)) * (W - PAD * 2);
    const y = PAD + ((max - v) / range) * (H - PAD * 2);
    return [x, y];
  });
  const line = pts.map(([x, y]) => `${x},${y}`).join(" ");
  const area =
    `${pts[0][0]},${H} ` + line + ` ${pts[pts.length - 1][0]},${H}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} preserveAspectRatio="none" className="overflow-visible">
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#sg)" />
      <polyline points={line} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Logo de banco con Clearbit + fallback de iniciales ────────────────────────
function BankLogo({ nombre, slug }) {
  const [failed, setFailed] = useState(false);
  const initials = nombre
    .split(" ")
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  if (failed || !slug) {
    return (
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-[11px] font-bold"
        style={{ background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid var(--accent-border)" }}
      >
        {initials}
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 overflow-hidden border border-black/[0.06]">
      <img
        src={`https://logo.clearbit.com/${slug}`}
        alt={nombre}
        className="w-6 h-6 object-contain"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

// ── Tabla agrupada ────────────────────────────────────────────────────────────
function TablaEntidades() {
  // Agrupar por tipoEntidad preservando orden de aparición
  const grupos = [];
  const visto = {};
  for (const e of entidades) {
    if (!visto[e.tipoEntidad]) {
      visto[e.tipoEntidad] = true;
      grupos.push({ tipo: e.tipoEntidad, items: [] });
    }
    grupos[grupos.length - 1].items.push(e);
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid var(--border)" }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--surface)" }}>
              <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "var(--text-2)" }}>
                Entidad
              </th>
              <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "var(--text-2)" }}>
                Compra
              </th>
              <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "var(--text-2)" }}>
                Venta
              </th>
              <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wide hidden sm:table-cell" style={{ color: "var(--text-2)" }}>
                Diferencial
              </th>
              <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wide hidden lg:table-cell" style={{ color: "var(--text-2)" }}>
                Actualización
              </th>
            </tr>
          </thead>
          <tbody>
            {grupos.map(({ tipo, items }) => (
              <>
                {/* Encabezado de grupo */}
                <tr key={`h-${tipo}`} style={{ backgroundColor: "var(--accent-dim)", borderBottom: "1px solid var(--accent-border)" }}>
                  <td colSpan={5} className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--accent)" }}>
                    {tipo}
                  </td>
                </tr>
                {/* Filas de entidades */}
                {items.map((e) => {
                  const esMejorCompra = e.compra === mejorCompra.valor;
                  const esMejorVenta  = e.venta  === mejorVenta.valor;
                  return (
                    <tr
                      key={e.nombre}
                      className="transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                      style={{ borderBottom: "1px solid var(--border)" }}
                    >
                      {/* Logo + nombre */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <BankLogo nombre={e.nombre} slug={e.slug} />
                          <span className="font-medium text-sm leading-tight" style={{ color: "var(--text-1)" }}>
                            {e.nombre}
                          </span>
                        </div>
                      </td>

                      {/* Compra */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {esMejorCompra && (
                            <span className="hidden sm:inline text-[10px] font-semibold rounded-full px-2 py-0.5" style={{ backgroundColor: "var(--accent-dim)", color: "var(--accent)", border: "1px solid var(--accent-border)" }}>
                              Mejor compra
                            </span>
                          )}
                          <span
                            className="tabular-nums font-semibold text-sm"
                            style={{ color: esMejorCompra ? "var(--accent)" : "var(--text-1)" }}
                          >
                            ₡{e.compra.toFixed(2)}
                          </span>
                        </div>
                      </td>

                      {/* Venta */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {esMejorVenta && (
                            <span className="hidden sm:inline text-[10px] font-semibold rounded-full px-2 py-0.5 bg-blue-500/10 text-blue-500 border border-blue-500/20">
                              Mejor venta
                            </span>
                          )}
                          <span
                            className="tabular-nums font-semibold text-sm"
                            style={{ color: esMejorVenta ? "#3b82f6" : "var(--text-1)" }}
                          >
                            ₡{e.venta.toFixed(2)}
                          </span>
                        </div>
                      </td>

                      {/* Diferencial */}
                      <td className="px-4 py-3 text-right hidden sm:table-cell">
                        <span
                          className="tabular-nums text-xs font-mono px-2 py-1 rounded"
                          style={{ backgroundColor: "var(--surface)", color: "var(--text-2)", border: "1px solid var(--border)" }}
                        >
                          ₡{e.diferencial.toFixed(2)}
                        </span>
                      </td>

                      {/* Actualización */}
                      <td className="px-4 py-3 text-right hidden lg:table-cell">
                        <span className="text-xs" style={{ color: "var(--text-2)" }}>
                          {e.ultimaActualizacion}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function TipoCambio() {
  return (
    <section className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-10">
      {/* Hero */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-2)" }}>
            Mejor compra · USD/CRC
          </p>
          <div className="flex items-baseline gap-3">
            <span
              className="text-6xl font-black tabular-nums tracking-tight leading-none"
              style={{ color: "var(--text-1)" }}
            >
              ₡{mejorCompra.valor.toFixed(2)}
            </span>
          </div>
          <p className="mt-1.5 text-sm" style={{ color: "var(--text-2)" }}>
            {mejorCompra.nombre}
          </p>
        </div>

        {/* Sparkline */}
        <div className="sm:pb-1">
          <p className="text-[11px] mb-1 text-right" style={{ color: "var(--text-2)" }}>
            Últimos 2 años
          </p>
          <Sparkline values={sparkValues} />
        </div>
      </div>

      {/* Encabezado sección */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold" style={{ color: "var(--text-1)" }}>
          Tipo de cambio en ventanilla
        </h2>
        <div className="flex gap-3 text-xs">
          <span className="rounded-full px-2.5 py-1 font-medium" style={{ backgroundColor: "var(--accent-dim)", color: "var(--accent)", border: "1px solid var(--accent-border)" }}>
            Mejor compra
          </span>
          <span className="rounded-full px-2.5 py-1 font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
            Mejor venta
          </span>
        </div>
      </div>

      <TablaEntidades />

      <p className="mt-3 text-right text-xs" style={{ color: "var(--text-2)" }}>
        Fuente: BCCR · Tipo de cambio anunciado en ventanilla
      </p>
    </section>
  );
}
