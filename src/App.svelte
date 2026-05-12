<script>
  import GlucosePlot from './components/GlucosePlot.svelte';
  import LogList from './components/LogList.svelte';

  let logEntries = $state([]);
  let prs = $state(JSON.parse(localStorage.getItem('sugar-decisions-prs') || '{}'));

  function timeMinutes() {
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes() + n.getSeconds() / 60;
  }

  function handleLog(entry) {
    logEntries = [entry, ...logEntries];

    const zoneId = entry.zone.id;
    const now = timeMinutes();
    const nowStr = new Date().toLocaleTimeString();
    const dateStr = new Date().toLocaleDateString();

    if (!prs[zoneId] || now < prs[zoneId].minutes) {
      prs[zoneId] = {
        minutes: now,
        time: nowStr,
        date: dateStr,
        zone: entry.zone.name,
        emoji: entry.zone.emoji,
        color: entry.zone.color,
      };
      prs = { ...prs };
      localStorage.setItem('sugar-decisions-prs', JSON.stringify(prs));
    }
  }

  function handleClear() {
    logEntries = [];
  }

  function resetPRs() {
    prs = {};
    localStorage.removeItem('sugar-decisions-prs');
  }

  let prList = $derived(
    Object.values(prs).sort((a, b) => a.minutes - b.minutes)
  );
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

    <div class="pr-section">
      <div class="pr-header">
        <span class="pr-label">Personal Records</span>
        {#if prList.length > 0}
          <button class="pr-reset" onclick={resetPRs}>reset all</button>
        {/if}
      </div>
      {#if prList.length === 0}
        <p class="pr-empty">No records yet. You know what to do.</p>
      {:else}
        <div class="pr-list">
          {#each prList as p}
            <div class="pr-entry" style:border-left-color={p.color}>
              <span class="pr-time" style:color={p.color}>{p.time}</span>
              <span class="pr-zone">{p.emoji} {p.zone}</span>
              <span class="pr-date">{p.date}</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <div class="hint">
      <p>Tap the curve. Face the consequences.</p>
      <p class="hint-sub">Earliest click per zone wins.</p>
    </div>

    <LogList entries={logEntries} onClear={handleClear} />

    <footer>
      <p>If your doctor shows you this chart, get a new doctor.</p>
    </footer>
  </aside>
</div>

<style>
  .layout { display: flex; height: 100vh; overflow: hidden; }
  .plot-panel { flex: 1; min-width: 0; height: 100%; }

  .sidebar {
    width: 320px; flex-shrink: 0; height: 100%;
    overflow-y: auto; padding: 20px 24px;
    background: #111122; border-left: 1px solid #222;
    display: flex; flex-direction: column;
  }

  header { margin-bottom: 16px; }
  h1 { font-family: 'Permanent Marker', cursive; font-size: 1.8rem; color: #e0e0e0; margin: 0; letter-spacing: 1px; }
  .subtitle { font-family: 'Inter', sans-serif; color: #888; font-size: 13px; margin: 6px 0 0; }
  .tagline { font-family: 'Inter', sans-serif; color: #555; font-size: 11px; font-style: italic; margin: 2px 0 0; }

  .pr-section { margin-bottom: 16px; }
  .pr-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .pr-label { font-family: 'Permanent Marker', cursive; font-size: 14px; color: #999; letter-spacing: 1px; }
  .pr-reset { background: transparent; border: none; color: #444; font-size: 10px; cursor: pointer; font-family: 'Inter', sans-serif; }
  .pr-reset:hover { color: #ef4444; }
  .pr-empty { font-family: 'Inter', sans-serif; font-size: 12px; color: #444; font-style: italic; margin: 0; }

  .pr-list { display: flex; flex-direction: column; gap: 4px; }
  .pr-entry {
    background: #0d0d1a; border-left: 3px solid; border-radius: 4px;
    padding: 5px 10px; display: flex; align-items: center; gap: 8px;
    font-family: 'Inter', sans-serif; font-size: 11px;
  }
  .pr-time { font-weight: 700; font-size: 13px; min-width: 70px; }
  .pr-zone { color: #aaa; flex: 1; }
  .pr-date { color: #444; font-size: 9px; }

  .hint { margin-bottom: 16px; }
  .hint p { font-family: 'Inter', sans-serif; color: #666; font-size: 12px; margin: 0; }
  .hint-sub { color: #444 !important; font-size: 10px !important; font-style: italic; margin-top: 2px !important; }

  footer { margin-top: auto; padding-top: 16px; }
  footer p { font-family: 'Inter', sans-serif; color: #333; font-size: 10px; font-style: italic; }
</style>
