export const zones = [
  { id: 'optimal', name: 'Optimal Decision Making Zone', emoji: '\u{1F9E0}✨',
    glucoseMin: 80, glucoseMax: 130, color: '#22c55e', bgOpacity: 0.35 },
  { id: 'decision', name: 'Decision Making Zone', emoji: '\u{1F914}',
    glucoseMin: 30, glucoseMax: 80, color: '#4ade80', bgOpacity: 0.30 },
  { id: 'pepper-sausage', name: 'Pepper Sausage Zone', emoji: '\u{1F336}️\u{1F32D}',
    glucoseMin: -20, glucoseMax: 30, color: '#86efac', bgOpacity: 0.25 },
  { id: 'dangerous', name: 'Dangerous Decision Making Zone', emoji: '⚠️',
    glucoseMin: -80, glucoseMax: -20, color: '#a16207', bgOpacity: 0.30 },
  { id: 'ptsd', name: 'Post Traumatic Stress Zone', emoji: '\u{1F630}',
    glucoseMin: -140, glucoseMax: -80, color: '#ef4444', bgOpacity: 0.30 },
  { id: 'real-pepper-sausage', name: 'Real Pepper Sausage Zone', emoji: '\u{1F336}️\u{1F32D}\u{1F525}',
    glucoseMin: -180, glucoseMax: -140, color: '#dc2626', bgOpacity: 0.35 },
  { id: 'addiction', name: 'Addiction Zone', emoji: '\u{1F504}\u{1F480}',
    glucoseMin: -210, glucoseMax: -180, color: '#3b82f6', bgOpacity: 0.40 },
];

export function getZoneAtGlucose(glucose) {
  for (const z of zones) {
    if (glucose <= z.glucoseMax && glucose >= z.glucoseMin) return z;
  }
  return zones[zones.length - 1];
}
