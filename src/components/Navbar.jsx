import { motion } from 'framer-motion'
import { FiGrid, FiCalendar, FiCheckSquare, FiBarChart2 } from 'react-icons/fi'

const links = [
  { to: '/', label: 'Dashboard', icon: FiGrid },
  { to: '/timetable', label: 'Timetable', icon: FiCalendar },
  { to: '/assignments', label: 'Tasks', icon: FiCheckSquare },
  { to: '/attendance', label: 'Attendance', icon: FiBarChart2 },
]

export default function Navbar({ activePage, setActivePage }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-gray-100 safe-bottom md:top-0 md:bottom-auto md:border-t-0 md:border-b">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between md:justify-start md:gap-8 h-16">
          <div className="hidden md:flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">U</div>
            <span className="font-semibold text-gray-800">UniAssistant</span>
          </div>
          <div className="flex items-center justify-around w-full md:w-auto md:gap-2">
            {links.map(({ to, label, icon: Icon }) => (
              <button
                key={to}
                onClick={() => setActivePage(to)}
                className={`relative flex flex-col md:flex-row items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 ${
                  activePage === to
                    ? 'text-rose-500 md:bg-gradient-to-r md:from-rose-500 md:to-pink-500 md:text-white'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] md:text-sm font-medium">{label}</span>
                {activePage === to && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -top-px left-2 right-2 h-0.5 bg-rose-500 rounded-full md:hidden"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
