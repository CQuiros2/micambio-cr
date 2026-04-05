const MOCK_BANCOS = [
  {
    entidad: "Banco Nacional",
    sigla: "BN",
    compra: 493.25,
    venta: 501.50,
    actualizacion: "Hoy 10:15",
    logo: "🏦",
  },
  {
    entidad: "Banco de Costa Rica",
    sigla: "BCR",
    compra: 492.00,
    venta: 502.75,
    actualizacion: "Hoy 10:00",
    logo: "🏦",
  },
  {
    entidad: "BAC Credomatic",
    sigla: "BAC",
    compra: 491.50,
    venta: 503.00,
    actualizacion: "Hoy 09:45",
    logo: "🏦",
  },
  {
    entidad: "Scotiabank",
    sigla: "SCO",
    compra: 490.75,
    venta: 504.25,
    actualizacion: "Hoy 09:30",
    logo: "🏦",
  },
  {
    entidad: "Davivienda",
    sigla: "DAV",
    compra: 489.00,
    venta: 505.50,
    actualizacion: "Hoy 09:15",
    logo: "🏦",
  },
];

export default function TipoCambio() {
  const maxCompra = Math.max(...MOCK_BANCOS.map((b) => b.compra));
  const minVenta = Math.min(...MOCK_BANCOS.map((b) => b.venta));

  return (
    <section className="px-4 sm:px-6 py-8 max-w-5xl mx-auto w-full">
      {/* Encabezado */}
      <div className="flex items-start justify-between mb-5 gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-gray-900 leading-tight">
            Tipo de cambio
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Colones por dólar (USD/CRC) · Actualizado hoy
          </p>
        </div>
        <div className="flex gap-3 text-xs flex-wrap">
          <span className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full px-3 py-1 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Mejor compra
          </span>
          <span className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-full px-3 py-1 font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            Mejor venta
          </span>
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">
                  Entidad
                </th>
                <th className="text-right px-5 py-3.5 font-semibold text-gray-600">
                  Compra
                </th>
                <th className="text-right px-5 py-3.5 font-semibold text-gray-600">
                  Venta
                </th>
                <th className="text-right px-5 py-3.5 font-semibold text-gray-600 hidden sm:table-cell">
                  Diferencial
                </th>
                <th className="text-right px-5 py-3.5 font-semibold text-gray-600 hidden md:table-cell">
                  Actualización
                </th>
              </tr>
            </thead>
            <tbody>
              {MOCK_BANCOS.map((banco, i) => {
                const esMejorCompra = banco.compra === maxCompra;
                const esMejorVenta = banco.venta === minVenta;
                const diferencial = (banco.venta - banco.compra).toFixed(2);

                return (
                  <tr
                    key={banco.sigla}
                    className={`border-b border-gray-100 last:border-0 transition-colors hover:bg-gray-50 ${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50/40"
                    }`}
                  >
                    {/* Entidad */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-xs">
                            {banco.sigla.slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 leading-tight">
                            {banco.entidad}
                          </p>
                          <p className="text-xs text-gray-400">{banco.sigla}</p>
                        </div>
                      </div>
                    </td>

                    {/* Compra */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {esMejorCompra && (
                          <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-full px-2 py-0.5 hidden sm:inline">
                            Mejor compra
                          </span>
                        )}
                        <span
                          className={`font-semibold tabular-nums ${
                            esMejorCompra ? "text-emerald-600" : "text-gray-900"
                          }`}
                        >
                          ₡{banco.compra.toFixed(2)}
                        </span>
                      </div>
                    </td>

                    {/* Venta */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {esMejorVenta && (
                          <span className="text-xs font-semibold bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 hidden sm:inline">
                            Mejor venta
                          </span>
                        )}
                        <span
                          className={`font-semibold tabular-nums ${
                            esMejorVenta ? "text-blue-600" : "text-gray-900"
                          }`}
                        >
                          ₡{banco.venta.toFixed(2)}
                        </span>
                      </div>
                    </td>

                    {/* Diferencial */}
                    <td className="px-5 py-4 text-right hidden sm:table-cell">
                      <span className="text-gray-500 tabular-nums font-mono text-xs bg-gray-100 rounded-md px-2 py-1">
                        ₡{diferencial}
                      </span>
                    </td>

                    {/* Actualización */}
                    <td className="px-5 py-4 text-right hidden md:table-cell">
                      <span className="text-gray-400 text-xs">{banco.actualizacion}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-3 text-right">
        * Datos de ejemplo — se conectarán al BCCR en producción
      </p>
    </section>
  );
}
