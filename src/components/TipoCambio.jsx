import { useState } from "react";
import tcData from "../data/tipo-cambio.json";

const { entidades, mejorCompra, mejorVenta, historico } = tcData;

// ── Helpers ───────────────────────────────────────────────────────────────────

function tiempoDesde(isoStr) {
  if (!isoStr) return null;
  const diff = Date.now() - new Date(isoStr).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1)  return "hace menos de un minuto";
  if (min < 60) return `hace ${min} minuto${min !== 1 ? "s" : ""}`;
  const h = Math.floor(min / 60);
  return `hace ${h} hora${h !== 1 ? "s" : ""}`;
}

// ── Favicon map: slug → URL real ──────────────────────────────────────────────
// Solo para entidades con URL de favicon conocida; el resto usa iniciales.
const FAVICON_MAP = {
  "bncr.fi.cr":         "https://www.bncr.fi.cr/favicon.ico",
  "bancobcr.com":       "https://www.bancobcr.com/favicon.ico",
  "bancopopular.fi.cr": "https://www.bancopopular.fi.cr/favicon.ico",
  "bac.cr":             "https://www.bac.cr/favicon.ico",
  "davivienda.com":     "https://www.davivienda.cr/favicon.ico",
  "bancobct.com":       "https://www.bct.fi.cr/favicon.ico",
  "lafise.com":         "https://www.lafise.com/favicon.ico",
  "promerica.fi.cr":    "https://www.promerica.fi.cr/favicon.ico",
  "coopeande.com":      "https://www.coopeande1.com/favicon.ico",
  "coopecaja.fi.cr":    "https://www.coopecaja.fi.cr/favicon.ico",
  "coopenae.fi.cr":     "https://www.coopenae.fi.cr/favicon.ico",
};

// ── Sparkline SVG ─────────────────────────────────────────────────────────────
const MOCK_TC = [514,511,509,513,507,502,498,500,495,491,488,485,482,479,476,473,470,468,465,463,461,460,458,456];
const sparkValues =
  historico.length > 0 ? historico.map((d) => d.compra).filter(Boolean) : MOCK_TC;

