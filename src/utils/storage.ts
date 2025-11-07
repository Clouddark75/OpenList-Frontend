import { MountDetails } from "~/types"

export const showDiskUsage = (details: MountDetails | undefined) => {
  return (
    details &&
    details.total_space &&
    details.free_space &&
    details.total_space > 0
  )
}

export const toReadableUsage = (details: MountDetails) => {
  let total = details.total_space!
  let used = total - details.free_space!
  
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
  return (
    ((details.total_space! - details.free_space!) / details.total_space!) *
    100.0
  )
}

export const nearlyFull = (details: MountDetails) => {
  return details.free_space! / details.total_space! < 0.1
}
