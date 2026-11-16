import { fechaCorta } from "../lib/frescura";

const fmt = (n) =>
  new Intl.NumberFormat("es-CR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

/** Aviso cuando los precios de ventanilla no son de hoy. Ofrece el oficial como referencia. */
export default function AvisoDatos({ estado }) {
  const { ventanilla, oficial } = estado;
  const oficialUtil = !oficial.vieja && oficial.compra && oficial.venta;

  return (
    <div
      role="status"
      className="mt-4 rounded-2xl px-4 py-3 text-sm flex gap-3 items-start"
      style={{
        color: "var(--text-1)",
        backgroundColor: "color-mix(in srgb, var(--warning) 10%, transparent)",
        border: "1px solid color-mix(in srgb, var(--warning) 35%, transparent)",
      }}
    >
      <span aria-hidden className="leading-5" style={{ color: "var(--warning)" }}>●</span>
      <div className="min-w-0">
        <p className="font-semibold leading-5">
          Los precios de ventanilla son del {fechaCorta(ventanilla.fecha)} y pueden no estar vigentes.
        </p>
        <p className="mt-0.5 leading-5" style={{ color: "var(--text-2)" }}>
          No se han podido actualizar desde esa fecha. Confirmá con la entidad antes de ir.
          {oficialUtil && (
            <>
              {" "}Tipo de cambio oficial del {fechaCorta(oficial.fecha)}: compra{" "}
              <strong className="metric-value" style={{ color: "var(--text-1)" }}>₡{fmt(oficial.compra)}</strong>
              {" "}· venta{" "}
              <strong className="metric-value" style={{ color: "var(--text-1)" }}>₡{fmt(oficial.venta)}</strong>.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
