export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 animate-pulse">
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3" />
      <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden animate-pulse">
      <div className="border-b border-gray-100 dark:border-gray-800 p-3 flex gap-4">
        {[40, 25, 20, 15].map((w, i) => <div key={i} className="h-3 bg-gray-200 dark:bg-gray-700 rounded" style={{ width: `${w}%` }} />)}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b border-gray-100 dark:border-gray-800 p-3 flex gap-4">
          {[35, 20, 20, 15, 10].map((w, j) => <div key={j} className="h-3 bg-gray-100 dark:bg-gray-800 rounded" style={{ width: `${w}%` }} />)}
        </div>
      ))}
    </div>
  )
}

export function SkeletonChart() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 animate-pulse">
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4" />
      <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-lg" />
    </div>
  )
}
