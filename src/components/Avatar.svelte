<script lang="ts">
  export let lg: boolean = false;
  export let seed: string = "";
</script>

<div
  class="rounded-full bg-zinc-600"
  style="background-image: url(https://api.dicebear.com/6.x/avataaars/svg?seed={seed})"
  class:h-12={lg}
  class:w-12={lg}
  class:h-8={!lg}
  class:w-8={!lg}
/>
