<script>
  import { fly, fade } from "svelte/transition";
</script>

<div
  in:fade
  class="w-full h-full max-w-md border-white/5 border-r border-l mx-auto my-auto flex flex-col justify-start items-center"
>
  <slot />
</div>
