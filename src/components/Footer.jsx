export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer style={{ borderTop: "1px solid var(--border)" }}>
      <div
        className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm"
        style={{ color: "var(--text-2)" }}
      >
        {/* Logo texto */}
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold"
            style={{ background: "linear-gradient(135deg, var(--accent) 0%, #3b82f6 100%)" }}
          >
            ₡
          </div>
          <span className="font-semibold" style={{ color: "var(--text-1)" }}>
            MiCambio<span style={{ color: "var(--accent)" }}>.cr</span>
          </span>
        </div>

        {/* Fuentes */}
        <p className="text-xs text-center">
          Datos oficiales:{" "}
          <a
            href="https://www.bccr.fi.cr"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            style={{ color: "var(--accent)" }}
          >
            BCCR
          </a>
          {" "}·{" "}
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

        <p className="text-xs">© {year} · Solo informativo</p>
      </div>
    </footer>
  );
}
