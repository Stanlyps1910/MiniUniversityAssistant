import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Timetable from './pages/Timetable'
import Assignments from './pages/Assignments'
import Attendance from './pages/Attendance'

const pages = {
  '/': Dashboard,
  '/timetable': Timetable,
  '/assignments': Assignments,
  '/attendance': Attendance,
}

export default function App() {
  const [activePage, setActivePage] = useState('/')
  const Page = pages[activePage]

  return (
    <div className="min-h-screen pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pt-20 md:pb-8">
      <Navbar activePage={activePage} setActivePage={setActivePage} />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            <Page />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
