const KEYS = {
  TIMETABLE: 'uni_assistant_timetable',
  ASSIGNMENTS: 'uni_assistant_assignments',
  SEMESTER: 'uni_assistant_semester',
  ATTENDANCE: 'uni_assistant_attendance',
  TEMP_CLASSES: 'uni_assistant_temp_classes',
}

function get(key, fallback = null) {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : fallback
  } catch {
    return fallback
  }
}

function set(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export const storage = {
  getTimetable: () => get(KEYS.TIMETABLE, []),
  setTimetable: (data) => set(KEYS.TIMETABLE, data),

  getAssignments: () => get(KEYS.ASSIGNMENTS, []),
  setAssignments: (data) => set(KEYS.ASSIGNMENTS, data),

  getSemester: () =>
    get(KEYS.SEMESTER, { name: '', course: '', semester: '', start_date: '', end_date: '' }),
  setSemester: (data) => set(KEYS.SEMESTER, data),

  getAttendance: () => get(KEYS.ATTENDANCE, []),
  setAttendance: (data) => set(KEYS.ATTENDANCE, data),

  getTempClasses: () => get(KEYS.TEMP_CLASSES, []),
  setTempClasses: (data) => set(KEYS.TEMP_CLASSES, data),
}
