export default function Footer() {
  const year = new Date().getFullYear();
  const githubUrl = "https://github.com/CQuiros2";
  const portfolioUrl = "https://github.com/CQuiros2?tab=repositories";

  return (
    <footer className="section-divider">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="terminal-panel rounded-2xl px-5 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                style={{ background: "linear-gradient(135deg, var(--accent) 0%, var(--blue) 100%)" }}
              >
                ₡
              </div>
              <div>
                <p className="font-bold tracking-tight" style={{ color: "var(--text-1)" }}>
                  MICAMBIO<span style={{ color: "var(--accent)" }}>.CR</span>
                </p>
                <p className="text-sm" style={{ color: "var(--text-2)" }}>
                  Monitor diario de referencia para tipo de cambio y combustibles.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1 text-sm lg:text-right" style={{ color: "var(--text-2)" }}>
              <p>
                Datos oficiales:
                {" "}
                <a
                  href="https://www.bccr.fi.cr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                  style={{ color: "var(--accent)" }}
                >
                  BCCR
                </a>
                {" · "}
                <a
                  href="https://aresep.go.cr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                  style={{ color: "var(--accent)" }}
                >
                  ARESEP
                </a>
              </p>
              <p className="text-xs" style={{ color: "var(--text-3)" }}>
                Sitio desarrollado por Cristian Quirós.
                {" "}
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                  style={{ color: "var(--text-2)" }}
                >
                  GitHub
                </a>
                {" · "}
                <a
                  href={portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                  style={{ color: "var(--text-2)" }}
                >
                  Portafolio
                </a>
              </p>
              <p className="text-xs" style={{ color: "var(--text-3)" }}>
                © {year}. Uso informativo. No sustituye confirmación directa con la entidad.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
