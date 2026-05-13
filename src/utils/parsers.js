export function parseTimetableText(text) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  const entries = []

  let currentDay = null

  const dayMap = {
    monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
    thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday',
    sunday: 'Sunday', mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday',
    thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
  }

  for (const line of lines) {
    const lower = line.toLowerCase()

    const dayKey = Object.keys(dayMap).find((k) => lower.startsWith(k) && (lower.length === k.length || lower[k.length] === ' ' || lower[k.length] === ':'))
    if (dayKey) {
      currentDay = dayMap[dayKey]
      continue
    }

    const timeRangePattern = /(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/
    const timeMatch = line.match(timeRangePattern)

    if (currentDay && timeMatch) {
      const parts = line.split('|').map((p) => p.trim())
      const timeStr = parts[0] || ''
      const timeM = timeStr.match(timeRangePattern)

      if (timeM) {
        entries.push({
          subject: parts[1] || 'Untitled',
          faculty: parts[2] || '',
          room: parts[3] || '',
          day: currentDay,
          start_time: timeM[1],
          end_time: timeM[2],
        })
      }
    }
  }

  return entries
}
