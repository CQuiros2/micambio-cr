import { useI18n } from "../lib/i18n";

/** Aviso cuando los precios de ventanilla no son recientes. Ofrece el oficial como referencia. */
export default function AvisoDatos({ estado }) {
  const { t, f } = useI18n();
  const { ventanilla, oficial } = estado;
  const oficialUtil = !oficial.vieja && oficial.compra && oficial.venta;

  return (
    <div role="status" className="rounded-[10px] px-4 py-3 text-sm flex gap-3 items-start" style={{ background: "var(--warn-bg)", border: "1px solid var(--warn)" }}>
      <span aria-hidden="true" className="mt-1.5 inline-block w-2 h-2 rounded-full shrink-0" style={{ background: "var(--warn)" }} />
      <div className="min-w-0">
        <p className="m-0 font-semibold">{t.avisoTitulo(f.diaMes(ventanilla.fecha))}</p>
        <p className="m-0 mt-0.5" style={{ color: "var(--muted)" }}>
          {t.avisoCuerpo}
          {oficialUtil && (
            <>
              {" "}{t.avisoOficial(f.diaMes(oficial.fecha))} {t.compra}{" "}
              <strong className="num" style={{ color: "var(--ink)" }}>{f.colones(oficial.compra)}</strong> · {t.venta}{" "}
              <strong className="num" style={{ color: "var(--ink)" }}>{f.colones(oficial.venta)}</strong>.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
