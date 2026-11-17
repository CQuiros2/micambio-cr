import tcData from "../data/tipo-cambio.json";
import { estadoTipoCambio } from "../lib/frescura";
import { esHoyIsoCR, mejorCompra, mejorVenta } from "../lib/entidades";
import { nombreCorto } from "../lib/formato";
import { useI18n } from "../lib/i18n";
import AvisoDatos from "./AvisoDatos";
import EntidadLogo from "./EntidadLogo";

const estado = estadoTipoCambio(tcData);
const ultimoOficial = tcData.historico?.at(-1) ?? null;

/**
 * Responde en una frase lo que la persona quiere hacer:
 * "¿Va a vender dólares? Le conviene X · ₡444,06 por cada dólar".
 */
function Tarjeta({ pregunta, entidad, valor, color, pie }) {
  const { t } = useI18n();
  return (
    <section className="tarjeta p-3.5 sm:px-6 sm:py-[22px] flex flex-col gap-2.5 sm:gap-3.5 min-w-0">
      <h2 className="m-0 text-[13px] sm:text-[15px] font-bold">{pregunta}</h2>
      <div className="min-w-0">
        <p className="m-0 text-xs sm:text-[13px]" style={{ color: "var(--muted)" }}>{t.leConviene}</p>
        <p className="m-0 mt-1 flex items-center gap-2 min-w-0">
          <EntidadLogo nombre={entidad} size={26} />
          <span className="text-[13px] sm:text-base font-semibold leading-snug">{nombreCorto(entidad)}</span>
        </p>
      </div>
      <div>
        <p className="num m-0 font-extrabold leading-[0.92] text-[clamp(30px,8.6vw,60px)]" style={{ letterSpacing: "-0.02em", color }}>
          {valor}
        </p>
        <p className="m-0 mt-1 text-xs sm:text-sm" style={{ color: "var(--muted)" }}>{t.porDolar}</p>
      </div>
      <p className="m-0 pt-2.5 sm:pt-3 text-xs sm:text-[13px] border-t" style={{ borderColor: "var(--line)", color: "var(--faint)" }}>{pie}</p>
    </section>
  );
}

export default function MejoresPrecios() {
  const { t, f } = useI18n();
  const alDia = !estado.ventanilla.vieja;
  const actualizado = (e) => {
    const c = f.cuandoEntidad(e);
    return t.actualizado(c.hoy ? c.hora : c.fecha);
  };

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {estado.ventanilla.vieja && <AvisoDatos estado={estado} />}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
        <Tarjeta
          pregunta={t.preguntaVender}
          entidad={mejorCompra.nombre}
          valor={f.colones(mejorCompra.compra)}
          color="var(--blue)"
          pie={`${alDia ? t.masPagaHoy : t.masPaga} · ${actualizado(mejorCompra)}`}
        />
        <Tarjeta
          pregunta={t.preguntaComprar}
          entidad={mejorVenta.nombre}
          valor={f.colones(mejorVenta.venta)}
          color="var(--red)"
          pie={`${alDia ? t.menosCobraHoy : t.menosCobra} · ${actualizado(mejorVenta)}`}
        />
      </div>
      {ultimoOficial && (
        <p className="m-0 text-[13px] sm:text-sm" style={{ color: "var(--muted)" }}>
          {t.oficial(esHoyIsoCR(ultimoOficial.fecha) ? t.oficialHoy : t.oficialDel(f.fechaIso(ultimoOficial.fecha)))}{" "}
          {t.compra} <strong className="num" style={{ color: "var(--ink)" }}>{f.colones(ultimoOficial.compra)}</strong> · {t.venta}{" "}
          <strong className="num" style={{ color: "var(--ink)" }}>{f.colones(ultimoOficial.venta)}</strong>
        </p>
      )}
    </div>
  );
}
