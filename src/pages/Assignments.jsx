import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPlus, FiTrash2, FiCheck, FiX, FiClock } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { storage } from '../utils/storage'

const priorities = ['High', 'Medium', 'Low']
const priorityColors = { High: 'bg-red-500 text-white', Medium: 'bg-orange-500 text-white', Low: 'bg-green-500 text-white' }

const defaultForm = { title: '', subject: '', deadline: '', priority: 'Medium' }

export default function Assignments() {
  const [assignments, setAssignments] = useState(storage.getAssignments)
  const [form, setForm] = useState(defaultForm)
  const [showForm, setShowForm] = useState(false)
  const [sortBy, setSortBy] = useState('deadline')

  const save = (data) => {
    storage.setAssignments(data)
    setAssignments(data)
  }

  const addAssignment = () => {
    if (!form.title || !form.deadline) {
      toast.error('Title and deadline are required')
      return
    }
    const newItem = { ...form, id: Date.now().toString(), is_completed: false }
    save([...assignments, newItem])
    setForm(defaultForm)
    setShowForm(false)
    toast.success('Assignment added')
  }

  const toggleComplete = (id) => {
    save(assignments.map((a) => a.id === id ? { ...a, is_completed: !a.is_completed } : a))
    toast.success('Status updated')
  }

  const deleteAssignment = (id) => {
    save(assignments.filter((a) => a.id !== id))
    toast.success('Assignment deleted')
  }

  const sortAssignments = (list) => {
    const sorted = [...list]
    if (sortBy === 'deadline') {
      sorted.sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    } else if (sortBy === 'priority') {
      const order = { High: 0, Medium: 1, Low: 2 }
      sorted.sort((a, b) => (order[a.priority] ?? 1) - (order[b.priority] ?? 1))
    }
    return sorted
  }

  const pending = sortAssignments(assignments.filter((a) => !a.is_completed))
  const completed = sortAssignments(assignments.filter((a) => a.is_completed))

  const isOverdue = (deadline) => {
    return new Date(deadline) < new Date(new Date().toDateString())
  }

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showForm) document.body.classList.add('modal-open')
    else document.body.classList.remove('modal-open')
    return () => document.body.classList.remove('modal-open')
  }, [showForm])

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Assignments</h1>
          <p className="text-sm text-gray-400 mt-1">Track your academic tasks and deadlines.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-medium hover:shadow-lg transition-all">
          <FiPlus className="w-4 h-4" /> Add
        </button>
      </motion.div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-gray-400">Sort by:</span>
        {['deadline', 'priority'].map((s) => (
          <button key={s} onClick={() => setSortBy(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${sortBy === s ? 'bg-rose-100 text-rose-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-rose-500 mb-4">Pending ({pending.length})</h2>
          {pending.length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center">All caught up! 🎉</p>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {pending.map((a, i) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ delay: i * 0.03 }}
                    className="group relative p-4 rounded-xl border border-gray-100 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm">{a.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{a.subject}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase ${priorityColors[a.priority] || priorityColors.Medium}`}>{a.priority}</span>
                          <span className={`flex items-center gap-1 text-[10px] font-medium ${isOverdue(a.deadline) ? 'text-red-400' : 'text-gray-400'}`}>
                            <FiClock className="w-3 h-3" />
                            {new Date(a.deadline).toLocaleDateString('en-GB')}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => toggleComplete(a.id)} className="p-2.5 rounded-lg hover:bg-emerald-50 text-emerald-400 hover:text-emerald-500 transition-colors"><FiCheck className="w-5 h-5" /></button>
                        <button onClick={() => deleteAssignment(a.id)} className="p-2.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-500 transition-colors"><FiTrash2 className="w-5 h-5" /></button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-emerald-500 mb-4">Completed ({completed.length})</h2>
          {completed.length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center">No completed assignments yet.</p>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {completed.map((a, i) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ delay: i * 0.03 }}
                    className="group relative p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-400 text-sm line-through">{a.title}</p>
                        <p className="text-xs text-gray-300 mt-0.5">{a.subject}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase bg-gray-100 text-gray-400">{a.priority}</span>
                          <span className="flex items-center gap-1 text-[10px] font-medium text-gray-300">
                            <FiClock className="w-3 h-3" />
                            {new Date(a.deadline).toLocaleDateString('en-GB')}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => toggleComplete(a.id)} className="p-2.5 rounded-lg hover:bg-amber-50 text-amber-400 hover:text-amber-500 transition-colors"><FiX className="w-5 h-5" /></button>
                        <button onClick={() => deleteAssignment(a.id)} className="p-2.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-500 transition-colors"><FiTrash2 className="w-5 h-5" /></button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>

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
                <h3 className="text-lg font-bold text-gray-800">New Assignment</h3>
                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><FiX className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-gray-400">Title *</label>
                  <input className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-sm" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Database Project" />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-gray-400">Subject</label>
                  <input className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-sm" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. DBMS" />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-gray-400">Deadline *</label>
                  <input type="date" className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-sm" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-gray-400">Priority</label>
                  <div className="flex gap-2 mt-1">
                    {priorities.map((p) => (
                      <button key={p} onClick={() => setForm({ ...form, priority: p })} className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${form.priority === p ? 'ring-2 ring-offset-1 ' + (p === 'High' ? 'ring-rose-400 text-rose-600 bg-rose-50' : p === 'Medium' ? 'ring-amber-400 text-amber-600 bg-amber-50' : 'ring-emerald-400 text-emerald-600 bg-emerald-50') : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>{p}</button>
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={addAssignment} className="w-full mt-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-medium hover:shadow-lg transition-all">Add Assignment</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
