export function savedWrist(): number {
  try {
    const value = Number(sessionStorage.getItem('mekit.wrist.v1'))
    return value >= 12 && value <= 24 && Number.isInteger(value * 2) ? value : 16.5
  } catch {
    return 16.5
  }
}
export function saveWrist(value: number) {
  try {
    sessionStorage.setItem('mekit.wrist.v1', String(value))
  } catch {
    /* Optional convenience only. */
  }
}
