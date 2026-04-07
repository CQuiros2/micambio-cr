import { useState, useMemo } from "react";
import tcData from "../data/tipo-cambio.json";
import { EntityIdentity } from "./EntityIdentity";

const { entidades, mejorCompra, mejorVenta, historico, ultimaActualizacion } = tcData;

const fmtCRC = (n) =>
  new Intl.NumberFormat("es-CR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
const fmtUSD = (n) =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

const MODOS = [
  {
    key: "vender",
    label: "Vendés dólares",
    color: "var(--accent)",
    dim: "var(--accent-dim)",
    border: "var(--accent-border)",
  },
  {
    key: "comprar",
    label: "Comprás dólares",
    color: "var(--blue)",
    dim: "var(--blue-dim)",
    border: "var(--blue-border)",
  },
];

const TOP_VENDER = [...entidades]
  .filter((e) => e.compra > 0)
  .sort((a, b) => b.compra - a.compra)
  .slice(0, 5);

const TOP_COMPRAR = [...entidades]
  .filter((e) => e.venta > 0)
  .sort((a, b) => a.venta - b.venta)
  .slice(0, 5);

const MOCK_TC = [514, 511, 509, 513, 507, 502, 498, 500, 495, 491, 488, 485, 482, 479, 476, 473, 470, 468, 465, 463, 461, 460, 458, 456];
const sparkValues =
  historico.length > 0 ? historico.map((d) => d.compra).filter(Boolean) : MOCK_TC;

function tiempoDesde(isoStr) {
  if (!isoStr) return null;
  const diff = Date.now() - new Date(isoStr).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "Actualizado hace menos de un minuto";
  if (min < 60) return `Actualizado hace ${min} minuto${min !== 1 ? "s" : ""}`;
  const h = Math.floor(min / 60);
  return `Actualizado hace ${h} hora${h !== 1 ? "s" : ""}`;
}

function Sparkline({ values }) {
  if (!values || values.length < 2) return null;
  const W = 180;
  const H = 42;
  const PAD = 2;
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
        <linearGradient id="spark-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#spark-gradient)" />
      <polyline points={line} fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WinnerCard({ label, sublabel, valor, nombre, accent, accentDim, accentBorder, children }) {
  return (
    <article
      className="panel-soft rounded-2xl p-4 sm:p-5 flex flex-col gap-3"
      style={{ borderColor: accentBorder }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow" style={{ color: accent }}>{label}</p>
          <p className="mt-1 text-xs sm:text-sm" style={{ color: "var(--text-2)" }}>{sublabel}</p>
        </div>
        <EntityIdentity name={nombre} size={28} showName={false} />
      </div>

      <div>
        <p
          className="metric-value font-black leading-none"
          style={{ color: accent, fontSize: "clamp(30px, 7vw, 48px)" }}
        >
          ₡{valor.toFixed(2)}
        </p>
        <div className="mt-1.5">
          <EntityIdentity
            name={nombre}
            size={22}
            showName
            compact
            showDomain={false}
            textClassName="text-sm font-medium truncate"
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span
          className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.12em]"
          style={{ backgroundColor: accentDim, color: accent, border: `1px solid ${accentBorder}` }}
        >
          {label}
        </span>
        {children}
      </div>
    </article>
  );
}

function BancoFila({ banco, posicion, rate, monto, isVender, isFirst }) {
  const accentColor = isVender ? "var(--accent)" : "var(--blue)";

  const resultadoStr = useMemo(() => {
    if (!monto) return null;
    return isVender ? `₡${fmtCRC(monto * rate)}` : `$${fmtUSD(monto / rate)}`;
  }, [monto, rate, isVender]);

  return (
    <div
      className="grid grid-cols-[18px_minmax(0,1fr)_auto] items-center gap-2 px-2.5 sm:px-3 py-2.5 rounded-xl"
      style={{
        backgroundColor: isFirst ? (isVender ? "var(--accent-dim)" : "var(--blue-dim)") : "var(--surface-2)",
        border: `1px solid ${isFirst ? (isVender ? "var(--accent-border)" : "var(--blue-border)") : "var(--border)"}`,
      }}
    >
      <span
        className="text-center font-bold tabular-nums"
        style={{ fontSize: 10, color: isFirst ? accentColor : "var(--text-2)" }}
      >
        {posicion}
      </span>
      <div className="min-w-0">
        <EntityIdentity
          name={banco.nombre}
          size={22}
          showName
          compact
          showDomain={false}
          textClassName="truncate font-medium text-[12px] sm:text-[14px]"
        />
        {resultadoStr && (
          <p className="tabular-nums text-[11px]" style={{ color: "var(--text-2)" }}>
            {resultadoStr}
          </p>
        )}
      </div>
      <span
        className="tabular-nums font-bold"
        style={{ fontSize: 13, color: isFirst ? accentColor : "var(--text-1)" }}
      >
        ₡{rate.toFixed(2)}
      </span>
    </div>
  );
}

export default function Calculadora() {
  const [modo, setModo] = useState("vender");
  const [rawValor, setRawValor] = useState("");

  const isVender = modo === "vender";
  const modoConfig = MODOS.find((m) => m.key === modo);
  const top5 = isVender ? TOP_VENDER : TOP_COMPRAR;
  const bestBanco = top5[0];
  const numValor = parseFloat(rawValor) || 0;
  const updatedLabel = tiempoDesde(ultimaActualizacion);

  const cards = [
    {
      label: "Mayor compra",
      sublabel: "Mejor para vender dólares hoy",
      valor: mejorCompra.valor,
      nombre: mejorCompra.nombre,
      accent: "var(--accent)",
      accentDim: "var(--accent-dim)",
      accentBorder: "var(--accent-border)",
      footer: (
        <div className="hidden sm:block opacity-75">
          <p className="mb-1 text-[10px] uppercase tracking-[0.12em]" style={{ color: "var(--text-2)" }}>
            Tendencia BCCR
          </p>
          <Sparkline values={sparkValues} />
        </div>
      ),
    },
    {
      label: "Menor venta",
      sublabel: "Mejor para comprar dólares hoy",
      valor: mejorVenta.valor,
      nombre: mejorVenta.nombre,
      accent: "var(--blue)",
      accentDim: "var(--blue-dim)",
      accentBorder: "var(--blue-border)",
    },
  ];

  const { resultadoStr, diferenciaStr } = useMemo(() => {
    if (numValor <= 0 || !bestBanco) {
      return { resultadoStr: null, diferenciaStr: null };
    }

    if (isVender) {
      const mejor = numValor * bestBanco.compra;
      const peor = numValor * top5.at(-1).compra;
      return {
        resultadoStr: `₡${fmtCRC(mejor)}`,
        diferenciaStr: `₡${fmtCRC(mejor - peor)} más que el 5to mejor tipo`,
      };
    }

    const mejor = numValor / bestBanco.venta;
    const peor = numValor / top5.at(-1).venta;
    return {
      resultadoStr: `$${fmtUSD(mejor)}`,
      diferenciaStr: `$${fmtUSD(mejor - peor)} más que el 5to mejor tipo`,
    };
  }, [bestBanco, isVender, numValor, top5]);

  const handleInput = (e) => {
    const v = e.target.value.replace(/[^0-9.]/g, "");
    const parts = v.split(".");
    const clean = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : v;
    setRawValor(clean);
  };

  const handleModoChange = (key) => {
    setModo(key);
    setRawValor("");
  };

  return (
    <section className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-6 pb-8 sm:pt-8 sm:pb-10">
      <div className="macro-panel rounded-[28px] overflow-hidden">
        <div
          className="px-4 sm:px-6 xl:px-7 pt-5 pb-4 sm:pt-6 sm:pb-5 border-b"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-2)" }}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow mb-2">Monitor diario</p>
              <h1 className="text-[22px] sm:text-[28px] font-bold tracking-tight" style={{ color: "var(--text-1)" }}>
                Mejor cambio del día
              </h1>
              <p className="mt-1 text-sm" style={{ color: "var(--text-2)" }}>
                Referencia diaria para compra y venta de dólares en ventanilla.
              </p>
            </div>
            {updatedLabel && (
              <p className="text-xs sm:text-sm" style={{ color: "var(--text-3)" }}>
                {updatedLabel}
              </p>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-5 xl:p-6">
          <div className="grid grid-cols-1 xl:grid-cols-[292px_minmax(0,1fr)] gap-4 sm:gap-5">
            <div className="order-1 xl:order-1 flex flex-col gap-3">
              {cards.map((card) => (
                <WinnerCard key={card.label} {...card}>
                  {card.footer}
                </WinnerCard>
              ))}
            </div>

            <div className="order-2 xl:order-2 terminal-panel rounded-[24px] overflow-hidden" style={{ borderColor: "var(--border-strong)" }}>
              <div
                className="px-4 sm:px-5 py-4 border-b"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-2)" }}
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="eyebrow mb-2">Calculadora</p>
                    <h2 className="text-lg sm:text-xl font-bold" style={{ color: "var(--text-1)" }}>
                      Simulador de cambio en ventanilla
                    </h2>
                  </div>
                  <div
                    className="inline-flex rounded-xl p-1 self-start"
                    style={{ backgroundColor: "var(--surface-3)", border: "1px solid var(--border)" }}
                  >
                    {MODOS.map((m) => (
                      <button
                        key={m.key}
                        onClick={() => handleModoChange(m.key)}
                        className="px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold"
                        style={
                          modo === m.key
                            ? { backgroundColor: "var(--surface)", color: m.color, boxShadow: "var(--shadow-soft)" }
                            : { color: "var(--text-2)" }
                        }
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5">
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_272px] gap-4 sm:gap-5">
                  <div className="flex flex-col gap-3 sm:gap-4">
                    <div>
                      <label className="eyebrow mb-2 block">
                        {isVender ? "Ingresás dólares" : "Ingresás colones"}
                      </label>
                      <div
                        className="rounded-2xl px-4 sm:px-5 py-4 relative"
                        style={{ backgroundColor: "var(--surface-2)", border: `1px solid ${numValor > 0 ? modoConfig.border : "var(--border)"}` }}
                      >
                        <span
                          className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 font-bold pointer-events-none"
                          style={{ color: modoConfig.color, fontSize: 22 }}
                        >
                          {isVender ? "$" : "₡"}
                        </span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={rawValor}
                          onChange={handleInput}
                          placeholder="0"
                          autoComplete="off"
                          className="w-full bg-transparent pl-8 sm:pl-10 pr-2 font-black metric-value focus:outline-none"
                          style={{
                            color: "var(--text-1)",
                            fontSize: "clamp(28px, 8vw, 52px)",
                            lineHeight: 1,
                            caretColor: modoConfig.color,
                          }}
                        />
                      </div>
                    </div>

                    <div
                      className="rounded-2xl p-4 sm:p-5"
                      style={{ backgroundColor: "var(--surface-2)", border: `1px solid ${numValor > 0 ? modoConfig.border : "var(--border)"}` }}
                    >
                      <p className="eyebrow mb-2">
                        {isVender ? "Mejor resultado" : "Mayor cantidad de dólares"}
                      </p>
                      {numValor > 0 && resultadoStr ? (
                        <>
                          <p className="text-sm font-medium mb-2" style={{ color: "var(--text-2)" }}>
                            {isVender ? "Recibís con" : "Comprás con"} {bestBanco.nombre}
                          </p>
                          <p
                            className="metric-value font-black leading-none"
                            style={{ color: modoConfig.color, fontSize: "clamp(30px, 7vw, 50px)" }}
                          >
                            {resultadoStr}
                          </p>
                          {diferenciaStr && (
                            <p className="mt-3 text-sm" style={{ color: "var(--text-2)" }}>
                              {diferenciaStr}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-sm" style={{ color: "var(--text-2)" }}>
                          Ingresá el monto para ver cuál entidad te da el mejor resultado.
                        </p>
                      )}
                    </div>
                  </div>

                  <aside className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <p className="eyebrow">Top 5</p>
                      <span className="text-xs" style={{ color: "var(--text-3)" }}>
                        {isVender ? "Mayor compra" : "Menor venta"}
                      </span>
                    </div>
                    <div className="panel-soft rounded-2xl p-2 sm:p-2.5 flex flex-col gap-2">
                      {top5.map((banco, i) => (
                        <BancoFila
                          key={banco.nombre}
                          banco={banco}
                          posicion={i + 1}
                          rate={isVender ? banco.compra : banco.venta}
                          monto={numValor}
                          isVender={isVender}
                          isFirst={i === 0}
                        />
                      ))}
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-3)" }}>
                      Incluye bancos, cooperativas y casas de cambio con tasas publicadas.
                    </p>
                  </aside>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
