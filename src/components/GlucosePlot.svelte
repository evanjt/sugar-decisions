<script>
  import { sampleWaypoints, TOTAL_TIME, GLUCOSE_MAX, GLUCOSE_MIN } from '../lib/curve.js';
  import { zones, getZoneAtGlucose } from '../lib/zones.js';
  import { yAxisValues } from '../lib/yaxis.js';
  import Tooltip from './Tooltip.svelte';

  let { onLog } = $props();

  const VB_W = 450;
  const VB_H = 700;

  const chartLeft = 48;
  const chartTop = 8;
  const chartRight = VB_W - 6;
  const chartBottom = VB_H - 32;
  const chartWidth = chartRight - chartLeft;
  const chartHeight = chartBottom - chartTop;

  function gToY(g) { return chartTop + (GLUCOSE_MAX - g) / (GLUCOSE_MAX - GLUCOSE_MIN) * chartHeight; }
  const baselineY = gToY(0);

  const rawSamples = sampleWaypoints();
  const samples = rawSamples.map(s => ({
    x: chartLeft + s.px * chartWidth,
    y: gToY(s.g),
    glucose: s.g,
    time: s.t,
  }));

  const curvePath = (() => {
    let d = `M ${samples[0].x.toFixed(1)} ${samples[0].y.toFixed(1)}`;
    for (let i = 1; i < samples.length; i++)
      d += ` L ${samples[i].x.toFixed(1)} ${samples[i].y.toFixed(1)}`;
    return d;
  })();
  const closedPath = curvePath + ' Z';

  const peak = samples.reduce((a, b) => b.glucose > a.glucose ? b : a, samples[0]);
  const crash = samples.reduce((a, b) => b.glucose < a.glucose ? b : a, samples[0]);

  const zoneLabels = (() => {
    const labels = [];
    for (const zone of zones) {
      const inZone = samples.filter(s => s.glucose >= zone.glucoseMin && s.glucose <= zone.glucoseMax);
      if (inZone.length < 2) continue;
      const mid = inZone[Math.floor(inZone.length / 2)];
      labels.push({ zone, x: mid.x, y: mid.y });
    }
    return labels;
  })();

  const xTicks = [0, 15, 30, 45, 60, 75, 90];
  function tToX(t) { return chartLeft + (t / TOTAL_TIME) * chartWidth; }

  let hoverPoint = $state(null);
  let svgEl = $state(null);

  function handleMouseMove(ev) {
    if (!svgEl) return;
    const pt = svgEl.createSVGPoint();
    pt.x = ev.clientX;
    pt.y = ev.clientY;
    const ctm = svgEl.getScreenCTM();
    if (!ctm) return;
    const sp = pt.matrixTransform(ctm.inverse());

    let best = 0, bestD = Infinity;
    for (let i = 0; i < samples.length; i++) {
      const d = (samples[i].x - sp.x) ** 2 + (samples[i].y - sp.y) ** 2;
      if (d < bestD) { bestD = d; best = i; }
    }
    if (Math.sqrt(bestD) > 30) { hoverPoint = null; return; }
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

<div class="plot-wrapper">
  <svg
    bind:this={svgEl}
    viewBox="0 0 {VB_W} {VB_H}"
    preserveAspectRatio="xMidYMid meet"
    onmousemove={handleMouseMove}
    onmouseleave={() => hoverPoint = null}
    onclick={handleClick}
    ontouchmove={(e) => { e.preventDefault(); handleMouseMove({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY }); }}
    ontouchend={() => hoverPoint = null}
  >
    <defs>
      {#each zones as zone}
        <clipPath id="zc-{zone.id}">
          <rect x="0" y={gToY(zone.glucoseMax)}
            width={VB_W} height={gToY(zone.glucoseMin) - gToY(zone.glucoseMax)} />
        </clipPath>
      {/each}
    </defs>

    {#each zones as zone}
      <path d={closedPath} fill={zone.color} opacity={zone.bgOpacity}
        clip-path="url(#zc-{zone.id})" />
    {/each}

    <line x1={chartLeft} y1={baselineY} x2={chartRight} y2={baselineY}
      stroke="#aaa" stroke-width="0.7" stroke-dasharray="4,3" opacity="0.5" />

    <line x1={chartLeft} y1={chartTop} x2={chartLeft} y2={chartBottom}
      stroke="#555" stroke-width="1" />
    {#each yAxisValues as g}
      {@const y = gToY(g)}
      <line x1={chartLeft - 4} y1={y} x2={chartLeft} y2={y} stroke="#555" stroke-width="0.7" />
      <text x={chartLeft - 6} y={y + 3} text-anchor="end" fill="#777"
        font-size="7" font-family="Inter, sans-serif">{g}</text>
      <line x1={chartLeft} y1={y} x2={chartRight} y2={y}
        stroke="#333" stroke-width="0.2" stroke-dasharray="2,3" />
    {/each}
    <text x="8" y={(chartTop + chartBottom) / 2} text-anchor="middle" fill="#555"
      font-size="7" font-family="Permanent Marker, cursive"
      transform="rotate(-90, 8, {(chartTop + chartBottom) / 2})">
      Sugar Rush Index
    </text>

    <line x1={chartLeft} y1={chartBottom} x2={chartRight} y2={chartBottom}
      stroke="#555" stroke-width="1" />
    {#each xTicks as t}
      {@const tx = tToX(t)}
      <line x1={tx} y1={chartBottom} x2={tx} y2={chartBottom + 3} stroke="#555" stroke-width="0.7" />
      <text x={tx} y={chartBottom + 11} text-anchor="middle" fill="#888"
        font-size="6" font-family="Inter, sans-serif">{t}m</text>
    {/each}
    <text x={(chartLeft + chartRight) / 2} y={VB_H - 4} text-anchor="middle"
      fill="#666" font-size="7" font-family="Permanent Marker, cursive">
      Minutes Since The Mistake
    </text>

    <path d={curvePath} fill="none" stroke="#e0e0e0" stroke-width="1.5"
      stroke-linecap="round" stroke-linejoin="round" />

    <circle cx={peak.x} cy={peak.y} r="2.5" fill="#22c55e" stroke="#fff" stroke-width="1" />
    <circle cx={crash.x} cy={crash.y} r="3" fill="#3b82f6" stroke="#fff" stroke-width="1" />

    {#each zoneLabels as lbl}
      <text x={lbl.x} y={lbl.y} text-anchor="middle" fill={lbl.zone.color}
        font-size="8" font-weight="bold" font-family="Permanent Marker, cursive"
        stroke="#0d0d1a" stroke-width="2" paint-order="stroke">
        {lbl.zone.emoji} {lbl.zone.name}
      </text>
    {/each}

    {#if hoverPoint}
      <line x1={hoverPoint.svgX} y1={chartTop} x2={hoverPoint.svgX} y2={chartBottom}
        stroke={hoverPoint.zone.color} stroke-width="0.5" stroke-dasharray="2,2" opacity="0.4" />
      <line x1={chartLeft} y1={hoverPoint.svgY} x2={chartRight} y2={hoverPoint.svgY}
        stroke={hoverPoint.zone.color} stroke-width="0.5" stroke-dasharray="2,2" opacity="0.4" />
      <circle cx={hoverPoint.svgX} cy={hoverPoint.svgY} r="4"
        fill={hoverPoint.zone.color} stroke="#fff" stroke-width="1.5" />
    {/if}
  </svg>

  <Tooltip point={hoverPoint} />
</div>

<style>
  .plot-wrapper { position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
  svg { max-width: 100%; max-height: 100%; display: block; cursor: crosshair; }
</style>
