/**
 * Componente Table para mostrar datos en formato tabular
 * @param {array} columns - Array de objetos con { key, label, render }
 * @param {array} data - Array de objetos con los datos
 * @param {object} props - Props adicionales (className, etc.)
 */
function Table({ columns, data, className = '', ...props }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-10 w-10 text-zinc-400 dark:text-zinc-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="text-base font-semibold text-zinc-700 dark:text-zinc-300">No hay datos</h3>
        <p className="mt-1 text-sm text-zinc-500">
          No se encontraron registros que coincidan con tus filtros.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto border border-zinc-300 dark:border-zinc-800">
      <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
        <thead className="bg-zinc-100 dark:bg-zinc-900">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-zinc-950 divide-y divide-zinc-200 dark:divide-zinc-800/60">
          {data.map((row, index) => (
            <tr
              key={row.id || index}
              className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="px-5 py-3.5 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300"
                >
                  {column.render
                    ? column.render(row, index)
                    : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Table
