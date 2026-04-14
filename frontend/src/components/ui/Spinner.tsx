

export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const classes = size === 'sm' ? 'w-5 h-5 border-2' : 'w-8 h-8 border-3'
  return (
    <div className="flex justify-center items-center">
      <div className={`animate-spin rounded-full ${classes} border-slate-300 border-t-slate-900`}></div>
    </div>
  )
}
