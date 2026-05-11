<script>
  import GlucosePlot from './components/GlucosePlot.svelte';
  import LogList from './components/LogList.svelte';

  let logEntries = $state([]);

  function handleLog(entry) {
    logEntries = [entry, ...logEntries];
  }

  function handleClear() {
    logEntries = [];
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
      <p class="tagline">The model that explains everything</p>
    </header>

    <div class="instructions">
      <p>Click on the curve to log a decision point.</p>
    </div>

    <LogList entries={logEntries} onClear={handleClear} />

    <footer>
      <p>Not medical advice. Obviously.</p>
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
    color: #444;
    font-size: 11px;
    font-style: italic;
  }
</style>
