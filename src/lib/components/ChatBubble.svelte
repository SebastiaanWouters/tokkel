<script lang="ts">
  import type { Decrypted } from "../pocketbase";

  import Avatar from "./Avatar.svelte";

  export let message: Decrypted;
</script>

<div class="flex gap-2 items-center">
  <div class="flex flex-col gap-1">
    <p>{message.created}</p>
    <div class="py-2 px-3 bg-primary-600/60 rounded-r-lg rounded-tl-lg">
      {message.content}
    </div>
  </div>
</div>
