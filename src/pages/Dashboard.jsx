import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiBookOpen, FiCalendar, FiClipboard, FiInfo, FiXCircle, FiCheckCircle, FiClock, FiEdit2 } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { storage } from '../utils/storage'

// Unique ID generator — avoids duplicate IDs from rapid clicks
const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2)

// Local date string in YYYY-MM-DD without timezone shift
const getLocalDateStr = (d = new Date()) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const quotes = [
  "The secret of getting ahead is getting started. — Mark Twain",
  "Education is the most powerful weapon. — Mandela",
  "Success is the sum of small efforts repeated daily.",
  "Your attitude, not your aptitude, determines your altitude.",
  "Don't watch the clock; do what it does. Keep going.",
  "The expert in anything was once a beginner.",
  "It does not matter how slowly you go, so long as you do not stop.",
]

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function StatCard({ icon: Icon, label, value, color, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative overflow-hidden bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 text-left w-full"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 rounded-full opacity-10 bg-gradient-to-br ${color}`} />
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-xl sm:text-2xl font-bold text-gray-800 truncate">{value}</p>
      <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-gray-400 mt-1">{label}</p>
    </motion.button>
  )
}

export default function Dashboard() {
  const [quote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)])
  const [semester, setSemester] = useState(storage.getSemester)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(semester)

  // Use useState initializer so data is fresh on every mount (page switch)
  const [timetable] = useState(() => storage.getTimetable())
  const [assignments] = useState(() => storage.getAssignments())
  const [tempClasses] = useState(() => storage.getTempClasses())

  const todayName = days[new Date().getDay()]
  const [now, setNow] = useState(new Date())
  const todayDate = getLocalDateStr(now)

  const todayClasses = useMemo(() => {
    const regular = timetable.filter((c) => c.day === todayName)
    const temp = tempClasses.filter((t) => t.date === todayDate)
    return [...regular, ...temp].sort((a, b) => a.start_time.localeCompare(b.start_time))
  }, [timetable, tempClasses, todayName, todayDate])

  const pendingCount = useMemo(
    () => assignments.filter((a) => !a.is_completed).length,
    [assignments]
  )

  const subjectsCount = useMemo(
    () => new Set(timetable.map((c) => c.subject)).size,
    [timetable]
  )

  const [attendance, setAttendance] = useState(storage.getAttendance)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(id)
  }, [])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
    }
    return () => document.body.classList.remove('modal-open')
  }, [showModal])

  const isAbsent = (subject) => attendance.some(r => r.date === todayDate && r.subject === subject)

  const toggleAbsent = (subject) => {
    const records = storage.getAttendance()
    const existing = records.find(r => r.date === todayDate && r.subject === subject)
    let updated
    if (existing) {
      updated = records.filter(r => r.id !== existing.id)
      toast.success(`Unmarked ${subject}`)
    } else {
      updated = [...records, { id: uid(), date: todayDate, subject, day: todayName }]
      toast.success(`${subject} marked absent`)
    }
    storage.setAttendance(updated)
    setAttendance(updated)
  }

  const toggleFullDayAbsent = () => {
    const records = storage.getAttendance()
    const todaySubjects = todayClasses.map(c => c.subject)
    const alreadyMarked = records.filter(r => r.date === todayDate && todaySubjects.includes(r.subject))
    const allMarked = todaySubjects.every(s => alreadyMarked.some(r => r.subject === s))

    let updated
    if (allMarked) {
      updated = records.filter(r => !(r.date === todayDate && todaySubjects.includes(r.subject)))
      toast.success('All today\'s classes unmarked')
    } else {
      const newRecords = todayClasses
        .filter(c => !alreadyMarked.some(r => r.subject === c.subject))
        .map(c => ({ id: uid(), date: todayDate, subject: c.subject, day: todayName }))
      updated = [...records, ...newRecords]
      toast.success('Full day marked absent')
    }
    storage.setAttendance(updated)
    setAttendance(updated)
  }

  const handleSaveSemester = () => {
    storage.setSemester(form)
    setSemester(form)
    setShowModal(false)
    toast.success('Semester info updated')
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Welcome back{semester.name ? `, ${semester.name}` : ''}! Here's your academic overview.</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={FiCalendar} label="Today's Classes" value={todayClasses.length} color="from-rose-500 to-pink-500" />
        <StatCard icon={FiClipboard} label="Pending Tasks" value={pendingCount} color="from-amber-500 to-orange-500" />
        <StatCard icon={FiBookOpen} label="Subjects" value={subjectsCount} color="from-sky-500 to-blue-500" />
        <div className="relative">
          <StatCard
            icon={FiInfo}
            label="Semester"
            value={semester.course ? `${semester.course} ${semester.semester}` : 'Set Info'}
            color="from-emerald-500 to-green-500"
            onClick={() => setShowModal(true)}
          />
          <button onClick={() => setShowModal(true)} className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/80 hover:bg-white text-gray-400 hover:text-rose-500 shadow-sm transition-all">
            <FiEdit2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              <FiCalendar className="inline mr-2 w-4 h-4" />
              Today's Classes ({todayName})
            </h2>
            {todayClasses.length > 0 && (
              <button onClick={toggleFullDayAbsent} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] font-semibold hover:shadow-lg transition-all">
                <FiXCircle className="w-3 h-3" /> Full Day
              </button>
            )}
          </div>
          {todayClasses.length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center">No classes scheduled for today 🎉</p>
          ) : (
            <div className="space-y-3">
              {todayClasses.map((c, idx) => {
                const absent = isAbsent(c.subject)
                const [eh, em] = c.end_time.split(':').map(Number)
                const classEnd = new Date(now)
                classEnd.setHours(eh, em, 0, 0)
                const isPast = now >= classEnd
                const isPresent = !absent && isPast

                let cardStyle, barStyle, subjectStyle, statusBadge
                if (absent) {
                  cardStyle = 'bg-red-50 border border-red-200'
                  barStyle = 'bg-red-400'
                  subjectStyle = 'text-red-500 line-through'
                  statusBadge = { text: 'Absent', style: 'text-red-500 bg-red-100' }
                } else if (isPresent) {
                  cardStyle = 'bg-emerald-50 border border-emerald-200'
                  barStyle = 'bg-emerald-400'
                  subjectStyle = 'text-emerald-700'
                  statusBadge = { text: 'Present', style: 'text-emerald-600 bg-emerald-100' }
                } else {
                  cardStyle = 'bg-gradient-to-r from-rose-50 to-pink-50/50'
                  barStyle = 'bg-gradient-to-b from-rose-500 to-pink-500'
                  subjectStyle = 'text-gray-800'
                  statusBadge = { text: 'Upcoming', style: 'text-gray-400 bg-gray-100' }
                }

                return (
                  <div key={c.id || `class-${idx}`} className={`flex items-start gap-3 p-3 rounded-xl transition-all ${cardStyle}`}>
                    <div className={`w-1 h-14 rounded-full shrink-0 ${barStyle}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm ${subjectStyle}`}>{c.subject}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {c.start_time} - {c.end_time}
                      </p>
                      <p className="text-xs text-gray-400">
                        {c.faculty}{c.faculty && c.room ? ' · ' : ''}{c.room}
                      </p>
                      <span className={`inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${statusBadge.style}`}>{statusBadge.text}</span>
                    </div>
                    <button onClick={() => toggleAbsent(c.subject)} className={`shrink-0 self-center flex items-center justify-center p-2.5 rounded-xl transition-all ${absent ? 'bg-red-100 text-red-500 hover:bg-red-200' : (isPresent ? 'bg-emerald-100 text-emerald-500 hover:bg-emerald-200' : 'bg-gradient-to-r from-rose-100 to-pink-100 text-red-400 hover:from-red-100 hover:to-rose-100 hover:text-red-500')}`} title={absent ? 'Mark present' : 'Mark absent'}>
                      {absent ? <FiCheckCircle className="w-5 h-5" /> : <FiXCircle className="w-5 h-5" />}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" /></svg>
          </div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">Motivational Corner</h2>
          <p className="text-gray-600 italic leading-relaxed text-sm">"{quote}"</p>
        </motion.div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 overflow-y-auto" onClick={() => setShowModal(false)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-100 my-8 sm:my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">Semester Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-gray-400">Student Name</label>
                <input className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-sm" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. John Doe" />
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-gray-400">Course</label>
                <input className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-sm" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} placeholder="e.g. BCA" />
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-gray-400">Semester</label>
                <input className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-sm" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} placeholder="e.g. Sem 4" />
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-gray-400">Start Date</label>
                <input type="date" className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-sm" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-gray-400">End Date</label>
                <input type="date" className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-sm" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleSaveSemester} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-medium hover:shadow-lg transition-all">Save</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
