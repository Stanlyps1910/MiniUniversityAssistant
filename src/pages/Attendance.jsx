import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { FiRefreshCw, FiTrendingUp, FiAlertCircle, FiThumbsUp } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { storage } from '../utils/storage'
import { calculateAttendance, getRiskLevel } from '../utils/attendance'

const getLocalDateStr = (d = new Date()) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function Attendance() {
  const [totalOverride, setTotalOverride] = useState('')
  const [attended, setAttended] = useState('')
  const [remainingOverride, setRemainingOverride] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')

  const timetable = storage.getTimetable()
  const tempClasses = storage.getTempClasses()
  const semester = storage.getSemester()

  const subjects = useMemo(
    () => [...new Set(timetable.map((e) => e.subject))],
    [timetable]
  )


  const autoTotal = useMemo(() => {
    if (!semester.start_date) return 0
    const start = new Date(semester.start_date)
    const now = new Date()
    if (now <= start) return 0

    let count = 0
    const d = new Date(start)
    while (d <= now) {
      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' })
      const dateStr = getLocalDateStr(d)

      if (dayName !== 'Sunday') {
        const regularCount = timetable.filter((e) => e.day === dayName && (!selectedSubject || e.subject === selectedSubject)).length
        count += regularCount
      }

      const tempCount = tempClasses.filter((t) => t.date === dateStr && (!selectedSubject || t.subject === selectedSubject)).length
      count += tempCount

      d.setDate(d.getDate() + 1)
    }
    return count
  }, [timetable, tempClasses, semester, selectedSubject])

  const totalClasses = totalOverride === '' ? autoTotal : Number(totalOverride)

  const attendanceRecords = storage.getAttendance()
  const today = new Date()
  const semesterStart = semester.start_date ? new Date(semester.start_date) : null
  const missedCount = attendanceRecords.filter(r => {
    if (!semesterStart) return false
    const rd = new Date(r.date)
    if (rd < semesterStart || rd > today) return false
    return !selectedSubject || r.subject === selectedSubject
  }).length
  const autoAttended = Math.max(0, autoTotal - missedCount)
  const effectiveAttended = attended === '' ? autoAttended : Number(attended)

  const autoRemaining = useMemo(() => {
    if (!semester.end_date) return 0
    const end = new Date(semester.end_date)
    const now = new Date()
    if (end <= now) return 0

    let count = 0
    const d = new Date(now)
    d.setDate(d.getDate() + 1) // Start from tomorrow
    while (d <= end) {
      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' })
      const dateStr = getLocalDateStr(d)

      if (dayName !== 'Sunday') {
        const regularCount = timetable.filter((e) => e.day === dayName && (!selectedSubject || e.subject === selectedSubject)).length
        count += regularCount
      }

      const tempCount = tempClasses.filter((t) => t.date === dateStr && (!selectedSubject || t.subject === selectedSubject)).length
      count += tempCount

      d.setDate(d.getDate() + 1)
    }
    return count
  }, [timetable, tempClasses, semester, selectedSubject])

  const remaining = remainingOverride ? parseInt(remainingOverride) || 0 : autoRemaining

  const result = useMemo(
    () => calculateAttendance(totalClasses, effectiveAttended, remaining),
    [totalClasses, effectiveAttended, remaining]
  )

  const risk = useMemo(() => getRiskLevel(result.currentPercentage), [result])

  const riskColors = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', gradient: 'from-emerald-500 to-green-500', icon: FiThumbsUp },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', gradient: 'from-amber-500 to-orange-500', icon: FiAlertCircle },
    red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', gradient: 'from-red-500 to-rose-500', icon: FiAlertCircle },
  }

  const rc = riskColors[risk.color]

  const handleReset = () => {
    setTotalOverride('')
    setAttended('')
    setRemainingOverride('')
    setSelectedSubject('')
    toast.success('Attendance calculator reset')
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Attendance</h1>
          <p className="text-sm text-gray-400 mt-1">Track and analyze your attendance percentage.</p>
        </div>
        <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all">
          <FiRefreshCw className="w-4 h-4" /> Reset
        </button>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">Input Data</h2>
            <div className="space-y-4">
              {subjects.length > 0 && (
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-gray-400">Subject</label>
                  <select className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-sm bg-white" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                    <option value="">All Subjects (flat estimate)</option>
                    {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  Total Classes Held
                  <span className="text-gray-300 font-normal normal-case ml-1">(auto: {autoTotal})</span>
                </label>
                <input type="number" min="0" className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-sm" value={totalOverride} onChange={(e) => setTotalOverride(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0))} placeholder={`Auto-calculated: ${autoTotal}`} />
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  Classes Attended
                  <span className="text-gray-300 font-normal normal-case ml-1">(auto: {autoAttended})</span>
                </label>
                <input type="number" min="0" className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-sm" value={attended} onChange={(e) => setAttended(e.target.value === '' ? '' : Math.max(0, Math.min(totalClasses, parseInt(e.target.value) || 0)))} placeholder={`Auto: ${autoAttended}`} />
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  Remaining Classes
                  <span className="text-gray-300 font-normal normal-case ml-1">(auto: {autoRemaining})</span>
                </label>
                <input type="number" min="0" className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-sm" value={remainingOverride} onChange={(e) => setRemainingOverride(e.target.value)} placeholder={`Auto-calculated: ${autoRemaining}`} />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${rc.bg} rounded-2xl p-6 border ${rc.border} shadow-sm`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-sm font-semibold uppercase tracking-wider ${rc.text}`}>Status: {risk.label}</h2>
              <rc.icon className={`w-6 h-6 ${rc.text}`} />
            </div>

            <div className="relative mb-6">
              <div className="w-full h-3 rounded-full bg-white/80 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(result.currentPercentage, 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={`h-full rounded-full bg-gradient-to-r ${rc.gradient}`}
                />
              </div>
              <p className={`text-3xl font-bold mt-2 ${rc.text}`}>{result.currentPercentage}%</p>
              <p className="text-xs text-gray-400">Target: {result.targetPercentage}%</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/60 rounded-xl p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Need to Attend</p>
                <p className="text-xl font-bold text-gray-800 mt-1">{result.neededToReachTarget}</p>
                <p className="text-xs text-gray-400">classes to reach {result.targetPercentage}%</p>
              </div>
              <div className="bg-white/60 rounded-xl p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Can Skip</p>
                <p className="text-xl font-bold text-gray-800 mt-1">{result.safeSkip}</p>
                <p className="text-xs text-gray-400">classes safely</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
          >
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">
              <FiTrendingUp className="inline mr-2 w-4 h-4" />
              Summary
            </h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Total classes held: <span className="font-semibold text-gray-800">{totalClasses}</span></p>
              <p>Classes attended: <span className="font-semibold text-gray-800">{effectiveAttended}</span></p>
              <p>Classes missed: <span className="font-semibold text-gray-800">{totalClasses - effectiveAttended}</span></p>
              <p>Marked absent: <span className="font-semibold text-gray-800">{missedCount}</span></p>
              <p>Classes remaining: <span className="font-semibold text-gray-800">{remaining}</span></p>
              <p>Total (held + remaining): <span className="font-semibold text-gray-800">{totalClasses + remaining}</span></p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
