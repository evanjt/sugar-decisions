// Sugar Decisions Glucose Model — manually traced from whiteboard drawing

export const TOTAL_TIME = 90;
export const GLUCOSE_MAX = 130;
export const GLUCOSE_MIN = -210;

export const waypoints = [
  // Flat baseline
  { px: 0.05, g: 0, t: 0 },
  { px: 0.10, g: 0, t: 40 },

  // Sharp spike up (very narrow, nearly vertical like whiteboard)
  { px: 0.11, g: 60, t: 42 },
  { px: 0.12, g: 120, t: 43 },

  // Descent — comes back down then curves right in a smooth diagonal
  { px: 0.13, g: 100, t: 43.5 },
  { px: 0.15, g: 70, t: 44 },
  { px: 0.17, g: 40, t: 44.3 },
  { px: 0.15, g: 20, t: 44.6 },
  { px: 0.18, g: -10, t: 45 },
  { px: 0.25, g: -40, t: 45.5 },
  { px: 0.33, g: -70, t: 46 },
  { px: 0.40, g: -100, t: 46.5 },
  { px: 0.48, g: -130, t: 47 },
  { px: 0.54, g: -160, t: 47.5 },
  { px: 0.58, g: -185, t: 47.8 },
  { px: 0.60, g: -200, t: 48 },

  // Recovery — right wall of tube, smooth curve back up
  { px: 0.66, g: -185, t: 49 },
  { px: 0.64, g: -160, t: 49.3 },
  { px: 0.60, g: -130, t: 49.7 },
  { px: 0.53, g: -100, t: 50 },
  { px: 0.44, g: -70, t: 50.4 },
  { px: 0.36, g: -40, t: 50.8 },
  { px: 0.28, g: -10, t: 51.2 },
  { px: 0.24, g: 0, t: 51.5 },
  { px: 0.23, g: 8, t: 51.8 },
  { px: 0.24, g: 3, t: 52 },
  { px: 0.25, g: 0, t: 52.2 },

  // Flat baseline to end
  { px: 0.32, g: 0, t: 60 },
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
