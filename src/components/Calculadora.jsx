import { useState, useMemo } from "react";
import tcData from "../data/tipo-cambio.json";

const { entidades } = tcData;

// ── Formateo ──────────────────────────────────────────────────────────────────
const fmtCRC = (n) =>
  new Intl.NumberFormat("es-CR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
const fmtUSD = (n) =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

// ── Modos ─────────────────────────────────────────────────────────────────────
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
    color: "#3b82f6",
    dim: "rgba(59,130,246,0.10)",
    border: "rgba(59,130,246,0.25)",
  },
];

// ── Ranking de 5 mejores (calculado una vez) ──────────────────────────────────
const TOP_VENDER = [...entidades]
  .filter((e) => e.compra > 0)
  .sort((a, b) => b.compra - a.compra)
  .slice(0, 5);

const TOP_COMPRAR = [...entidades]
  .filter((e) => e.venta > 0)
  .sort((a, b) => a.venta - b.venta)
  .slice(0, 5);

// ── Subcomponente: fila de banco en la lista ──────────────────────────────────
function BancoFila({ banco, posicion, rate, monto, isVender, isFirst }) {
  const accentColor = isVender ? "var(--accent)" : "#3b82f6";

  const resultadoStr = useMemo(() => {
    if (!monto) return null;
    return isVender ? `₡${fmtCRC(monto * rate)}` : `$${fmtUSD(monto / rate)}`;
  }, [monto, rate, isVender]);

  return (
    <div
      className="flex items-center justify-between py-2.5"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      {/* Posición + nombre */}
      <div className="flex items-center gap-3 min-w-0">
        <span
          className="flex-shrink-0 w-5 text-center tabular-nums font-bold"
          style={{
            fontSize: 13,
            color: isFirst ? accentColor : "var(--text-2)",
          }}
        >
          {posicion}
        </span>
        <span
          className="truncate font-medium"
          style={{ color: "var(--text-1)", fontSize: 14 }}
        >
          {banco.nombre}
        </span>
      </div>

      {/* Rate + resultado */}
      <div className="text-right flex-shrink-0 pl-4">
        <span
          className="tabular-nums font-bold block"
          style={{
            fontSize: 15,
            color: isFirst ? accentColor : "var(--text-1)",
          }}
        >
          ₡{rate.toFixed(2)}
        </span>
        {resultadoStr && (
          <span
            className="tabular-nums"
            style={{ fontSize: 11, color: "var(--text-2)" }}
          >
            {resultadoStr}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function Calculadora() {
  const [modo, setModo] = useState("vender");
  const [rawValor, setRawValor] = useState("");

  const isVender = modo === "vender";
  const modoConfig = MODOS.find((m) => m.key === modo);
  const top5 = isVender ? TOP_VENDER : TOP_COMPRAR;
  const bestBanco = top5[0];

  // Parsear el valor numérico del input
  const numValor = parseFloat(rawValor) || 0;

  // Resultado con el mejor banco
  const { resultadoStr, diferenciaStr } = useMemo(() => {
    if (numValor <= 0 || !bestBanco)
      return { resultadoStr: null, diferenciaStr: null };

    if (isVender) {
      const mejor = numValor * bestBanco.compra;
      const peor  = numValor * top5.at(-1).compra;
      return {
        resultadoStr: `₡${fmtCRC(mejor)}`,
        diferenciaStr: `₡${fmtCRC(mejor - peor)} más que el 5to banco`,
      };
    } else {
      const mejor = numValor / bestBanco.venta;
      const peor  = numValor / top5.at(-1).venta;
      return {
        resultadoStr: `$${fmtUSD(mejor)}`,
        diferenciaStr: `$${fmtUSD(mejor - peor)} más que el 5to banco`,
      };
    }
  }, [numValor, isVender, bestBanco, top5]);

  const handleInput = (e) => {
    // Permitir solo números y punto decimal
    const v = e.target.value.replace(/[^0-9.]/g, "");
    // Evitar más de un punto
    const parts = v.split(".");
    const clean = parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : v;
    setRawValor(clean);
  };

  const handleModoChange = (key) => {
    setModo(key);
    setRawValor("");
  };

  return (
    <section className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10">
      {/* Título */}
      <div className="mb-5">
        <h2 className="text-xl font-bold" style={{ color: "var(--text-1)" }}>
          El mejor cambio hoy
        </h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-2)" }}>
          Calculá cuánto recibís según el banco
        </p>
      </div>

      <div
        className="rounded-xl overflow-hidden"
        style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
      >
        {/* Barra de acento superior */}
        <div className="h-0.5 w-full" style={{ backgroundColor: modoConfig.color, opacity: 0.5 }} />

        <div className="p-4 sm:p-6">
          {/* ── Toggle ─────────────────────────────────────────────────────── */}
          <div
            className="flex gap-1 p-1 rounded-lg mb-6"
            style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)" }}
          >
            {MODOS.map((m) => (
              <button
                key={m.key}
                onClick={() => handleModoChange(m.key)}
                className="flex-1 py-2 px-3 rounded-md text-sm font-semibold transition-all focus:outline-none"
                style={
                  modo === m.key
                    ? { backgroundColor: m.dim, color: m.color, border: `1px solid ${m.border}` }
                    : { color: "var(--text-2)", border: "1px solid transparent" }
                }
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* ── Layout principal: input + resultado / lista ─────────────────── */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Columna izquierda: input + resultado */}
            <div className="flex-1 flex flex-col gap-5">
              {/* Input */}
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wide mb-2"
                  style={{ color: "var(--text-2)" }}
                >
                  {isVender ? "Ingresás dólares ($)" : "Ingresás colones (₡)"}
                </label>
                <div className="relative">
                  {/* Símbolo */}
                  <span
                    className="absolute left-4 top-1/2 -translate-y-1/2 font-bold pointer-events-none select-none"
                    style={{ color: modoConfig.color, fontSize: 28, lineHeight: 1 }}
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
                    className="w-full rounded-lg font-black tabular-nums focus:outline-none"
                    style={{
                      paddingLeft: 52,
                      paddingRight: 16,
                      paddingTop: 18,
                      paddingBottom: 18,
                      fontSize: "clamp(28px, 6vw, 40px)",
                      lineHeight: 1,
                      backgroundColor: "var(--bg)",
                      color: "var(--text-1)",
                      border: `1.5px solid ${numValor > 0 ? modoConfig.color : "var(--border)"}`,
                      caretColor: modoConfig.color,
                    }}
                  />
                </div>
              </div>

              {/* Resultado */}
              <div
                className="rounded-lg p-4"
                style={{
                  backgroundColor: "var(--bg)",
                  border: `1px solid ${numValor > 0 ? modoConfig.border : "var(--border)"}`,
                  minHeight: 100,
                }}
              >
                {numValor > 0 && resultadoStr ? (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-2)" }}>
                      {isVender ? "Recibís" : "Comprás"} con {bestBanco.nombre}
                    </p>
                    <p
                      className="font-black tabular-nums leading-none"
                      style={{ color: modoConfig.color, fontSize: "clamp(32px, 5vw, 48px)" }}
                    >
                      {resultadoStr}
                    </p>
                    {diferenciaStr && (
                      <p className="mt-2 text-xs" style={{ color: "var(--text-2)" }}>
                        {diferenciaStr}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center py-2">
                    <p style={{ color: "var(--text-2)", fontSize: 13 }}>
                      Ingresá un monto para ver el resultado
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Columna derecha: lista de 5 mejores */}
            <div className="lg:w-72">
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-1"
                style={{ color: "var(--text-2)" }}
              >
                Los 5 mejores · {isVender ? "mayor compra" : "menor venta"}
              </p>
              <div>
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
              <p className="mt-3 text-xs" style={{ color: "var(--text-2)" }}>
                Incluye bancos, cooperativas y casas de cambio
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
