<script lang="ts">
  export let lg: boolean = false;
</script>

<div
  class="rounded-full bg-yellow-600"
  class:h-12={lg}
  class:w-12={lg}
  class:h-10={!lg}
  class:w-10={!lg}
/>
