<script>
  import GlucosePlot from './components/GlucosePlot.svelte';
  import LogList from './components/LogList.svelte';

  let logEntries = $state([]);

  let pr = $state(JSON.parse(localStorage.getItem('sugar-decisions-pr') || 'null'));

  function handleLog(entry) {
    logEntries = [entry, ...logEntries];

    const t = parseInt(entry.timeMin);
    if (!pr || t < pr.curveTime) {
      pr = {
        curveTime: t,
        zone: entry.zone.name,
        emoji: entry.zone.emoji,
        color: entry.zone.color,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
      };
      localStorage.setItem('sugar-decisions-pr', JSON.stringify(pr));
    }
  }

  function handleClear() {
    logEntries = [];
  }

  function resetPR() {
    pr = null;
    localStorage.removeItem('sugar-decisions-pr');
  }
</script>

<div class="layout">
  <div class="plot-panel">
    <GlucosePlot onLog={handleLog} />
  </div>

  <aside class="sidebar">
    <header>
      <h1>Sugar Decisions</h1>
      <p class="subtitle">The Sugar Decisions Glucose Model</p>
      <p class="tagline">Peer-reviewed by absolutely nobody</p>
    </header>

    {#if pr}
      <div class="pr-box" style:border-color={pr.color}>
        <div class="pr-title">PR</div>
        <div class="pr-value" style:color={pr.color}>{pr.curveTime} min</div>
        <div class="pr-zone">{pr.emoji} {pr.zone}</div>
        <div class="pr-date">{pr.date} {pr.time}</div>
        <button class="pr-reset" onclick={resetPR}>reset</button>
      </div>
    {:else}
      <div class="pr-box empty">
        <div class="pr-title">PR</div>
        <div class="pr-empty">No record yet. Pick a point.</div>
      </div>
    {/if}

    <div class="instructions">
      <p>Tap the curve. Face the consequences.</p>
    </div>

    <LogList entries={logEntries} onClear={handleClear} />

    <footer>
      <p>If your doctor shows you this chart, get a new doctor.</p>
    </footer>
  </aside>
</div>

<style>
  .layout {
    display: flex;
    height: 100vh;
    overflow: hidden;
  }

  .plot-panel {
    flex: 1;
    min-width: 0;
    height: 100%;
  }

  .sidebar {
    width: 320px;
    flex-shrink: 0;
    height: 100%;
    overflow-y: auto;
    padding: 20px 24px;
    background: #111122;
    border-left: 1px solid #222;
    display: flex;
    flex-direction: column;
  }

  header {
    margin-bottom: 20px;
  }

  h1 {
    font-family: 'Permanent Marker', cursive;
    font-size: 1.8rem;
    color: #e0e0e0;
    margin: 0;
    letter-spacing: 1px;
  }

  .subtitle {
    font-family: 'Inter', sans-serif;
    color: #888;
    font-size: 13px;
    margin: 6px 0 0;
  }

  .tagline {
    font-family: 'Inter', sans-serif;
    color: #555;
    font-size: 11px;
    font-style: italic;
    margin: 2px 0 0;
  }

  .pr-box {
    background: #0d0d1a;
    border: 1px solid #333;
    border-left: 3px solid;
    border-radius: 6px;
    padding: 12px 14px;
    margin-bottom: 16px;
    position: relative;
  }

  .pr-box.empty {
    border-left-color: #444;
  }

  .pr-title {
    font-family: 'Permanent Marker', cursive;
    font-size: 11px;
    color: #666;
    letter-spacing: 2px;
    margin-bottom: 4px;
  }

  .pr-value {
    font-family: 'Permanent Marker', cursive;
    font-size: 28px;
    line-height: 1;
    margin-bottom: 4px;
  }

  .pr-zone {
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    color: #aaa;
    margin-bottom: 2px;
  }

  .pr-date {
    font-family: 'Inter', sans-serif;
    font-size: 10px;
    color: #555;
  }

  .pr-reset {
    position: absolute;
    top: 10px;
    right: 10px;
    background: transparent;
    border: none;
    color: #444;
    font-size: 10px;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
  }

  .pr-reset:hover {
    color: #ef4444;
  }

  .pr-empty {
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    color: #444;
    font-style: italic;
  }

  .instructions {
    margin-bottom: 16px;
  }

  .instructions p {
    font-family: 'Inter', sans-serif;
    color: #666;
    font-size: 12px;
  }

  footer {
    margin-top: auto;
    padding-top: 16px;
  }

  footer p {
    font-family: 'Inter', sans-serif;
    color: #333;
    font-size: 10px;
    font-style: italic;
  }
</style>
