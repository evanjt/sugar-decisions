// Sugar Decisions Glucose Model — manually traced from whiteboard drawing
// px = x-position (0-1 of chart width), g = glucose, t = time
// y-position is derived from glucose via the standard axis

export const TOTAL_TIME = 90;
export const GLUCOSE_MAX = 130;
export const GLUCOSE_MIN = -210;

export const waypoints = [
  // Flat baseline
  { px: 0.05, g: 0, t: 0 },
  { px: 0.15, g: 0, t: 40 },

  // Sharp spike up
  { px: 0.16, g: 60, t: 42 },
  { px: 0.17, g: 120, t: 43 },

  // Descent from peak — left wall of tube, curves right
  { px: 0.21, g: 85, t: 44 },
  { px: 0.25, g: 45, t: 44.5 },
  { px: 0.22, g: 15, t: 45 },
  { px: 0.22, g: -25, t: 45.5 },
  { px: 0.28, g: -65, t: 46 },
  { px: 0.34, g: -110, t: 46.5 },
  { px: 0.40, g: -150, t: 47 },
  { px: 0.44, g: -180, t: 47.5 },
  { px: 0.47, g: -200, t: 48 },

  // Recovery — right wall of tube, FURTHER RIGHT than descent
  { px: 0.55, g: -180, t: 49 },
  { px: 0.56, g: -150, t: 49.5 },
  { px: 0.53, g: -110, t: 50 },
  { px: 0.47, g: -65, t: 50.5 },
  { px: 0.38, g: -25, t: 51 },
  { px: 0.32, g: 0, t: 51.5 },

  // Flat baseline to end
  { px: 0.40, g: 0, t: 60 },
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
