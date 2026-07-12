import { useState, useContext } from 'react'
import NavDrawer from './NavDrawer'
import { Menu, Users } from 'lucide-react'
import { StudentContext } from '../../context/StudentContext'

export default function AppShell({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { kodeKelas, namaKelas, isInClass } = useContext(StudentContext)

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-surface shadow-md z-40 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Menu Button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 hover:bg-primary-100 rounded-lg transition-colors flex-shrink-0"
            aria-label="Menu"
          >
            <Menu className="w-6 h-6 text-ink-900" />
          </button>
          
          {/* Center: Title - Always centered */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <h1 className="text-xl font-poppins font-semibold text-ink-900 whitespace-nowrap">
              Mentalytics
            </h1>
          </div>

          {/* Right: Class Info */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Class Info - Desktop only */}
            {isInClass && kodeKelas && (
              <div className="hidden lg:flex items-center gap-2 bg-primary-100 px-3 py-1.5 rounded-lg">
                <Users className="w-4 h-4 text-primary-700" />
                <div className="text-xs">
                  <p className="font-mono font-bold text-primary-700">{kodeKelas}</p>
                  {namaKelas && (
                    <p className="text-ink-600 text-[10px] leading-tight max-w-[120px] truncate">
                      {namaKelas}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Navigation Drawer */}
      <NavDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Main Content */}
      <main className="pt-16 pb-8">
        {children}
      </main>
    </div>
  )
}
