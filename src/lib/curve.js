// Sugar Decisions Glucose Model — manually traced from whiteboard drawing

export const TOTAL_TIME = 90;
export const GLUCOSE_MAX = 130;
export const GLUCOSE_MIN = -210;

export const waypoints = [
  // Flat baseline
  { px: 0.02, g: 0, t: 0 },
  { px: 0.08, g: 0, t: 40 },

  // Sharp spike up
  { px: 0.09, g: 60, t: 42 },
  { px: 0.10, g: 120, t: 43 },

  // Descent — original shape
  { px: 0.11, g: 95, t: 43.5 },
  { px: 0.12, g: 65, t: 44 },
  { px: 0.14, g: 35, t: 44.3 },
  { px: 0.12, g: 15, t: 44.6 },
  { px: 0.15, g: -10, t: 45 },
  { px: 0.22, g: -40, t: 45.5 },
  { px: 0.30, g: -70, t: 46 },
  { px: 0.40, g: -100, t: 46.5 },
  { px: 0.50, g: -130, t: 47 },
  { px: 0.60, g: -160, t: 47.5 },
  { px: 0.68, g: -185, t: 47.8 },
  { px: 0.74, g: -198, t: 48 },
  { px: 0.80, g: -200, t: 48.3 },

  // Pointed trough — hooks right instead of wide U-turn
  { px: 0.84, g: -197, t: 48.5 },
  { px: 0.86, g: -190, t: 48.8 },

  // Narrower recovery — closer to descent path
  { px: 0.78, g: -170, t: 49.2 },
  { px: 0.69, g: -145, t: 49.6 },
  { px: 0.58, g: -115, t: 50 },
  { px: 0.46, g: -85, t: 50.5 },
  { px: 0.35, g: -55, t: 51 },
  { px: 0.25, g: -25, t: 51.5 },
  { px: 0.18, g: -5, t: 52 },
  { px: 0.17, g: 5, t: 52.5 },
  { px: 0.20, g: 12, t: 53 },
  { px: 0.25, g: 10, t: 58 },
  { px: 0.35, g: 7, t: 65 },
  { px: 0.50, g: 4, t: 72 },
  { px: 0.65, g: 2, t: 80 },
  { px: 0.80, g: 1, t: 85 },
  { px: 0.92, g: 0, t: 89 },
  { px: 0.95, g: 0, t: 90 },
];

function catmullRom(p0, p1, p2, p3, t) {
  const t2 = t * t, t3 = t2 * t;
  return 0.5 * (
    2 * p1 +
    (-p0 + p2) * t +
    (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
    (-p0 + 3 * p1 - 3 * p2 + p3) * t3
  );
}

export function sampleWaypoints(numSamples = 800) {
  const n = waypoints.length;
  const totalSeg = n - 1;
  const samples = [];

  for (let i = 0; i < numSamples; i++) {
    const f = (i / (numSamples - 1)) * totalSeg;
    const seg = Math.min(Math.floor(f), totalSeg - 1);
    const t = f - seg;

    const p0 = waypoints[Math.max(0, seg - 1)];
    const p1 = waypoints[seg];
    const p2 = waypoints[Math.min(n - 1, seg + 1)];
    const p3 = waypoints[Math.min(n - 1, seg + 2)];

    samples.push({
      px: catmullRom(p0.px, p1.px, p2.px, p3.px, t),
      g:  catmullRom(p0.g,  p1.g,  p2.g,  p3.g,  t),
      t:  catmullRom(p0.t,  p1.t,  p2.t,  p3.t,  t),
    });
  }

  return samples;
}