function Sparkline({ values }) {
  if (!values || values.length < 2) return null;
  const W = 180, H = 48, PAD = 2;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => [
    PAD + (i / (values.length - 1)) * (W - PAD * 2),
    PAD + ((max - v) / range) * (H - PAD * 2),
  ]);
  const line = pts.map(([x, y]) => `${x},${y}`).join(" ");
  const area = `${pts[0][0]},${H} ${line} ${pts.at(-1)[0]},${H}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#sg)" />
      <polyline points={line} fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Logo con favicon real + fallback de iniciales ─────────────────────────────
function BankLogo({ nombre, slug, size = 28 }) {
  const [failed, setFailed] = useState(false);
  const faviconUrl = FAVICON_MAP[slug];
  const initials = nombre
    .split(" ")
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  const radius = Math.round(size * 0.214); // ~6px para 28px, ~5px para 24px
  const cls = `flex items-center justify-center flex-shrink-0 overflow-hidden`;

  if (!faviconUrl || failed) {
    return (
      <div
        className={cls}
        style={{
          width: size, height: size,
          borderRadius: radius,
          background: "var(--accent-dim)",
          color: "var(--accent)",
          border: "1px solid var(--accent-border)",
          fontSize: size <= 24 ? 9 : 11,
          fontWeight: 700,
        }}
      >
        {initials}
      </div>
    );
  }
  return (
    <div
      className={`${cls} bg-white`}
      style={{ width: size, height: size, borderRadius: radius, border: "1px solid rgba(0,0,0,0.08)" }}
    >
      <img
        src={faviconUrl}
        alt={nombre}
        style={{ width: size - 6, height: size - 6, objectFit: "contain" }}
        onError={() => setFailed(true)}
      />
    </div>
  );
}

// ── Hero: Ganadores del día ───────────────────────────────────────────────────
function HeroGanadores() {
  const tiempo = tiempoDesde(tcData.ultimaActualizacion);

  const cards = [
    {
      label: "Mejor compra",
      subtxt: "Comprá aquí",
      valor: mejorCompra.valor,
      nombre: mejorCompra.nombre,
      slug: entidades.find((e) => e.nombre === mejorCompra.nombre)?.slug,
      accent: "var(--accent)",
      accentDim: "var(--accent-dim)",
      accentBorder: "var(--accent-border)",
    },
    {
      label: "Mejor venta",
      subtxt: "Vendé aquí",
      valor: mejorVenta.valor,
      nombre: mejorVenta.nombre,
      slug: entidades.find((e) => e.nombre === mejorVenta.nombre)?.slug,
      accent: "#3b82f6",
      accentDim: "rgba(59,130,246,0.10)",
      accentBorder: "rgba(59,130,246,0.25)",
    },
  ];

  return (
    <div className="mb-8">
      {/* Título */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-1 mb-4">
        <h2 className="text-xl font-bold" style={{ color: "var(--text-1)" }}>
          Ganadores del día
        </h2>
        {tiempo && (
          <span className="text-xs" style={{ color: "var(--text-2)" }}>
            Actualizado {tiempo}
          </span>
        )}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-xl p-5 sm:p-6 flex flex-col gap-3"
            style={{
              backgroundColor: "var(--surface)",
              border: `1px solid ${c.accentBorder}`,
            }}
          >
            {/* Label + logo */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: c.accent }}>
                {c.label}
              </span>
              <BankLogo nombre={c.nombre} slug={c.slug} size={28} />
            </div>

            {/* Valor */}
            <div>
              <span
                className="tabular-nums font-black leading-none block"
                style={{ fontSize: "clamp(36px, 6vw, 56px)", color: c.accent }}
              >
                ₡{c.valor.toFixed(2)}
              </span>
              <p className="mt-1.5 text-sm font-medium truncate" style={{ color: "var(--text-2)" }}>
                {c.nombre}
              </p>
            </div>

            {/* Badge */}
            <div>
              <span
                className="inline-block text-xs font-bold rounded-full px-3 py-1"
                style={{ backgroundColor: c.accentDim, color: c.accent, border: `1px solid ${c.accentBorder}` }}
              >
                {c.subtxt}
              </span>
            </div>

            {/* Sparkline solo en la card de compra */}
            {c.label === "Mejor compra" && (
              <div className="mt-1 opacity-70">
                <p className="text-[10px] mb-1" style={{ color: "var(--text-2)" }}>
                  Tendencia 2 años
                </p>
                <Sparkline values={sparkValues} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tabla ordenable ───────────────────────────────────────────────────────────
const COLS = {
  compra:       { label: "Compra",       numeric: true  },
  venta:        { label: "Venta",        numeric: true  },
  diferencial:  { label: "Diferencial",  numeric: true  },
};

function SortIcon({ active, dir }) {
  return (
    <span className="inline-flex flex-col leading-none ml-1 select-none" style={{ fontSize: 8, gap: 0.5 }}>
      <span style={{ color: active && dir === "asc"  ? "var(--accent)" : "var(--text-2)", opacity: active && dir === "asc"  ? 1 : 0.4 }}>▲</span>
      <span style={{ color: active && dir === "desc" ? "var(--accent)" : "var(--text-2)", opacity: active && dir === "desc" ? 1 : 0.4 }}>▼</span>
    </span>
  );
}

function TablaEntidades() {
  const [sort, setSort] = useState({ col: "compra", dir: "desc" });

  const toggleSort = (col) => {
    setSort((prev) =>
      prev.col === col
        ? { col, dir: prev.dir === "desc" ? "asc" : "desc" }
        : { col, dir: col === "venta" || col === "diferencial" ? "asc" : "desc" }
    );
  };

  // Siempre lista plana cuando hay sort activo
  const sorted = [...entidades].sort((a, b) => {
    const mult = sort.dir === "desc" ? -1 : 1;
    return mult * (a[sort.col] - b[sort.col]);
  });

  // Agrupación solo cuando no hay sort (estado inicial nunca llega aquí con sort por defecto)
  const grupos = [];
  if (!sort.col) {
    const visto = {};
    for (const e of entidades) {
      if (!visto[e.tipoEntidad]) { visto[e.tipoEntidad] = true; grupos.push({ tipo: e.tipoEntidad, items: [] }); }
      grupos.at(-1).items.push(e);
    }
  }

  const filas = sort.col ? sorted : entidades;

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
      <div className="overflow-x-auto">
        <table className="w-full" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--surface)" }}>
              {/* Entidad — no ordenable */}
              <th
                className="text-left px-4 py-3 font-semibold uppercase tracking-wide"
                style={{ color: "var(--text-2)", fontSize: 12 }}
              >
                Entidad
              </th>

              {/* Compra */}
              <th
                className="text-right px-4 py-3 font-semibold uppercase tracking-wide cursor-pointer select-none"
                style={{ color: sort.col === "compra" ? "var(--accent)" : "var(--text-2)", fontSize: 12 }}
                onClick={() => toggleSort("compra")}
              >
                Compra <SortIcon active={sort.col === "compra"} dir={sort.dir} />
              </th>

              {/* Venta */}
              <th
                className="text-right px-4 py-3 font-semibold uppercase tracking-wide cursor-pointer select-none"
                style={{ color: sort.col === "venta" ? "var(--accent)" : "var(--text-2)", fontSize: 12 }}
                onClick={() => toggleSort("venta")}
              >
                Venta <SortIcon active={sort.col === "venta"} dir={sort.dir} />
              </th>

              {/* Diferencial — oculto en móvil */}
              <th
                className="text-right px-4 py-3 font-semibold uppercase tracking-wide cursor-pointer select-none hidden sm:table-cell"
                style={{ color: sort.col === "diferencial" ? "var(--accent)" : "var(--text-2)", fontSize: 12 }}
                onClick={() => toggleSort("diferencial")}
              >
                Difer. <SortIcon active={sort.col === "diferencial"} dir={sort.dir} />
              </th>

              {/* Actualización — solo desktop */}
              <th
                className="text-right px-4 py-3 font-semibold uppercase tracking-wide hidden lg:table-cell"
                style={{ color: "var(--text-2)", fontSize: 12 }}
              >
                Actualización
              </th>
            </tr>
          </thead>

          <tbody>
            {/* Fila de tipo si hay sort: mostrar un separador de categoría inline */}
            {filas.map((e, idx) => {
              const esMejorCompra = e.compra === mejorCompra.valor;
              const esMejorVenta  = e.venta  === mejorVenta.valor;
              const prevTipo = idx > 0 ? filas[idx - 1].tipoEntidad : null;
              const showGroup = sort.col && e.tipoEntidad !== prevTipo;

              return (
                <>
                  {/* Separador de grupo (solo en vista ordenada) */}
                  {showGroup && (
                    <tr key={`g-${e.tipoEntidad}-${idx}`} style={{ backgroundColor: "var(--accent-dim)" }}>
                      <td
                        colSpan={5}
                        className="px-4 py-1 font-semibold uppercase tracking-wider"
                        style={{ color: "var(--accent)", fontSize: 10, borderBottom: "1px solid var(--accent-border)" }}
                      >
                        {e.tipoEntidad}
                      </td>
                    </tr>
                  )}

                  <tr
                    key={e.nombre}
                    className="transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    {/* Logo + nombre */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="hidden sm:flex">
                          <BankLogo nombre={e.nombre} slug={e.slug} size={28} />
                        </span>
                        <span className="flex sm:hidden">
                          <BankLogo nombre={e.nombre} slug={e.slug} size={24} />
                        </span>
                        <span className="font-medium leading-tight" style={{ color: "var(--text-1)", fontSize: 15 }}>
                          {e.nombre}
                        </span>
                      </div>
                    </td>

                    {/* Compra */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {esMejorCompra && (
                          <span
                            className="hidden sm:inline text-[10px] font-semibold rounded-full px-2 py-0.5"
                            style={{ backgroundColor: "var(--accent-dim)", color: "var(--accent)", border: "1px solid var(--accent-border)" }}
                          >
                            Mejor compra
                          </span>
                        )}
                        <span
                          className="tabular-nums font-bold"
                          style={{ color: esMejorCompra ? "var(--accent)" : "var(--text-1)", fontSize: 16 }}
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
                          className="tabular-nums font-bold"
                          style={{ color: esMejorVenta ? "#3b82f6" : "var(--text-1)", fontSize: 16 }}
                        >
                          ₡{e.venta.toFixed(2)}
                        </span>
                      </div>
                    </td>

                    {/* Diferencial */}
                    <td className="px-4 py-3 text-right hidden sm:table-cell">
                      <span
                        className="tabular-nums font-mono px-2 py-1 rounded"
                        style={{
                          backgroundColor: "var(--surface)",
                          color: "var(--text-2)",
                          border: "1px solid var(--border)",
                          fontSize: 14,
                        }}
                      >
                        ₡{e.diferencial.toFixed(2)}
                      </span>
                    </td>

                    {/* Actualización */}
                    <td className="px-4 py-3 text-right hidden lg:table-cell">
                      <span style={{ color: "var(--text-2)", fontSize: 12 }}>
                        {e.ultimaActualizacion}
                      </span>
                    </td>
                  </tr>
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function TipoCambio() {
  return (
    <section className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10">
      <HeroGanadores />

      {/* Encabezado tabla */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold" style={{ color: "var(--text-1)" }}>
          Tipo de cambio en ventanilla
        </h2>
        <div className="flex gap-2 text-xs">
          <span
            className="rounded-full px-2.5 py-1 font-medium"
            style={{ backgroundColor: "var(--accent-dim)", color: "var(--accent)", border: "1px solid var(--accent-border)" }}
          >
            Mejor compra
          </span>
          <span className="rounded-full px-2.5 py-1 font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
            Mejor venta
          </span>
        </div>
      </div>

      <TablaEntidades />

      <p className="mt-3 text-right" style={{ color: "var(--text-2)", fontSize: 12 }}>
        Fuente: BCCR · Tipo de cambio anunciado en ventanilla · Clic en columnas para ordenar
      </p>
    </section>
  );
}
