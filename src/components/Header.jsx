/* ── Iconos inline SVG para evitar dependencias ──────────────────────────── */
function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function Header({ isDark, toggleTheme }) {
  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-md"
      style={{
        backgroundColor: isDark ? "rgba(10,10,15,0.85)" : "rgba(248,249,251,0.9)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo + nombre */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0 select-none"
            style={{ background: "linear-gradient(135deg, var(--accent) 0%, #3b82f6 100%)" }}
          >
            ₡
          </div>
          <span
            className="text-base font-bold tracking-tight"
            style={{ color: "var(--text-1)" }}
          >
            MiCambio
            <span style={{ color: "var(--accent)" }}>.cr</span>
          </span>
        </div>

        {/* Derecha: badge + toggle */}
        <div className="flex items-center gap-4">
          {/* Badge "En vivo" */}
          <div
            className="hidden sm:flex items-center gap-2 text-xs font-medium"
            style={{ color: "var(--text-2)" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: "var(--accent)" }}
            />
            En vivo
          </div>

          {/* Toggle dark/light */}
          <button
            onClick={toggleTheme}
            aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-opacity hover:opacity-70 focus:outline-none focus-visible:ring-2"
            style={{
              color: "var(--text-2)",
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>
    </header>
  );
}
