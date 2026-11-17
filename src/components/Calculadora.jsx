import { useState } from "react";
import { entidades } from "../lib/entidades";
import { nombreCorto, parseMonto } from "../lib/formato";
import { useI18n } from "../lib/i18n";
import EntidadLogo from "./EntidadLogo";

const TOP_VENDER = [...entidades].sort((a, b) => b.compra - a.compra).slice(0, 5);
const TOP_COMPRAR = [...entidades].sort((a, b) => a.venta - b.venta).slice(0, 5);
const MONTO_INICIAL = { usd: "100", crc: "100000" };

export default function Calculadora() {
  const { t, f } = useI18n();
  const [modo, setModo] = useState("vender");
  const [moneda, setMoneda] = useState("usd");
  const [monto, setMonto] = useState(MONTO_INICIAL.usd);

  const vender = modo === "vender";
  const enUsd = moneda === "usd";
  const top = vender ? TOP_VENDER : TOP_COMPRAR;
  const tasa = (e) => (vender ? e.compra : e.venta);
  const cantidad = parseMonto(monto);

  // Con dólares se multiplica (resultado en colones); con colones se divide.
  const salida = (e) => (enUsd ? cantidad * tasa(e) : cantidad / tasa(e));
  const fmtSalida = (v) => (enUsd ? f.colones(Math.round(v), 0) : f.dolares(v));
  const [etiquetaMonto, etiquetaResultado] = t.escenarios[`${modo}${enUsd ? "Usd" : "Crc"}`];
  // Recibir más colones o comprar más dólares es "más"; pagar o vender es "menos".
  const esMas = (vender && enUsd) || (!vender && !enUsd);

  const mejor = top[0];
  const peor = top.at(-1);
  const hayMonto = cantidad > 0 && mejor;
  const diferencia = hayMonto ? Math.abs(salida(mejor) - salida(peor)) : 0;

  const cambiarMoneda = (m) => {
    setMoneda(m);
    setMonto(MONTO_INICIAL[m]);
  };

  if (!mejor) return null;

  return (
    <section aria-labelledby="calc-t" className="tarjeta overflow-hidden">
      <div className="px-4 sm:px-6 py-4 flex flex-wrap justify-between items-center gap-3" style={{ borderBottom: "1px solid var(--line)" }}>
        <h2 id="calc-t" className="m-0 text-lg sm:text-xl font-extrabold" style={{ letterSpacing: "-0.02em" }}>{t.calculadora}</h2>
        <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
          <div role="group" aria-label={t.operacion} className="segmentado grow sm:grow-0">
            <button type="button" className="grow" aria-pressed={vender} onClick={() => setModo("vender")}>{t.vendo}</button>
            <button type="button" className="grow" aria-pressed={!vender} onClick={() => setModo("comprar")}>{t.compro}</button>
          </div>
          <div role="group" aria-label={t.monedaMonto} className="segmentado">
            <button type="button" aria-pressed={enUsd} onClick={() => cambiarMoneda("usd")}>{t.enUsd}</button>
            <button type="button" aria-pressed={!enUsd} onClick={() => cambiarMoneda("crc")}>{t.enCrc}</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="p-4 sm:p-6 flex flex-col gap-4 md:border-r" style={{ borderColor: "var(--line)" }}>
          <div>
            <label htmlFor="monto" className="block text-sm font-semibold mb-2" style={{ color: "var(--muted)" }}>{etiquetaMonto}</label>
            <div className="flex items-center gap-2 pb-1.5" style={{ borderBottom: "2px solid var(--ink)" }}>
              <span className="num text-[30px] sm:text-[40px] font-bold" style={{ color: "var(--faint)" }}>{enUsd ? "$" : "₡"}</span>
              <input
                id="monto"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={monto}
                onChange={(e) => setMonto(e.target.value.replace(/[^0-9.,\s]/g, ""))}
                className="num flex-1 min-w-0 bg-transparent border-0 outline-none text-[36px] sm:text-[48px] font-extrabold"
                style={{ color: "var(--ink)", letterSpacing: "-0.02em", caretColor: vender ? "var(--blue)" : "var(--red)" }}
              />
            </div>
          </div>
          <div aria-live="polite">
            <p className="m-0 text-sm" style={{ color: "var(--muted)" }}>{etiquetaResultado}</p>
            {hayMonto ? (
              <>
                <p className="num m-0 mt-1 text-[34px] sm:text-[44px] leading-none font-extrabold" style={{ letterSpacing: "-0.02em", color: vender ? "var(--blue)" : "var(--red)" }}>
                  {fmtSalida(salida(mejor))}
                </p>
                <p className="m-0 mt-2 text-sm" style={{ color: "var(--muted)" }}>
                  {t.enEntidad} <strong style={{ color: "var(--ink)" }}>{nombreCorto(mejor.nombre)}</strong>
                  {diferencia > 0 ? t.diferencia(fmtSalida(diferencia), esMas, nombreCorto(peor.nombre)) : "."}
                </p>
              </>
            ) : (
              <p className="m-0 mt-1 text-sm" style={{ color: "var(--muted)" }}>{t.ingresaMonto}</p>
            )}
          </div>
        </div>

        <div className="px-4 sm:px-6 py-4 sm:py-5 border-t md:border-t-0" style={{ borderColor: "var(--line)" }}>
          <p className="m-0 mb-2 text-[13px] font-bold" style={{ color: "var(--muted)" }}>{vender ? t.topVender : t.topComprar}</p>
          <ol className="m-0 p-0 list-none">
            {top.map((e, i) => (
              <li key={e.nombre} className="grid grid-cols-[16px_minmax(0,1fr)_auto] gap-2.5 items-center py-2" style={{ borderBottom: i < top.length - 1 ? "1px solid var(--line)" : "none" }}>
                <span className="num text-[13px]" style={{ color: "var(--faint)" }}>{i + 1}</span>
                <span className="flex items-center gap-2 min-w-0">
                  <EntidadLogo nombre={e.nombre} size={22} />
                  <span className={`text-sm truncate ${i === 0 ? "font-bold" : "font-medium"}`}>{nombreCorto(e.nombre)}</span>
                </span>
                <span className="num text-sm font-bold text-right">
                  {hayMonto ? fmtSalida(salida(e)) : ""}{" "}
                  <span className="font-normal" style={{ color: "var(--faint)" }}>{t.aTasa} {f.colones(tasa(e))}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
