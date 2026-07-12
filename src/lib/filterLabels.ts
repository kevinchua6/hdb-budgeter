export function flatTypeLabel(t: string) {
  return t.charAt(0) + t.slice(1).toLowerCase();
}
export function walkLabel(m: number) {
  return `${m} mins`;
}
export function leaseLabel(y: number) {
  return y === 0 ? "Any" : `${y} years`;
}
export function monthsLabel(m: number) {
  if (m < 12) return `${m} months`;
  const y = m / 12;
  return `${y} year${y > 1 ? "s" : ""}`;
}
