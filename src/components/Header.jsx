import tcData from "../data/tipo-cambio.json";
import { estadoTipoCambio } from "../lib/frescura";
import { useI18n } from "../lib/i18n";
import Logo from "./Logo";

const { ventanilla } = estadoTipoCambio(tcData);

function IconoLuna() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function IconoSol() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function IconoIdioma() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
    </svg>
  );
}

/** "Ventanilla al día · lunes 16 nov, 3:34 p.m." o el aviso de retraso. */
export function EstadoVentanilla({ className = "" }) {
  const { t, f } = useI18n();
  if (!ventanilla.fecha) return null;
  const vieja = ventanilla.vieja;
  return (
    <p className={`m-0 flex items-center gap-2 text-sm ${className}`} style={{ color: vieja ? "var(--warn)" : "var(--muted)" }}>
      <span aria-hidden="true" className="inline-block w-2 h-2 rounded-full shrink-0" style={{ background: vieja ? "var(--warn)" : "var(--ok)" }} />
      {vieja ? t.estadoRetraso(f.diaMes(ventanilla.fecha)) : t.estadoAlDia(f.fechaLarga(ventanilla.fecha))}
    </p>
  );
}

const estiloBoton = { border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)" };

export default function Header({ oscuro, alternarTema }) {
  const { t, alternarIdioma } = useI18n();
  return (
    <header style={{ borderBottom: "1px solid var(--line)" }}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between gap-3">
        <Logo />
        <div className="flex items-center gap-2 sm:gap-5">
          <EstadoVentanilla className="hidden lg:flex" />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={alternarIdioma}
              aria-label={t.aOtroIdioma}
              className="min-h-[44px] min-w-[44px] px-3 rounded-lg flex items-center justify-center gap-2 text-sm font-bold"
              style={estiloBoton}
            >
              <IconoIdioma />
              <span aria-hidden="true">{t.botonIdioma}</span>
            </button>
            <button
              type="button"
              onClick={alternarTema}
              aria-label={oscuro ? t.aModoClaro : t.aModoOscuro}
              className="min-h-[44px] min-w-[44px] px-3 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold"
              style={estiloBoton}
            >
              {oscuro ? <IconoSol /> : <IconoLuna />}
              <span aria-hidden="true" className="hidden sm:inline">{oscuro ? t.botonClaro : t.botonOscuro}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
