<script>
  let { point } = $props();
</script>

{#if point}
  <div
    class="tooltip"
    style:left="{point.pageX + 16}px"
    style:top="{point.pageY - 16}px"
    style:border-color={point.zone.color}
  >
    <div class="zone-name" style:color={point.zone.color}>
      {point.zone.emoji} {point.zone.name}
    </div>
    <div class="detail">
      <span class="label">When:</span> {point.timeMin}m in
    </div>
    <div class="detail">
      <span class="label">Level:</span> {point.absurdY ?? point.glucose}
    </div>
  </div>
{/if}

<style>
  .tooltip {
    position: fixed;
    z-index: 100;
    background: #1a1a2e;
    color: #e0e0e0;
    padding: 10px 14px;
    border-radius: 8px;
    border-left: 4px solid;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    pointer-events: none;
    white-space: nowrap;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  }

  .zone-name {
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 6px;
  }

  .detail {
    margin: 2px 0;
  }

  .label {
    color: #888;
  }
</style>
