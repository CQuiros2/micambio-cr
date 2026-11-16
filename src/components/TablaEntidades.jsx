import { useState } from "react";
import { entidades, FILTROS, mejorCompra, mejorVenta } from "../lib/entidades";
import { entidadVieja } from "../lib/frescura";
import { nombreCorto } from "../lib/formato";
import { useI18n } from "../lib/i18n";

const FUENTE = "https://sdd.bccr.fi.cr/es/IndicadoresEconomicos/Inicio/Contenedor/2039";

const ORDENES = {
  compra: { flecha: "↓", fn: (a, b) => b.compra - a.compra },
  venta: { flecha: "↑", fn: (a, b) => a.venta - b.venta },
  dif: { flecha: "↑", fn: (a, b) => a.venta - a.compra - (b.venta - b.compra) },
};

function BotonOrden({ activo, onClick, children, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={`min-h-[36px] bg-transparent text-[13px] font-bold ${className}`}
      style={{ color: activo ? "var(--ink)" : "var(--muted)" }}
    >
      {children}
    </button>
  );
}

export default function TablaEntidades() {
  const { t, f } = useI18n();
  const [filtro, setFiltro] = useState("todas");
  const [orden, setOrden] = useState("compra");

  const prefijo = FILTROS.find((fl) => fl.clave === filtro)?.prefijo ?? "";
  const filas = entidades.filter((e) => e.tipoEntidad.startsWith(prefijo)).sort(ORDENES[orden].fn);

  const flecha = (clave) => (orden === clave ? ` ${ORDENES[clave].flecha}` : "");

  const fila = (e) => {
    const c = f.cuandoEntidad(e);
    const esCompra = e === mejorCompra;
    const esVenta = e === mejorVenta;
    return {
      e,
      nombre: nombreCorto(e.nombre),
      act: c.hoy ? t.hoyA(c.hora) : c.fecha,
      actColor: entidadVieja(e) ? "var(--up)" : c.hoy ? "var(--muted)" : "var(--faint)",
      compraEstilo: { color: esCompra ? "var(--blue)" : "var(--ink)", fontWeight: esCompra ? 800 : 500 },
      ventaEstilo: { color: esVenta ? "var(--red)" : "var(--ink)", fontWeight: esVenta ? 800 : 500 },
    };
  };
  const datos = filas.map(fila);

  return (
    <section aria-labelledby="tabla-t" className="flex flex-col gap-3.5">
      <div className="flex flex-wrap justify-between items-end gap-3">
        <div>
          <h2 id="tabla-t" className="m-0 text-[22px] sm:text-[26px] font-extrabold" style={{ letterSpacing: "-0.02em" }}>{t.todas}</h2>
          <p className="m-0 mt-1 text-sm" style={{ color: "var(--muted)" }}>{t.conteo(filas.length)}</p>
        </div>
        <div role="group" aria-label={t.filtrarTipo} className="flex gap-1.5 overflow-x-auto sm:flex-wrap -mx-4 px-4 sm:mx-0 sm:px-0 pb-1 sm:pb-0 w-[calc(100%+2rem)] sm:w-auto">
          {FILTROS.map((fl) => (
            <button key={fl.clave} type="button" className="chip shrink-0" aria-pressed={filtro === fl.clave} onClick={() => setFiltro(fl.clave)}>
              {t.filtros[fl.clave]}
            </button>
          ))}
        </div>
      </div>

      {/* Escritorio y tableta: tabla completa */}
      <div className="tarjeta overflow-x-auto hidden md:block">
        <table className="w-full min-w-[680px] border-collapse text-[15px]">
          <thead>
            <tr style={{ background: "var(--sunk)", borderBottom: "1px solid var(--line)" }}>
              <th scope="col" className="text-left px-5 py-3 text-[13px] font-bold" style={{ color: "var(--muted)" }}>{t.colEntidad}</th>
              <th scope="col" className="text-right px-3 py-1.5" aria-sort={orden === "compra" ? "descending" : "none"}>
                <BotonOrden activo={orden === "compra"} onClick={() => setOrden("compra")}>{t.colCompra}{flecha("compra")}</BotonOrden>
              </th>
              <th scope="col" className="text-right px-3 py-1.5" aria-sort={orden === "venta" ? "ascending" : "none"}>
                <BotonOrden activo={orden === "venta"} onClick={() => setOrden("venta")}>{t.colVenta}{flecha("venta")}</BotonOrden>
              </th>
              <th scope="col" className="text-right px-3 py-1.5" aria-sort={orden === "dif" ? "ascending" : "none"}>
                <BotonOrden activo={orden === "dif"} onClick={() => setOrden("dif")}>{t.colDif}{flecha("dif")}</BotonOrden>
              </th>
              <th scope="col" className="text-right px-5 py-3 text-[13px] font-bold" style={{ color: "var(--muted)" }}>{t.colAct}</th>
            </tr>
          </thead>
          <tbody>
            {datos.map((d) => (
              <tr key={d.e.nombre} style={{ borderBottom: "1px solid var(--line)" }}>
                <td className="px-5 py-[11px]">
                  <div className="font-semibold">{d.nombre}</div>
                  <div className="text-[13px]" style={{ color: "var(--faint)" }}>{t.tipoEntidad(d.e.tipoEntidad)}</div>
                </td>
                <td className="num text-right text-[17px] pl-3 pr-6 py-[11px]" style={d.compraEstilo}>{f.colones(d.e.compra)}</td>
                <td className="num text-right text-[17px] pl-3 pr-6 py-[11px]" style={d.ventaEstilo}>{f.colones(d.e.venta)}</td>
                <td className="num text-right pl-3 pr-6 py-[11px]" style={{ color: "var(--muted)" }}>{f.colones(d.e.venta - d.e.compra)}</td>
                <td className="text-right px-5 py-[11px] text-[13px] whitespace-nowrap" style={{ color: d.actColor }}>{d.act}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Móvil: lista compacta */}
      <div className="md:hidden">
        <div className="grid grid-cols-[minmax(0,1fr)_84px_84px] gap-2 px-3.5 pb-1">
          <span className="self-center text-xs font-bold" style={{ color: "var(--muted)" }}>{t.colEntidad}</span>
          <BotonOrden className="text-right" activo={orden === "compra"} onClick={() => setOrden("compra")}>{t.colCompra}{flecha("compra")}</BotonOrden>
          <BotonOrden className="text-right" activo={orden === "venta"} onClick={() => setOrden("venta")}>{t.colVenta}{flecha("venta")}</BotonOrden>
        </div>
        <ul className="tarjeta m-0 p-0 list-none">
          {datos.map((d, i) => (
            <li key={d.e.nombre} className="grid grid-cols-[minmax(0,1fr)_84px_84px] gap-2 items-center px-3.5 py-[11px]" style={{ borderBottom: i < datos.length - 1 ? "1px solid var(--line)" : "none" }}>
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{d.nombre}</div>
                <div className="text-xs" style={{ color: d.actColor }}>{d.act}</div>
              </div>
              <span className="num text-right text-base" style={d.compraEstilo}>{f.colones(d.e.compra)}</span>
              <span className="num text-right text-base" style={d.ventaEstilo}>{f.colones(d.e.venta)}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="m-0 text-[13px]" style={{ color: "var(--faint)" }}>
        {t.glosario} <a href={FUENTE} target="_blank" rel="noopener noreferrer">BCCR</a>.
      </p>
    </section>
  );
}
