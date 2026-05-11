<script>
  import { glucoseAtTime, TOTAL_TIME, GLUCOSE_MAX, GLUCOSE_MIN, DISTORTION } from '../lib/curve.js';
  import { zones, getZoneAtGlucose } from '../lib/zones.js';
  import { yAxisValues } from '../lib/yaxis.js';
  import Tooltip from './Tooltip.svelte';

  let { onLog } = $props();

  let containerEl = $state(null);
  let cw = $state(800);
  let ch = $state(600);

  $effect(() => {
    if (!containerEl) return;
    const ro = new ResizeObserver(([e]) => {
      cw = e.contentRect.width || 800;
      ch = e.contentRect.height || 600;
    });
    ro.observe(containerEl);
    return () => ro.disconnect();
  });

  let chartLeft = $derived(55);
  let chartTop = $derived(8);
  let chartRight = $derived(cw - 8);
  let chartBottom = $derived(ch - 35);
  let chartWidth = $derived(chartRight - chartLeft);
  let chartHeight = $derived(chartBottom - chartTop);

  function gToY(g) { return chartTop + (GLUCOSE_MAX - g) / (GLUCOSE_MAX - GLUCOSE_MIN) * chartHeight; }
  function tToX(t) { return chartLeft + (t / TOTAL_TIME) * chartWidth; }
  function distortX(baseX, glucose) { return baseX - glucose * chartWidth * DISTORTION; }

  let baselineY = $derived(gToY(0));

  let samples = $derived.by(() => {
    const s = [];
    for (let i = 0; i <= 600; i++) {
      const time = (i / 600) * TOTAL_TIME;
      const glucose = glucoseAtTime(time);
      s.push({ time, glucose, x: distortX(tToX(time), glucose), y: gToY(glucose) });
    }
    return s;
  });

  let curvePath = $derived.by(() => {
    if (!samples.length) return '';
    let d = `M ${samples[0].x.toFixed(1)} ${samples[0].y.toFixed(1)}`;
    for (let i = 1; i < samples.length; i++)
      d += ` L ${samples[i].x.toFixed(1)} ${samples[i].y.toFixed(1)}`;
    return d;
  });

  let peak = $derived(samples.reduce((a, b) => b.glucose > a.glucose ? b : a, samples[0]));
  let crash = $derived(samples.reduce((a, b) => b.glucose < a.glucose ? b : a, samples[0]));

  let zoneFills = $derived.by(() => {
    const fills = [];
    for (const zone of zones) {
      let runStart = -1;
      for (let i = 0; i <= samples.length; i++) {
        const s = samples[i];
        const inZone = s && s.glucose >= zone.glucoseMin && s.glucose <= zone.glucoseMax;
        if (inZone && runStart === -1) runStart = i;
        if ((!inZone || i === samples.length) && runStart !== -1) {
          const end = Math.min(i - 1, samples.length - 1);
          const pts = samples.slice(runStart, end + 1);
          if (pts.length >= 2) {
            let d = `M ${pts[0].x.toFixed(1)} ${baselineY}`;
            for (const p of pts) d += ` L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
            d += ` L ${pts[pts.length - 1].x.toFixed(1)} ${baselineY} Z`;
            fills.push({ zone, path: d, midX: pts[Math.floor(pts.length / 2)].x, midY: pts[Math.floor(pts.length / 2)].y });
          }
          runStart = -1;
        }
      }
    }
    return fills;
  });

  let zoneLabels = $derived.by(() => {
    const seen = new Set();
    return zoneFills
      .filter(f => { if (seen.has(f.zone.id)) return false; seen.add(f.zone.id); return true; })
      .map(f => ({ zone: f.zone, x: f.midX, y: (f.midY + baselineY) / 2 }));
  });

  let yAxisPath = $derived.by(() => {
    const steps = 100;
    let d = '';
    for (let i = 0; i <= steps; i++) {
      const g = GLUCOSE_MAX - (i / steps) * (GLUCOSE_MAX - GLUCOSE_MIN);
      const x = distortX(chartLeft, g);
      const y = gToY(g);
      d += i === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return d;
  });

  const xTicks = [0, 15, 30, 45, 60, 75, 90];

  let hoverPoint = $state(null);

  function handleMouseMove(ev) {
    if (!containerEl) return;
    const r = containerEl.getBoundingClientRect();
    const sx = (ev.clientX - r.left) / r.width * cw;
    const sy = (ev.clientY - r.top) / r.height * ch;
    let best = 0, bestD = Infinity;
    for (let i = 0; i < samples.length; i++) {
      const d = (samples[i].x - sx) ** 2 + (samples[i].y - sy) ** 2;
      if (d < bestD) { bestD = d; best = i; }
    }
    if (Math.sqrt(bestD) > 40) { hoverPoint = null; return; }
    const s = samples[best];
    hoverPoint = {
      svgX: s.x, svgY: s.y,
      glucose: Math.round(s.glucose),
      timeMin: Math.round(s.time),
      zone: getZoneAtGlucose(s.glucose),
      pageX: ev.clientX, pageY: ev.clientY,
    };
  }

  function handleClick() {
    if (!hoverPoint) return;
    onLog?.({
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      timeMin: hoverPoint.timeMin + ' min',
      absurdY: hoverPoint.glucose,
      zone: hoverPoint.zone,
    });
  }
</script>

<div class="plot-wrapper" bind:this={containerEl}>
  <svg
    viewBox="0 0 {cw} {ch}"
    onmousemove={handleMouseMove}
    onmouseleave={() => hoverPoint = null}
    onclick={handleClick}
    ontouchmove={(e) => { e.preventDefault(); handleMouseMove({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY }); }}
    ontouchend={() => hoverPoint = null}
  >
    {#each zoneFills as f}
      <path d={f.path} fill={f.zone.color} opacity={f.zone.bgOpacity} />
    {/each}

    <line x1={chartLeft} y1={baselineY} x2={chartRight} y2={baselineY}
      stroke="#aaa" stroke-width="1" stroke-dasharray="6,4" opacity="0.5" />

    <!-- Curved y-axis -->
    <path d={yAxisPath} fill="none" stroke="#555" stroke-width="1.5" />
    {#each yAxisValues as g}
      {@const y = gToY(g)}
      {@const ax = distortX(chartLeft, g)}
      <line x1={ax - 5} y1={y} x2={ax} y2={y} stroke="#555" stroke-width="1" />
      <text x={ax - 8} y={y + 4} text-anchor="end" fill="#777"
        font-size="10" font-family="Inter, sans-serif">{g}</text>
      <line x1={ax} y1={y} x2={chartRight} y2={y}
        stroke="#333" stroke-width="0.3" stroke-dasharray="3,4" />
    {/each}
    <text x="15" y={(chartTop + chartBottom) / 2} text-anchor="middle" fill="#555"
      font-size="11" font-family="Permanent Marker, cursive"
      transform="rotate(-90, 15, {(chartTop + chartBottom) / 2})">
      Glucose (mg/dL)
    </text>

    <line x1={chartLeft} y1={chartBottom} x2={chartRight} y2={chartBottom}
      stroke="#555" stroke-width="1.5" />
    {#each xTicks as t}
      {@const tx = tToX(t)}
      <line x1={tx} y1={chartBottom} x2={tx} y2={chartBottom + 5} stroke="#555" stroke-width="1" />
      <text x={tx} y={chartBottom + 18} text-anchor="middle" fill="#888"
        font-size="10" font-family="Inter, sans-serif">{t}m</text>
    {/each}
    <text x={(chartLeft + chartRight) / 2} y={ch - 2} text-anchor="middle"
      fill="#666" font-size="12" font-family="Permanent Marker, cursive">
      Time After Sugar Intake
    </text>

    <path d={curvePath} fill="none" stroke="#e0e0e0" stroke-width="2.5"
      stroke-linecap="round" stroke-linejoin="round" />

    <circle cx={peak.x} cy={peak.y} r="4" fill="#22c55e" stroke="#fff" stroke-width="1.5" />
    <circle cx={crash.x} cy={crash.y} r="5" fill="#3b82f6" stroke="#fff" stroke-width="2" />

    {#each zoneLabels as lbl}
      <text x={lbl.x} y={lbl.y} text-anchor="middle" fill={lbl.zone.color}
        font-size="14" font-weight="bold" font-family="Permanent Marker, cursive"
        stroke="#0d0d1a" stroke-width="3" paint-order="stroke">
        {lbl.zone.emoji} {lbl.zone.name}
      </text>
    {/each}

    {#if hoverPoint}
      <line x1={hoverPoint.svgX} y1={chartTop} x2={hoverPoint.svgX} y2={chartBottom}
        stroke={hoverPoint.zone.color} stroke-width="0.8" stroke-dasharray="3,3" opacity="0.4" />
      <line x1={chartLeft} y1={hoverPoint.svgY} x2={chartRight} y2={hoverPoint.svgY}
        stroke={hoverPoint.zone.color} stroke-width="0.8" stroke-dasharray="3,3" opacity="0.4" />
      <circle cx={hoverPoint.svgX} cy={hoverPoint.svgY} r="6"
        fill={hoverPoint.zone.color} stroke="#fff" stroke-width="2" />
    {/if}
  </svg>

  <Tooltip point={hoverPoint} />
</div>

<style>
  .plot-wrapper { position: relative; width: 100%; height: 100%; }
  svg { width: 100%; height: 100%; display: block; cursor: crosshair; }
</style>
