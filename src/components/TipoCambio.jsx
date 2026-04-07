import { Fragment, useState } from "react";
import tcData from "../data/tipo-cambio.json";
import { EntityIdentity } from "./EntityIdentity";

const { entidades, mejorCompra, mejorVenta } = tcData;

function formatCurrency(value) {
  return `₡${value.toFixed(2)}`;
}

function formatMobileUpdate(value) {
  if (typeof value !== "string") return value;
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}:\d{2}\s+[ap]\.m\.)$/i);
  if (!match) return value;
  const [, day, month, , time] = match;
  return `${day}/${month} · ${time.toLowerCase()}`;
}

function SortIcon({ active, dir }) {
  return (
    <span className="inline-flex flex-col leading-none ml-1 align-middle" style={{ fontSize: 8, gap: 1 }}>
      <span style={{ color: active && dir === "asc" ? "var(--accent)" : "var(--text-3)", opacity: active && dir === "asc" ? 1 : 0.45 }}>▲</span>
      <span style={{ color: active && dir === "desc" ? "var(--accent)" : "var(--text-3)", opacity: active && dir === "desc" ? 1 : 0.45 }}>▼</span>
    </span>
  );
}

function SortButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em]"
      style={{
        color: active ? "var(--text-1)" : "var(--text-2)",
        backgroundColor: active ? "var(--surface-3)" : "var(--surface-2)",
        border: `1px solid ${active ? "var(--border-strong)" : "var(--border)"}`,
      }}
    >
      {children}
    </button>
  );
}

