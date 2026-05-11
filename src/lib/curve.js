// Sugar Decisions Glucose Model — pure data, no screen coordinates

export const TOTAL_TIME = 90;
export const GLUCOSE_MAX = 130;
export const GLUCOSE_MIN = -210;

const keyframes = [
  { time: 0,  glucose: 0 },
  { time: 40, glucose: 0 },
  { time: 42, glucose: 80 },
  { time: 43, glucose: 120 },
  { time: 44, glucose: 80 },
  { time: 45, glucose: 0 },
  { time: 46, glucose: -100 },
  { time: 47, glucose: -170 },
  { time: 48, glucose: -200 },
  { time: 49, glucose: -170 },
  { time: 50, glucose: -100 },
  { time: 51.5, glucose: 0 },
  { time: 60, glucose: 0 },
  { time: 90, glucose: 0 },
];

function cosInterp(a, b, t) {
  return a + (b - a) * (1 - Math.cos(t * Math.PI)) / 2;
}

export function glucoseAtTime(time) {
  for (let i = 0; i < keyframes.length - 1; i++) {
    if (time >= keyframes[i].time && time <= keyframes[i + 1].time) {
      const p = (time - keyframes[i].time) / (keyframes[i + 1].time - keyframes[i].time);
      return cosInterp(keyframes[i].glucose, keyframes[i + 1].glucose, p);
    }
  }
  return keyframes[keyframes.length - 1].glucose;
}
