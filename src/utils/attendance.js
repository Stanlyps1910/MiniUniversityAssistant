const TARGET_PERCENTAGE = 75

export function calculateAttendance(totalClasses, attended, remainingClasses) {
  const currentPercentage = totalClasses > 0
    ? Math.round((attended / totalClasses) * 100)
    : 0

  const futureTotal = totalClasses + remainingClasses

  let neededToReachTarget = 0
  if (futureTotal > 0) {
    const needed = Math.ceil((TARGET_PERCENTAGE / 100) * futureTotal - attended)
    neededToReachTarget = Math.max(0, needed)
  }

  const safeSkip = totalClasses > 0
    ? Math.max(0, Math.floor(attended - (TARGET_PERCENTAGE / 100) * totalClasses))
    : 0

  return {
    currentPercentage,
    targetPercentage: TARGET_PERCENTAGE,
    neededToReachTarget,
    safeSkip,
  }
}

export function getRiskLevel(currentPercentage) {
  if (currentPercentage >= 75) return { label: 'Safe', color: 'emerald' }
  if (currentPercentage >= 60) return { label: 'Warning', color: 'amber' }
  return { label: 'Danger', color: 'red' }
}
