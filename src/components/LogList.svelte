<script>
  let { entries = [], onClear } = $props();
</script>

{#if entries.length > 0}
  <div class="log-container">
    <div class="log-header">
      <h3>Today's Damage</h3>
      <button onclick={onClear}>Clear</button>
    </div>
    <div class="log-entries">
      {#each entries as entry (entry.id)}
        <div class="log-entry" style:border-left-color={entry.zone.color}>
          <div class="log-zone" style:color={entry.zone.color}>
            {entry.zone.emoji} {entry.zone.name}
          </div>
          <div class="log-meta">
            <span class="log-time">{entry.timestamp}</span>
            <span class="log-detail">{entry.timeMin} &middot; {entry.absurdY} mg/dL</span>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .log-container {
    flex: 1;
    overflow-y: auto;
  }

  .log-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .log-header h3 {
    font-family: 'Inter', sans-serif;
    color: #e0e0e0;
    margin: 0;
    font-size: 16px;
  }

  .log-header button {
    background: transparent;
    border: 1px solid #555;
    color: #999;
    padding: 3px 10px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 11px;
    transition: all 0.2s;
  }

  .log-header button:hover {
    border-color: #ef4444;
    color: #ef4444;
  }

  .log-entries {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .log-entry {
    background: #0d0d1a;
    border-left: 3px solid;
    border-radius: 4px;
    padding: 6px 10px;
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    animation: slideIn 0.2s ease-out;
  }

  .log-zone {
    font-weight: 600;
    font-size: 11px;
    margin-bottom: 2px;
  }

  .log-meta {
    display: flex;
    gap: 8px;
    color: #666;
    font-size: 10px;
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-10px); }
    to { opacity: 1; transform: translateX(0); }
  }
</style>
