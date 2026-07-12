import { Link } from 'react-router-dom'
import { X, Home, BookOpen, Users, Sparkles, ChevronDown, ChevronUp, Hand, Heart, GraduationCap, School, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useContext } from 'react'
import { StudentContext } from '../../context/StudentContext'
import ConfirmDialog from '../ConfirmDialog'

export default function NavDrawer({ isOpen, onClose }) {
  const { isInClass, leaveClass, kodeKelas, studentName } = useContext(StudentContext)
  const [tapMiloOpen, setTapMiloOpen] = useState(false)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)

  const handleLeaveClass = () => {
    leaveClass()
    onClose()
  }

  const menuItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/panduan', label: 'Panduan', icon: BookOpen },
    { path: '/about', label: 'About Us', icon: Users },
    { path: '/kelas', label: 'Kelas', icon: School },
  ]

  const tapMiloSubmenu = [
    { path: '/tentang-milo', label: 'Sapa Milo!', icon: Hand },
    { path: '/motivasi', label: 'Motivasi', icon: Heart },
    { path: '/kegiatan-belajar', label: 'Kegiatan Belajar', icon: GraduationCap },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 left-0 bottom-0 w-64 bg-surface shadow-xl z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-primary-300">
              <h2 className="text-lg font-poppins font-semibold text-ink-900">
                Menu
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-ink-900" />
              </button>
            </div>

            {/* Menu Items */}
            <nav className="p-4">
              <ul className="space-y-2">
                {menuItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={onClose}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary-100 transition-colors text-ink-900"
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                ))}

                {/* Tap Milo Dropdown - Only show if user is in class */}
                {isInClass && (
                  <li>
                    <div className="flex items-center gap-1">
                      <Link
                        to="/tap-milo"
                        onClick={onClose}
                        className="flex-1 flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary-100 transition-colors text-ink-900"
                      >
                        <Sparkles className="w-5 h-5" />
                        <span className="font-medium">Tap Milo</span>
                      </Link>
                      <button
                        onClick={() => setTapMiloOpen(!tapMiloOpen)}
                        className="p-3 hover:bg-primary-100 rounded-lg transition-colors text-ink-900"
                        aria-label="Toggle Tap Milo submenu"
                      >
                        {tapMiloOpen ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Submenu */}
                    <AnimatePresence>
                      {tapMiloOpen && (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden ml-4 mt-1 space-y-1"
                        >
                          {tapMiloSubmenu.map((item) => (
                            <li key={item.path}>
                              <Link
                                to={item.path}
                                onClick={onClose}
                                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-primary-100 hover:shadow-md transition-all duration-200 text-ink-700 text-sm group"
                              >
                                <item.icon className="w-4 h-4 group-hover:text-primary-600 transition-colors" />
                                <span className="group-hover:text-ink-900 group-hover:font-medium transition-all">{item.label}</span>
                              </Link>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </li>
                )}
              </ul>
            </nav>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-primary-300">
              {/* User Info if in class */}
              {isInClass && (
                <div className="p-4 bg-primary-50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                      {studentName?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-ink-900 truncate">{studentName}</p>
                      <p className="text-xs text-ink-600 font-mono">{kodeKelas}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowLeaveConfirm(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-red-50 border border-red-200 text-red-700 rounded-lg font-medium transition-all text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Keluar Kelas
                  </button>
                </div>
              )}
              
              {/* Copyright */}
              <div className="p-4">
                <p className="text-xs text-ink-600 text-center">
                  Mentalytics © 2026
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLeaveConfirm}
        onClose={() => setShowLeaveConfirm(false)}
        onConfirm={handleLeaveClass}
        title="Keluar dari Kelas?"
        message="Apakah kamu yakin ingin keluar dari kelas? Data progress kamu akan tetap tersimpan dan kamu bisa bergabung lagi kapan saja."
        confirmText="Ya, Keluar"
        cancelText="Batal"
        variant="danger"
      />
    </AnimatePresence>
  )
}
