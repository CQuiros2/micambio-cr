import tcData from "../data/tipo-cambio.json";
import { useI18n } from "../lib/i18n";

const serie = (tcData.historico ?? []).filter((d) => typeof d.venta === "number");

const W = 300;
const H = 72;

// La forma no depende del idioma: se calcula una vez.
const geometria = (() => {
  if (serie.length < 2) return null;
  const valores = serie.map((d) => d.venta);
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const rango = max - min || 1;
  const pts = valores.map((v, i) => [(i / (valores.length - 1)) * W, 4 + ((max - v) / rango) * (H - 8)]);
  return { puntos: pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" "), ultimo: pts.at(-1) };
})();

/** Venta oficial del BCCR en el período que cubre el histórico. */
export default function DolarOficial() {
  const { t, f } = useI18n();
  if (!geometria) return null;

  const primero = serie[0];
  const ultimo = serie.at(-1);
  const delta = ultimo.venta - primero.venta;

  return (
    <section aria-labelledby="ofi-t" className="tarjeta px-5 py-[18px] flex flex-col gap-2.5">
      <div className="flex justify-between items-baseline gap-3">
        <h2 id="ofi-t" className="m-0 text-base font-bold">{t.dolarOficial}</h2>
        <span className="text-[13px]" style={{ color: "var(--muted)" }}>{t.desdeMes(f.mes(primero.fecha))}</span>
      </div>
      <div className="flex items-baseline gap-2.5">
        <span className="num text-[30px] font-extrabold" style={{ letterSpacing: "-0.02em" }}>{f.colones(ultimo.venta)}</span>
        <span className="num text-sm font-semibold" style={{ color: delta > 0 ? "var(--up)" : "var(--blue)" }}>
          {delta > 0 ? "+" : "−"}{f.colones(Math.abs(delta))}
        </span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H + 8}`}
        width="100%"
        height="80"
        preserveAspectRatio="none"
        role="img"
        aria-label={t.graficoAria(f.fechaIso(primero.fecha), f.fechaIso(ultimo.fecha), f.colones(primero.venta), f.colones(ultimo.venta))}
        className="block overflow-visible"
      >
        <line x1="0" y1={H + 4} x2={W} y2={H + 4} stroke="var(--line)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <polyline points={geometria.puntos} fill="none" stroke="var(--blue)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="num flex justify-between text-xs" style={{ color: "var(--faint)" }}>
        <span>{f.fechaIso(primero.fecha)} · {f.colones(primero.venta)}</span>
        <span>{f.fechaIso(ultimo.fecha)}</span>
      </div>
    </section>
  );
}
