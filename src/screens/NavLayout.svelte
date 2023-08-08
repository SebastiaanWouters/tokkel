<script>
</script>

<div class="relative overflow-hidden grid grid-rows-[auto_1fr_auto] fill">
  <slot name="topNav" />
  <slot name="middle" />
  {#key "bottomBar"}
    <slot name="bottomNav" />
  {/key}
</div>
