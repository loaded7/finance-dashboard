interface StatCardProps {
  title: string
  value: string
  subtitle?: string
  color?: 'green' | 'red' | 'blue' | 'yellow' | 'gray'
  icon?: React.ReactNode
}

const colorMap = {
  green: 'text-green-400 bg-green-500/10 border-green-500/20',
  red: 'text-red-400 bg-red-500/10 border-red-500/20',
  blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  gray: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
}

export default function StatCard({ title, value, subtitle, color = 'gray', icon }: StatCardProps) {
  return (
    <div className={`rounded-xl border p-4 ${colorMap[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400 uppercase tracking-wide">{title}</span>
        {icon && <span className="opacity-70">{icon}</span>}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  )
}
