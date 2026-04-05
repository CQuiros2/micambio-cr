export default function Header() {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="px-6 py-4 flex items-center justify-between max-w-5xl mx-auto w-full">
        {/* Logo + nombre */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md flex-shrink-0">
            <span className="text-white font-bold text-sm leading-none">₡</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-none tracking-tight">
              MiCambio<span className="text-blue-600">.cr</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5 leading-none">
              Tipo de cambio y combustibles en Costa Rica
            </p>
          </div>
        </div>

        {/* Badge fuente */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-full px-3 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Datos: BCCR · ARESEP
        </div>
      </div>
    </header>
  );
}
