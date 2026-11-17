import { combustibles as items, referencia, vigente } from "../lib/combustibles";
import { useI18n } from "../lib/i18n";
import CalculadoraCombustible from "./CalculadoraCombustible";

function Cuadro({ color, size = 10 }) {
  return <span aria-hidden="true" className="inline-block shrink-0" style={{ width: size, height: size, borderRadius: 2, background: color }} />;
}

/** Pastilla "▲ ₡41" / "▼ ₡28" / "=". */
function Ajuste({ valor, compacta = false }) {
  const { t, f } = useI18n();
  if (valor === null || valor === undefined) return null;
  if (valor === 0) return <span className="ajuste ajuste-igual">{compacta ? "=" : t.sinCambio}</span>;
  const sube = valor > 0;
  const monto = f.colones(Math.abs(valor), 0);
  return (
    <span className={`ajuste ${sube ? "ajuste-sube" : "ajuste-baja"}`} aria-label={sube ? t.subio(monto) : t.bajo(monto)}>
      <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden="true">
        <path d={sube ? "M5 1.5 9.5 8.5h-9z" : "M5 8.5.5 1.5h9z"} fill="currentColor" />
      </svg>
      <span aria-hidden="true">{compacta ? Math.abs(valor) : monto}</span>
    </span>
  );
}

/** Móvil: franja compacta bajo el encabezado, lo primero que se ve. */
export function CombustibleFranja() {
  const { t, f } = useI18n();
  return (
    <section aria-labelledby="comb-franja" className="lg:hidden" style={{ background: "var(--surface)", borderBottom: "1px solid var(--line)" }}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 pt-2.5 pb-3">
        <div className="flex justify-between items-baseline mb-2">
          <h2 id="comb-franja" className="m-0 text-[13px] font-bold">
            {t.combustibles} <span className="font-normal" style={{ color: "var(--muted)" }}>· {t.porLitro}</span>
          </h2>
          {vigente && <span className="text-xs" style={{ color: "var(--faint)" }}>{t.desde(f.fechaIso(vigente.fecha))}</span>}
        </div>
        <dl className="m-0 grid grid-cols-4 gap-2">
          {items.map((c) => (
            <div key={c.clave} className="min-w-0">
              <dt className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted)" }}>
                <Cuadro color={c.color} size={8} />
                {t.nombresCombustible[c.clave]}
              </dt>
              <dd className="m-0 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                <span className="num text-[22px] font-extrabold leading-tight">{c.precio}</span>
                <Ajuste valor={c.ajuste} compacta />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/** Escritorio: panel del costado. */
export default function Combustible() {
  const { t, f } = useI18n();
  return (
    <section aria-labelledby="comb-panel" className="tarjeta overflow-hidden hidden lg:block">
      <div className="px-5 pt-[18px] pb-3 flex justify-between items-baseline gap-3">
        <h2 id="comb-panel" className="m-0 text-xl font-extrabold" style={{ letterSpacing: "-0.02em" }}>{t.combustibles}</h2>
        <span className="text-[13px]" style={{ color: "var(--muted)" }}>{t.porLitro}</span>
      </div>
      <ul className="m-0 p-0 list-none">
        {items.map((c) => (
          <li key={c.clave} className="grid grid-cols-[10px_minmax(0,1fr)_auto_auto] gap-x-3 items-center px-5 py-3" style={{ borderTop: "1px solid var(--line)" }}>
            <Cuadro color={c.color} />
            <div className="min-w-0">
              <div className="text-[15px] font-semibold">{t.nombresCombustible[c.clave]}</div>
              {c.anterior !== null && (
                <div className="num text-[13px]" style={{ color: "var(--faint)" }}>{t.antes(f.colones(c.anterior, 0))}</div>
              )}
            </div>
            <Ajuste valor={c.ajuste} />
            <span className="num text-[32px] font-extrabold text-right min-w-[3ch]" style={{ letterSpacing: "-0.02em" }}>{c.precio}</span>
          </li>
        ))}
      </ul>
      <div className="px-5 py-4" style={{ borderTop: "1px solid var(--line)", background: "var(--sunk)" }}>
        <CalculadoraCombustible />
      </div>
      <p className="m-0 px-5 pt-3 pb-4 text-[13px]" style={{ borderTop: "1px solid var(--line)", color: "var(--faint)" }}>
        {vigente && t.vigentes(f.fechaIso(vigente.fecha))}
        <a href="https://aresep.go.cr" target="_blank" rel="noopener noreferrer">ARESEP</a>.{" "}
        {referencia && `${t.comparadoCon(f.fechaIso(referencia.fecha))} `}
        {t.ajusteUsual}
      </p>
    </section>
  );
}
