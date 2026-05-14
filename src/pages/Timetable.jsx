import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPlus, FiTrash2, FiUpload, FiX, FiCalendar, FiCopy, FiCheckCircle, FiXCircle } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { storage } from '../utils/storage'
import { parseTimetableText } from '../utils/parsers'

const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2)

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const defaultForm = { subject: '', day: 'Monday', start_time: '', end_time: '', faculty: '', room: '' }

export default function Timetable() {
  const [entries, setEntries] = useState(storage.getTimetable)
  const [form, setForm] = useState(defaultForm)
  const [showForm, setShowForm] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [showAIPrompt, setShowAIPrompt] = useState(false)
  const [importText, setImportText] = useState('')

  const save = (data) => {
    storage.setTimetable(data)
    setEntries(data)
  }

  const addEntry = () => {
    if (!form.subject || !form.start_time || !form.end_time) {
      toast.error('Subject, start time, and end time are required')
      return
    }
    const newEntry = { ...form, id: uid() }
    save([...entries, newEntry])
    setForm(defaultForm)
    setShowForm(false)
    toast.success('Class added')
  }

  const deleteEntry = (id) => {
    save(entries.filter((e) => e.id !== id))
    toast.success('Class removed')
  }

  const handleImport = () => {
    if (!importText.trim()) {
      toast.error('Paste your timetable text first')
      return
    }
    const parsed = parseTimetableText(importText)
    if (parsed.length === 0) {
      toast.error('Could not parse any entries. Format: "Day | 09:00 - 10:00 | Subject | Faculty | Room"')
      return
    }
    const newEntries = parsed.map((e) => ({ ...e, id: uid() }))
    save([...entries, ...newEntries])
    setImportText('')
    setShowImport(false)
    toast.success(`${parsed.length} classes imported`)
  }

  const AI_PROMPT = `Convert my university timetable into this exact text format. Each day should be on its own line as a header, followed by classes in this format:

HH:MM - HH:MM | Subject Name | Faculty Name | Room Number

Rules:
- Use 24-hour time format (e.g., 09:00, 14:30)
- Separate fields with " | " (pipe with spaces)
- Put each day header on its own line (Monday, Tuesday, etc.)
- Skip Sunday
- If faculty or room is unknown, write "TBA"

Example output:
Monday
09:00 - 10:00 | Data Structures | Dr. Sharma | Room 201
10:00 - 11:00 | DBMS | Prof. Verma | Room 201

Tuesday
09:00 - 10:00 | Python Programming | Prof. Singh | Room 102

Now convert my timetable (attached) into this format. Output ONLY the formatted text, nothing else.`

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(AI_PROMPT)
    toast.success('AI prompt copied!')
  }

  const todayStr = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` })()
  const [viewDate, setViewDate] = useState(todayStr)
  const [attendanceRecords, setAttendanceRecords] = useState(storage.getAttendance)

  const viewDayName = useMemo(() => {
    const d = new Date(viewDate + 'T12:00:00')
    return d.toLocaleDateString('en-US', { weekday: 'long' })
  }, [viewDate])

  const dayClasses = useMemo(() => {
    return entries.filter((e) => e.day === viewDayName)
  }, [entries, viewDayName])

  const isClassAbsent = (subject) =>
    attendanceRecords.some((r) => r.date === viewDate && r.subject === subject)

  const toggleDayAbsent = (subject) => {
    const records = storage.getAttendance()
    const existing = records.find((r) => r.date === viewDate && r.subject === subject)
    let updated
    if (existing) {
      updated = records.filter((r) => r.id !== existing.id)
      toast.success(`${subject} unmarked`)
    } else {
      updated = [...records, { id: uid(), date: viewDate, subject, day: viewDayName }]
      toast.success(`${subject} marked absent`)
    }
    storage.setAttendance(updated)
    setAttendanceRecords(updated)
  }

  const isPastDay = useMemo(() => {
    const d = new Date(viewDate + 'T23:59:59')
    return d < new Date()
  }, [viewDate])

  const isFutureDay = useMemo(() => {
    const d = new Date(viewDate + 'T00:00:00')
    return d > new Date()
  }, [viewDate])

  const isClassPast = (endTime) => {
    if (isPastDay) return true
    if (isFutureDay) return false
    const now = new Date()
    const [eh, em] = endTime.split(':').map(Number)
    const classEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), eh, em)
    return now >= classEnd
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const subjectsList = useMemo(() => [...new Set(entries.map((e) => e.subject))], [entries])

  const [tempClasses, setTempClasses] = useState(storage.getTempClasses)
  const [showTempModal, setShowTempModal] = useState(false)
  const tempDefault = { subject: '', date: todayStr, start_time: '', end_time: '', faculty: '', room: '', note: '' }
  const [tempForm, setTempForm] = useState(tempDefault)

  const addTempClass = () => {
    if (!tempForm.subject || !tempForm.start_time || !tempForm.end_time) {
      toast.error('Subject, start time, and end time are required')
      return
    }
    const dayName = new Date(tempForm.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' })
    const newItem = { ...tempForm, id: uid(), day: dayName }
    const updated = [...tempClasses, newItem]
    storage.setTempClasses(updated)
    setTempClasses(updated)
    setTempForm(tempDefault)
    setShowTempModal(false)
    toast.success('Temporary class added')
  }

  const deleteTempClass = (id) => {
    const updated = tempClasses.filter((t) => t.id !== id)
    storage.setTempClasses(updated)
    setTempClasses(updated)
    toast.success('Temporary class removed')
  }

  const dateTempClasses = useMemo(() => {
    return tempClasses.filter((t) => t.date === viewDate)
  }, [tempClasses, viewDate])

  // Lock body scroll when any modal is open
  const anyModalOpen = showForm || showImport || showAIPrompt || showTempModal
  useEffect(() => {
    if (anyModalOpen) document.body.classList.add('modal-open')
    else document.body.classList.remove('modal-open')
    return () => document.body.classList.remove('modal-open')
  }, [anyModalOpen])

  const combinedDayClasses = useMemo(() => {
    const regular = dayClasses.map((c) => ({ ...c, isTemp: false }))
    const temp = dateTempClasses.map((t) => ({ ...t, isTemp: true }))
    return [...regular, ...temp].sort((a, b) => {
      const [ah, am] = a.start_time.split(':').map(Number)
      const [bh, bm] = b.start_time.split(':').map(Number)
      return ah * 60 + am - (bh * 60 + bm)
    })
  }, [dayClasses, dateTempClasses])

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Timetable</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your weekly class schedule.</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <button onClick={() => setShowImport(true)} className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-all">
            <FiUpload className="w-4 h-4" /> Import
          </button>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-medium hover:shadow-lg transition-all">
            <FiPlus className="w-4 h-4" /> Manual Add
          </button>
          <button onClick={() => { setTempForm(tempDefault); setShowTempModal(true) }} className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white text-xs font-medium hover:shadow-lg transition-all">
            <FiCalendar className="w-4 h-4" /> Temp
          </button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            <FiCalendar className="inline mr-2 w-4 h-4" />
            Daily Attendance
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4">
          <input type="date" value={viewDate} onChange={(e) => setViewDate(e.target.value)} className="w-full sm:w-auto px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none" />
          <span className="text-xs sm:text-sm font-medium text-gray-500">{viewDayName}, {formatDate(viewDate)}</span>
        </div>
        {combinedDayClasses.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No classes scheduled on this day.</p>
        ) : (
          <div className="space-y-2">
            {combinedDayClasses.map((c) => {
              const absent = isClassAbsent(c.subject)
              const past = isClassPast(c.end_time)
              const present = !absent && past
              return (
                <div key={c.id} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${absent ? 'bg-red-50 border border-red-200' : present ? (c.isTemp ? 'bg-violet-50 border border-violet-200' : 'bg-emerald-50 border border-emerald-200') : (c.isTemp ? 'bg-violet-50 border border-violet-200' : 'bg-gradient-to-r from-rose-50 to-pink-50/50')}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-semibold text-sm ${absent ? 'text-red-500 line-through' : 'text-gray-800'}`}>{c.subject}</p>
                      {c.isTemp && <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-violet-200 text-violet-600">Temp</span>}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{c.start_time} - {c.end_time}</p>
                    {(c.faculty || c.room) && <p className="text-xs text-gray-400">{c.faculty}{c.room ? ` · ${c.room}` : ''}</p>}
                    {c.note && <p className="text-xs text-gray-400 mt-0.5 italic">{c.note}</p>}
                  </div>
                  <div className="shrink-0 flex items-center gap-1">
                    {c.isTemp && (
                      <button onClick={() => deleteTempClass(c.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-500 transition-all" title="Remove temporary class">
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${absent ? 'text-red-500 bg-red-100' : present ? 'text-emerald-600 bg-emerald-100' : 'text-gray-400 bg-gray-100'}`}>
                      {absent ? 'Absent' : present ? 'Present' : 'Upcoming'}
                    </span>
                    <button onClick={() => toggleDayAbsent(c.subject)} className={`shrink-0 flex items-center justify-center p-1.5 rounded-lg transition-all ${absent ? 'bg-red-100 text-red-500 hover:bg-red-200' : present ? 'bg-emerald-100 text-emerald-500 hover:bg-emerald-200' : 'bg-gradient-to-r from-rose-100 to-pink-100 text-red-400 hover:from-red-100 hover:to-rose-100 hover:text-red-500'}`} title={absent ? 'Mark present' : 'Mark absent'}>
                      {absent ? <FiCheckCircle className="w-4 h-4" /> : <FiXCircle className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </motion.div>

      {entries.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <FiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 text-sm">No classes scheduled yet.</p>
          <p className="text-gray-400 text-xs mt-1">Add classes manually or import a timetable.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {days.map((day) => {
            const dayEntries = entries.filter((e) => e.day === day)
            if (dayEntries.length === 0) return null
            return (
              <motion.div key={day} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">{day}</h3>
                <div className="space-y-2">
                  {dayEntries.map((entry) => (
                    <motion.div
                      key={entry.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="group relative p-3 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50/50 hover:from-rose-100 hover:to-pink-100/50 transition-all cursor-pointer"
                    >
                      <button
                      onClick={() => deleteEntry(entry.id)}
                      className="absolute top-2 right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-2 rounded-lg bg-white/80 hover:bg-red-50 text-red-400 hover:text-red-500"
                    >
                      <FiTrash2 className="w-4 h-4" />
                      </button>
                      <p className="font-semibold text-gray-800 text-sm pr-6">{entry.subject}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{entry.start_time} - {entry.end_time}</p>
                      {(entry.faculty || entry.room) && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {entry.faculty}{entry.faculty && entry.room ? ' · ' : ''}{entry.room}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 overflow-y-auto" onClick={() => setShowForm(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-100 my-8 sm:my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Add Class</h3>
                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><FiX className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-gray-400">Subject *</label>
                  <input className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-sm" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Data Structures" />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-gray-400">Day</label>
                  <select className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-sm bg-white" value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}>
                    {days.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-gray-400">Start *</label>
                    <input type="time" className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-sm" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-gray-400">End *</label>
                    <input type="time" className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-sm" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-gray-400">Faculty</label>
                  <input className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-sm" value={form.faculty} onChange={(e) => setForm({ ...form, faculty: e.target.value })} placeholder="e.g. Dr. Sharma" />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-gray-400">Room</label>
                  <input className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-sm" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} placeholder="e.g. Room 301" />
                </div>
              </div>
              <button onClick={addEntry} className="w-full mt-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-medium hover:shadow-lg transition-all">Add Class</button>
            </motion.div>
          </div>
        )}

        {showImport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 overflow-y-auto" onClick={() => setShowImport(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-gray-100 my-8 sm:my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Import Timetable</h3>
                <button onClick={() => setShowImport(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><FiX className="w-5 h-5" /></button>
              </div>
              <p className="text-xs text-gray-400 mb-3">Paste formatted text. Use day names as headers and `|` as separator.</p>
              <pre className="text-xs text-gray-400 bg-gray-50 rounded-xl p-3 mb-4 leading-relaxed">Monday
09:00 - 10:00 | Data Structures | Dr. Sharma | Room 301
10:00 - 11:00 | Algorithms | Prof. Verma | Room 302</pre>
              <button onClick={() => setShowAIPrompt(true)} className="text-xs text-violet-500 hover:text-violet-600 hover:underline transition-all mb-3">
                Don't have the right format? Use AI to convert your timetable.
              </button>
              <textarea
                className="w-full h-40 px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-sm resize-none"
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Paste your timetable here..."
              />
              <button onClick={handleImport} className="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm font-medium hover:shadow-lg transition-all">Import Classes</button>
            </motion.div>
          </div>
        )}

        {showAIPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 overflow-y-auto" onClick={() => setShowAIPrompt(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-xl shadow-2xl border border-gray-100 my-8 sm:my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">AI Prompt</h3>
                <button onClick={() => setShowAIPrompt(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><FiX className="w-5 h-5" /></button>
              </div>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                Copy the prompt below and paste it in ChatGPT, Gemini, or any AI chatbot. Attach your timetable image or PDF along with it. Then paste the AI's output here.
              </p>
              <pre className="text-xs text-gray-600 bg-gray-50 rounded-xl p-4 mb-4 leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto">{AI_PROMPT}</pre>
              <button onClick={handleCopyPrompt} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white text-sm font-medium hover:shadow-lg transition-all">
                <FiCopy className="w-4 h-4" /> Copy Prompt
              </button>
            </motion.div>
          </div>
        )}

        {showTempModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 overflow-y-auto" onClick={() => setShowTempModal(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-100 my-8 sm:my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Temporary Class</h3>
                <button onClick={() => setShowTempModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><FiX className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-gray-400">Date</label>
                  <input type="date" className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-sm" value={tempForm.date} onChange={(e) => setTempForm({ ...tempForm, date: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-gray-400">Subject *</label>
                  <div className="flex gap-2">
                    <input className="flex-1 mt-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-sm" value={tempForm.subject} onChange={(e) => setTempForm({ ...tempForm, subject: e.target.value })} placeholder="Type subject name" list="subject-list" />
                    <datalist id="subject-list">
                      {subjectsList.map((s) => <option key={s} value={s} />)}
                    </datalist>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-gray-400">Start *</label>
                    <input type="time" className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-sm" value={tempForm.start_time} onChange={(e) => setTempForm({ ...tempForm, start_time: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-gray-400">End *</label>
                    <input type="time" className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-sm" value={tempForm.end_time} onChange={(e) => setTempForm({ ...tempForm, end_time: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-gray-400">Faculty</label>
                  <input className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-sm" value={tempForm.faculty} onChange={(e) => setTempForm({ ...tempForm, faculty: e.target.value })} placeholder="e.g. Dr. Sharma" />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-gray-400">Room</label>
                  <input className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-sm" value={tempForm.room} onChange={(e) => setTempForm({ ...tempForm, room: e.target.value })} placeholder="e.g. Room 301" />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-gray-400">Note</label>
                  <input className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-sm" value={tempForm.note} onChange={(e) => setTempForm({ ...tempForm, note: e.target.value })} placeholder="e.g. Extra class, Swapped with DBMS" />
                </div>
              </div>
              <button onClick={addTempClass} className="w-full mt-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white text-sm font-medium hover:shadow-lg transition-all">Add Temporary Class</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
