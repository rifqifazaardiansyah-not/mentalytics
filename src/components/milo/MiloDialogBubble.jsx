export default function MiloDialogBubble({ children, className = '', tailPosition = 'bottom' }) {
  return (
    <div className={`relative bg-primary-200 rounded-2xl p-6 shadow-md ${className}`}>
      {/* Speech bubble tail - conditional position */}
      {tailPosition === 'bottom' && (
        <div className="absolute -bottom-3 left-8 w-6 h-6 bg-primary-200 transform rotate-45" />
      )}
      {tailPosition === 'top' && (
        <div className="absolute -top-3 left-8 w-6 h-6 bg-primary-200 transform rotate-45" />
      )}
      
      {/* Content */}
      <div className="relative z-10 text-milo text-ink-900">
        {children}
      </div>
    </div>
  )
}
