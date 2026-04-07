import { Fragment, useState } from "react";
import tcData from "../data/tipo-cambio.json";
import { EntityIdentity } from "./EntityIdentity";

const { entidades, mejorCompra, mejorVenta } = tcData;

function SortIcon({ active, dir }) {
  return (
    <span className="inline-flex flex-col leading-none ml-1 align-middle" style={{ fontSize: 8, gap: 1 }}>
      <span style={{ color: active && dir === "asc" ? "var(--accent)" : "var(--text-3)", opacity: active && dir === "asc" ? 1 : 0.45 }}>▲</span>
      <span style={{ color: active && dir === "desc" ? "var(--accent)" : "var(--text-3)", opacity: active && dir === "desc" ? 1 : 0.45 }}>▼</span>
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

  const filas = [...entidades].sort((a, b) => {
    const mult = sort.dir === "desc" ? -1 : 1;
    return mult * (a[sort.col] - b[sort.col]);
  });

  return (
    <div className="terminal-panel rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ backgroundColor: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
              <th className="text-left px-4 sm:px-5 py-3 sm:py-4">
                <span className="eyebrow">Entidad</span>
              </th>
              <th
                className="text-right px-4 sm:px-5 py-3 sm:py-4 cursor-pointer select-none"
                onClick={() => toggleSort("compra")}
              >
                <span className="eyebrow" style={{ color: sort.col === "compra" ? "var(--accent)" : "var(--text-2)" }}>
                  Compra <SortIcon active={sort.col === "compra"} dir={sort.dir} />
                </span>
              </th>
              <th
                className="text-right px-4 sm:px-5 py-3 sm:py-4 cursor-pointer select-none"
                onClick={() => toggleSort("venta")}
              >
                <span className="eyebrow" style={{ color: sort.col === "venta" ? "var(--accent)" : "var(--text-2)" }}>
                  Venta <SortIcon active={sort.col === "venta"} dir={sort.dir} />
                </span>
              </th>
              <th
                className="text-right px-4 sm:px-5 py-3 sm:py-4 cursor-pointer select-none hidden sm:table-cell"
                onClick={() => toggleSort("diferencial")}
              >
                <span className="eyebrow" style={{ color: sort.col === "diferencial" ? "var(--accent)" : "var(--text-2)" }}>
                  Diferencial <SortIcon active={sort.col === "diferencial"} dir={sort.dir} />
                </span>
              </th>
              <th className="text-right px-4 sm:px-5 py-3 sm:py-4 hidden lg:table-cell">
                <span className="eyebrow">Actualización</span>
              </th>
            </tr>
          </thead>

          <tbody>
            {filas.map((e, idx) => {
              const esMejorCompra = e.compra === mejorCompra.valor;
              const esMejorVenta = e.venta === mejorVenta.valor;
              const prevTipo = idx > 0 ? filas[idx - 1].tipoEntidad : null;
              const showGroup = e.tipoEntidad !== prevTipo;

              return (
                <Fragment key={e.nombre}>
                  {showGroup && (
                    <tr style={{ backgroundColor: "var(--surface)" }}>
                      <td
                        colSpan={5}
                        className="px-4 sm:px-5 pt-4 pb-2"
                        style={{ borderBottom: "1px solid var(--border)" }}
                      >
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]"
                          style={{ backgroundColor: "var(--surface-2)", color: "var(--text-2)", border: "1px solid var(--border)" }}
                        >
                          {e.tipoEntidad}
                        </span>
                      </td>
                    </tr>
                  )}

                  <tr
                    className="hover:bg-black/[0.015] dark:hover:bg-white/[0.02]"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <td className="px-4 sm:px-5 py-3.5">
                      <EntityIdentity name={e.nombre} showName compact showDomain={false} size={30} textClassName="font-medium leading-tight truncate text-[14px]" />
                      <p className="text-xs truncate mt-0.5 ml-[42px]" style={{ color: "var(--text-3)" }}>
                        {e.tipoEntidad}
                      </p>
                    </td>

                    <td className="px-4 sm:px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {esMejorCompra && (
                          <span
                            className="hidden sm:inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]"
                            style={{ backgroundColor: "var(--accent-dim)", color: "var(--accent)", border: "1px solid var(--accent-border)" }}
                          >
                            Mejor
                          </span>
                        )}
                        <span className="metric-value font-bold" style={{ color: esMejorCompra ? "var(--accent)" : "var(--text-1)", fontSize: 16 }}>
                          ₡{e.compra.toFixed(2)}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 sm:px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {esMejorVenta && (
                          <span
                            className="hidden sm:inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]"
                            style={{ backgroundColor: "var(--blue-dim)", color: "var(--blue)", border: "1px solid var(--blue-border)" }}
                          >
                            Mejor
                          </span>
                        )}
                        <span className="metric-value font-bold" style={{ color: esMejorVenta ? "var(--blue)" : "var(--text-1)", fontSize: 16 }}>
                          ₡{e.venta.toFixed(2)}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 sm:px-5 py-3.5 text-right hidden sm:table-cell">
                      <span
                        className="inline-flex rounded-lg px-2.5 py-1 metric-value"
                        style={{ backgroundColor: "var(--surface-2)", color: "var(--text-2)", border: "1px solid var(--border)", fontSize: 13 }}
                      >
                        ₡{e.diferencial.toFixed(2)}
                      </span>
                    </td>

                    <td className="px-4 sm:px-5 py-3.5 text-right hidden lg:table-cell">
                      <span style={{ color: "var(--text-3)", fontSize: 12 }}>
                        {e.ultimaActualizacion}
                      </span>
                    </td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
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

      <p className="mt-3 text-right" style={{ color: "var(--text-3)", fontSize: 12 }}>
        Fuente: BCCR. Clic en columnas para ordenar. Se mantienen logos o iniciales por entidad.
      </p>
    </section>
  );
}
