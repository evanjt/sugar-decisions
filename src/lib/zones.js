// Zone layout (glucose range 130 to -210 = 340 total)
// Render order: broad zones first, narrow overlapping zones on top

export const zones = [
  // Broad zones (rendered first, behind)
  { id: 'optimal', name: 'Optimal Decision Making Zone', emoji: '\u{1F9E0}✨',
    glucoseMin: 113, glucoseMax: 130, color: '#22c55e', bgOpacity: 0.40 },
  { id: 'decision', name: 'Decision Making Zone', emoji: '\u{1F914}',
    glucoseMin: -5, glucoseMax: 15, color: '#4ade80', bgOpacity: 0.30 },
  { id: 'dangerous', name: 'Dangerous Decision Making Zone', emoji: '⚠️',
    glucoseMin: -80, glucoseMax: -5, color: '#a16207', bgOpacity: 0.30 },
  { id: 'ptsd', name: 'Post Traumatic Stress Zone', emoji: '\u{1F630}',
    glucoseMin: -175, glucoseMax: -80, color: '#ef4444', bgOpacity: 0.30 },
  { id: 'real-pepper-sausage', name: 'Real Pepper Sausage Zone', emoji: '\u{1F336}️\u{1F32D}\u{1F525}',
    glucoseMin: -192, glucoseMax: -175, color: '#dc2626', bgOpacity: 0.40 },
  { id: 'addiction', name: 'Addiction Zone', emoji: '\u{1F504}\u{1F480}',
    glucoseMin: -210, glucoseMax: -192, color: '#3b82f6', bgOpacity: 0.45 },

  // Narrow zone rendered on top (interrupts dangerous)
  { id: 'pepper-sausage', name: 'Pepper Sausage Zone', emoji: '\u{1F336}️\u{1F32D}',
    glucoseMin: -48, glucoseMax: -41, color: '#86efac', bgOpacity: 0.35 },
];

export function getZoneAtGlucose(glucose) {
  let best = null;
  for (const z of zones) {
    if (glucose <= z.glucoseMax && glucose >= z.glucoseMin) {
      if (!best || (z.glucoseMax - z.glucoseMin) < (best.glucoseMax - best.glucoseMin))
        best = z;
    }
  }
  return best || zones[zones.length - 1];
}
