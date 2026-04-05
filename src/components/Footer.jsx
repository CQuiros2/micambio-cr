export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-100 bg-gray-50 mt-12">
      <div className="px-6 py-8 max-w-5xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-xs">₡</span>
          </div>
          <span className="font-medium text-gray-700">MiCambio.cr</span>
        </div>

        <p className="text-center">
          Datos oficiales:{" "}
          <a
            href="https://www.bccr.fi.cr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            BCCR
          </a>{" "}
          y{" "}
          <a
            href="https://aresep.go.cr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            ARESEP
          </a>
        </p>

        <p>© {year} · Solo informativo</p>
      </div>
    </footer>
  );
}
