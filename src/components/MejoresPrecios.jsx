import tcData from "../data/tipo-cambio.json";
import { estadoTipoCambio } from "../lib/frescura";
import { esHoyIsoCR, mejorCompra, mejorVenta } from "../lib/entidades";
import { nombreCorto } from "../lib/formato";
import { useI18n } from "../lib/i18n";
import AvisoDatos from "./AvisoDatos";
import EntidadLogo from "./EntidadLogo";

const estado = estadoTipoCambio(tcData);
const ultimoOficial = tcData.historico?.at(-1) ?? null;

function Tarjeta({ titulo, tituloCorto, nota, valor, color, entidad, nombreCompleto, pie }) {
  return (
    <section className="tarjeta p-3.5 sm:px-6 sm:py-[22px] flex flex-col gap-2 sm:gap-3.5 min-w-0">
      <div className="flex justify-between items-baseline gap-3">
        <h2 className="m-0 text-[13px] sm:text-[15px] font-bold">
          <span className="sm:hidden">{tituloCorto}</span>
          <span className="hidden sm:inline">{titulo}</span>
        </h2>
        <span className="hidden sm:inline text-[13px]" style={{ color: "var(--muted)" }}>{nota}</span>
      </div>
      <p className="num m-0 font-extrabold leading-[0.92] text-[clamp(30px,8.6vw,64px)]" style={{ letterSpacing: "-0.02em", color }}>
        {valor}
      </p>
      <div className="flex flex-wrap justify-between items-center gap-x-3 gap-y-0.5 sm:pt-3 sm:border-t" style={{ borderColor: "var(--line)" }}>
        <span className="flex items-center gap-2 min-w-0">
          <EntidadLogo nombre={nombreCompleto} size={24} />
          <span className="text-[13px] sm:text-[15px] font-semibold">{entidad}</span>
        </span>
        <span className="hidden sm:inline text-[13px]" style={{ color: "var(--faint)" }}>{pie}</span>
      </div>
    </section>
  );
}

export default function MejoresPrecios() {
  const { t, f } = useI18n();
  const cuando = (e) => {
    const c = f.cuandoEntidad(e);
    return c.hoy ? c.hora : c.fecha;
  };

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {estado.ventanilla.vieja && <AvisoDatos estado={estado} />}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
        <Tarjeta
          titulo={t.siVendes}
          tituloCorto={t.siVendesCorto}
          nota={t.masPaga}
          valor={f.colones(mejorCompra.compra)}
          color="var(--blue)"
          entidad={nombreCorto(mejorCompra.nombre)}
          nombreCompleto={mejorCompra.nombre}
          pie={t.compraA(cuando(mejorCompra))}
        />
        <Tarjeta
          titulo={t.siCompras}
          tituloCorto={t.siComprasCorto}
          nota={t.menosCobra}
          valor={f.colones(mejorVenta.venta)}
          color="var(--red)"
          entidad={nombreCorto(mejorVenta.nombre)}
          nombreCompleto={mejorVenta.nombre}
          pie={t.ventaA(cuando(mejorVenta))}
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