function MobileMetric({ label, value, tone = "default" }) {
  const color =
    tone === "accent"
      ? "var(--accent)"
      : tone === "blue"
        ? "var(--blue)"
        : tone === "muted"
          ? "var(--text-2)"
          : "var(--text-1)";

  return (
    <div className="terminal-inset rounded-xl px-3 py-2.5 min-w-0">
      <p className="eyebrow mb-1" style={{ fontSize: 10 }}>
        {label}
      </p>
      <p className="metric-value text-[15px] font-bold leading-none truncate" style={{ color }}>
        {value}
      </p>
    </div>
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

  const filas = [...entidades].sort((a, b) => {
    const mult = sort.dir === "desc" ? -1 : 1;
    return mult * (a[sort.col] - b[sort.col]);
  });

  return (
    <div className="terminal-panel rounded-2xl overflow-hidden" style={{ borderColor: "var(--border-strong)" }}>
      <div className="md:hidden border-b px-3 py-3" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-2)" }}>
        <p className="eyebrow">Ordenar por</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <SortButton active={sort.col === "compra"} onClick={() => toggleSort("compra")}>
            Compra
          </SortButton>
          <SortButton active={sort.col === "venta"} onClick={() => toggleSort("venta")}>
            Venta
          </SortButton>
          <SortButton active={sort.col === "diferencial"} onClick={() => toggleSort("diferencial")}>
            Diferencial
          </SortButton>
        </div>
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ backgroundColor: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
              <th className="text-left px-4 sm:px-5 py-3 sm:py-3.5">
                <span className="eyebrow">Entidad</span>
              </th>
              <th
                className="text-right px-4 sm:px-5 py-3 sm:py-3.5 cursor-pointer select-none"
                onClick={() => toggleSort("compra")}
              >
                <span className="eyebrow" style={{ color: sort.col === "compra" ? "var(--accent)" : "var(--text-2)" }}>
                  Compra <SortIcon active={sort.col === "compra"} dir={sort.dir} />
                </span>
              </th>
              <th
                className="text-right px-4 sm:px-5 py-3 sm:py-3.5 cursor-pointer select-none"
                onClick={() => toggleSort("venta")}
              >
                <span className="eyebrow" style={{ color: sort.col === "venta" ? "var(--accent)" : "var(--text-2)" }}>
                  Venta <SortIcon active={sort.col === "venta"} dir={sort.dir} />
                </span>
              </th>
              <th
                className="text-right px-4 sm:px-5 py-3 sm:py-3.5 cursor-pointer select-none hidden sm:table-cell"
                onClick={() => toggleSort("diferencial")}
              >
                <span className="eyebrow" style={{ color: sort.col === "diferencial" ? "var(--accent)" : "var(--text-2)" }}>
                  Diferencial <SortIcon active={sort.col === "diferencial"} dir={sort.dir} />
                </span>
              </th>
              <th className="text-right px-4 sm:px-5 py-3 sm:py-3.5 hidden lg:table-cell">
                <span className="eyebrow">Actualización</span>
              </th>
            </tr>
          </thead>

          <tbody>
            {filas.map((e) => {
              const esMejorCompra = e.compra === mejorCompra.valor;
              const esMejorVenta = e.venta === mejorVenta.valor;

              return (
                <tr
                  key={e.nombre}
                  className="market-row-hover hover:bg-black/[0.015] dark:hover:bg-white/[0.02]"
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <td className="px-4 sm:px-5 py-3">
                    <EntityIdentity name={e.nombre} showName compact showDomain={false} size={30} textClassName="font-medium leading-tight truncate text-[14px]" />
                    <p className="mt-0.5 ml-[42px] truncate text-[11px]" style={{ color: "var(--text-3)" }}>
                      {e.tipoEntidad}
                    </p>
                  </td>

                  <td className="px-4 sm:px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {esMejorCompra && (
                        <span
                          className="badge-soft hidden sm:inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]"
                          style={{ backgroundColor: "var(--accent-dim)", color: "var(--accent)", border: "1px solid var(--accent-border)" }}
                        >
                          Mejor
                        </span>
                      )}
                      <span className="metric-value font-bold" style={{ color: esMejorCompra ? "var(--accent)" : "var(--text-1)", fontSize: 16 }}>
                        {formatCurrency(e.compra)}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 sm:px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {esMejorVenta && (
                        <span
                          className="badge-soft hidden sm:inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]"
                          style={{ backgroundColor: "var(--blue-dim)", color: "var(--blue)", border: "1px solid var(--blue-border)" }}
                        >
                          Mejor
                        </span>
                      )}
                      <span className="metric-value font-bold" style={{ color: esMejorVenta ? "var(--blue)" : "var(--text-1)", fontSize: 16 }}>
                        {formatCurrency(e.venta)}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 sm:px-5 py-3.5 text-right hidden sm:table-cell">
                    <span
                      className="inline-flex rounded-lg px-2.5 py-1 metric-value"
                      style={{ backgroundColor: "var(--surface-2)", color: "var(--text-2)", border: "1px solid var(--border)", fontSize: 13 }}
                    >
                      {formatCurrency(e.diferencial)}
                    </span>
                  </td>

                  <td className="px-4 sm:px-5 py-3.5 text-right hidden lg:table-cell">
                    <span style={{ color: "var(--text-3)", fontSize: 12 }}>
                      {e.ultimaActualizacion}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="md:hidden">
        {filas.map((e, idx) => {
          const esMejorCompra = e.compra === mejorCompra.valor;
          const esMejorVenta = e.venta === mejorVenta.valor;
          const prevTipo = idx > 0 ? filas[idx - 1].tipoEntidad : null;
          const showGroup = e.tipoEntidad !== prevTipo;

          return (
            <Fragment key={e.nombre}>
              {showGroup && (
                <div className="px-3 pt-4 pb-2" style={{ backgroundColor: "var(--surface)" }}>
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]"
                    style={{ backgroundColor: "var(--surface-2)", color: "var(--text-2)", border: "1px solid var(--border)" }}
                  >
                    {e.tipoEntidad}
                  </span>
                </div>
              )}

              <article className="px-3 py-3 motion-card-enter" style={{ borderTop: showGroup ? "none" : "1px solid var(--border)", animationDelay: `${Math.min(idx * 18, 180)}ms` }}>
                <div className="panel-soft market-card-mobile rounded-2xl p-3">
                  <div className="flex items-start justify-between gap-3">
                    <EntityIdentity
                      name={e.nombre}
                      showName
                      compact
                      showDomain={false}
                      size={32}
                      textClassName="font-semibold leading-tight text-[13px]"
                    />
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {esMejorCompra && (
                        <span
                          className="badge-soft rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em]"
                          style={{ backgroundColor: "var(--accent-dim)", color: "var(--accent)", border: "1px solid var(--accent-border)" }}
                        >
                          Mejor compra
                        </span>
                      )}
                      {esMejorVenta && (
                        <span
                          className="badge-soft rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em]"
                          style={{ backgroundColor: "var(--blue-dim)", color: "var(--blue)", border: "1px solid var(--blue-border)" }}
                        >
                          Mejor venta
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="mt-2 text-xs" style={{ color: "var(--text-3)" }}>
                    {e.tipoEntidad}
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <MobileMetric label="Compra" value={formatCurrency(e.compra)} tone={esMejorCompra ? "accent" : "default"} />
                    <MobileMetric label="Venta" value={formatCurrency(e.venta)} tone={esMejorVenta ? "blue" : "default"} />
                  </div>

                  <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                    <div className="terminal-inset rounded-xl px-3 py-2 min-w-0">
                      <p className="eyebrow mb-1" style={{ fontSize: 10 }}>
                        Diferencial
                      </p>
                      <p className="metric-value text-[13px] font-semibold leading-none" style={{ color: "var(--text-2)" }}>
                        {formatCurrency(e.diferencial)}
                      </p>
                    </div>
                    <p className="text-[11px] leading-none whitespace-nowrap" style={{ color: "var(--text-3)" }}>
                      {formatMobileUpdate(e.ultimaActualizacion)}
                    </p>
                  </div>
                </div>
              </article>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default function TipoCambio() {
  return (
    <section className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-5">
        <div>
          <p className="eyebrow mb-2">Mercado</p>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: "var(--text-1)" }}>
            Tipo de cambio en ventanilla
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--text-2)" }}>
            Comparación ordenable por entidad, categoría y diferencial.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <span
            className="rounded-full px-2.5 py-1 font-medium uppercase tracking-[0.08em]"
            style={{ backgroundColor: "var(--accent-dim)", color: "var(--accent)", border: "1px solid var(--accent-border)" }}
          >
            Mejor compra
          </span>
          <span
            className="rounded-full px-2.5 py-1 font-medium uppercase tracking-[0.08em]"
            style={{ backgroundColor: "var(--blue-dim)", color: "var(--blue)", border: "1px solid var(--blue-border)" }}
          >
            Mejor venta
          </span>
        </div>
      </div>

      <TablaEntidades />

      <p className="mt-3 text-right" style={{ fontSize: 12 }}>
        <a
          href="https://gee.bccr.fi.cr/IndicadoresEconomicos/Cuadros/frmConsultaTCVentanilla.aspx"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
          style={{ color: "var(--text-3)", textDecorationColor: "var(--border-strong)", textUnderlineOffset: 3 }}
        >
          Fuente: BCCR
        </a>
      </p>
    </section>
  );
}
