import { useState } from "react";
import { combustibles } from "../lib/combustibles";
import { parseMonto } from "../lib/formato";
import { useI18n } from "../lib/i18n";

// En la bomba se pide por litros ("60 litros de diésel") o por monto ("póngame 20 mil").
const INICIAL = { litros: "40", colones: "20000" };

/**
 * Cuánto sale cargar combustible, en los dos sentidos: litros → colones y
 * colones → litros. En escritorio va dentro del panel de combustibles; en
 * móvil, como tarjeta propia (`tarjeta`).
 */
export default function CalculadoraCombustible({ tarjeta = false }) {
  const { t, f } = useI18n();
  const [clave, setClave] = useState(combustibles[0]?.clave);
  const [modo, setModo] = useState("litros");
  const [monto, setMonto] = useState(INICIAL.litros);

  const comb = combustibles.find((c) => c.clave === clave);
  if (!comb) return null;

  const porLitros = modo === "litros";
  const cantidad = parseMonto(monto);
  const nombre = t.nombresCombustible[comb.clave];
  const resultado = cantidad > 0 ? (porLitros ? f.colones(Math.round(cantidad * comb.precio), 0) : t.litros(f.numero(cantidad / comb.precio, 1))) : "—";

  const cambiarModo = (m) => {
    setModo(m);
    setMonto(INICIAL[m]);
  };

  const contenido = (
    <div className="flex flex-col gap-3">
      <h3 className={`m-0 font-bold ${tarjeta ? "text-lg sm:text-xl font-extrabold" : "text-[15px]"}`} style={tarjeta ? { letterSpacing: "-0.02em" } : undefined}>
        {t.cuantoLeSale}
      </h3>

      <div role="group" aria-label={t.combustible} className="grid grid-cols-2 gap-1.5">
        {combustibles.map((c) => (
          <button key={c.clave} type="button" className="chip flex items-center gap-1.5 justify-center" aria-pressed={c.clave === clave} onClick={() => setClave(c.clave)}>
            <span aria-hidden="true" className="inline-block shrink-0" style={{ width: 8, height: 8, borderRadius: 2, background: c.color }} />
            {t.nombresCombustible[c.clave]}
          </button>
        ))}
      </div>

      {/* Dentro del panel (fondo gris) el control necesita un fondo más marcado para verse. */}
      <div role="group" aria-label={t.calcularPor} className="segmentado w-full" style={tarjeta ? undefined : { background: "var(--line)" }}>
        <button type="button" className="grow" aria-pressed={porLitros} onClick={() => cambiarModo("litros")}>{t.modoLitros}</button>
        <button type="button" className="grow" aria-pressed={!porLitros} onClick={() => cambiarModo("colones")}>{t.modoColones}</button>
      </div>

      <div>
        <label htmlFor={tarjeta ? "comb-monto-m" : "comb-monto"} className="block text-[13px] font-semibold mb-1" style={{ color: "var(--muted)" }}>
          {porLitros ? t.litrosACargar : t.colonesACargar}
        </label>
        <div className="flex items-center gap-1.5 pb-1" style={{ borderBottom: "2px solid var(--ink)" }}>
          {!porLitros && <span className="num text-2xl font-bold" style={{ color: "var(--faint)" }}>₡</span>}
          <input
            id={tarjeta ? "comb-monto-m" : "comb-monto"}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={monto}
            onChange={(e) => setMonto(e.target.value.replace(/[^0-9.,\s]/g, ""))}
            className="num flex-1 min-w-0 bg-transparent border-0 outline-none text-[28px] font-extrabold"
            style={{ color: "var(--ink)", letterSpacing: "-0.02em" }}
          />
          {porLitros && <span className="text-sm font-semibold" style={{ color: "var(--faint)" }}>{t.unidadLitros}</span>}
        </div>
      </div>

      <div aria-live="polite">
        <p className="num m-0 text-[30px] leading-none font-extrabold" style={{ letterSpacing: "-0.02em" }}>{resultado}</p>
        <p className="m-0 mt-1.5 text-[13px]" style={{ color: "var(--muted)" }}>{t.aPrecioPorLitro(nombre, f.colones(comb.precio, 0))}</p>
        {comb.clave === "gaslp" && (
          <p className="m-0 mt-1.5 text-xs" style={{ color: "var(--faint)" }}>{t.notaGasLP}</p>
        )}
      </div>
    </div>
  );

  return tarjeta ? <section className="tarjeta p-4 sm:p-6">{contenido}</section> : contenido;
}
