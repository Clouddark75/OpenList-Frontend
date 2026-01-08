import { MountDetails } from "~/types"

export const showDiskUsage = (details?: MountDetails) => {
  return details?.total_space && details?.total_space > 0
}

export const toReadableUsage = (details: MountDetails) => {
  let total = details.total_space!
  // Priorizar used_space si existe, sino calcularlo desde free_space
  let used = details.used_space ?? (total - (details.free_space ?? 0))
  
  // Convert to MB first
  const totalMB = total / (1024 * 1024)
  const usedMB = used / (1024 * 1024)
  
  if (totalMB < 1024) {
    // Display in MB for storage < 1GB
    return `${Math.round(usedMB)} / ${Math.round(totalMB)} MB`
  } else {
    // Display in GB for storage >= 1GB
    const totalGB = Math.round(totalMB / 1024)
    const usedGB = Math.round(usedMB / 1024)
    return `${usedGB} / ${totalGB} GB`
  }
}

export const usedPercentage = (details: MountDetails) => {
  if (!details.total_space || details.total_space <= 0) return 0.0
  const total = details.total_space
  const used = details.used_space ?? (total - (details.free_space ?? 0))
  return used >= total ? 100.0 : (used / total) * 100.0
}

export const nearlyFull = (details: MountDetails) => {
  const free = details.free_space ?? (details.total_space! - (details.used_space ?? 0))
  return free / details.total_space! < 0.1
}
