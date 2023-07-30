<script lang="ts">
  import type { Decrypted } from "../pocketbase";

  import Avatar from "./Avatar.svelte";
  import { currentUser } from "../pocketbase";

  export let message: Decrypted;

  $: owner = message.from.id === $currentUser.id;
</script>

<div class="flex flex-col gap-1 w-fit" class:self-end={owner}>
  <p>{message.created}</p>
  <div
    class="py-2 px-3 rounded-r-lg rounded-tl-lg"
    class:bg-primary-700={owner}
  >
    {message.content}
  </div>
</div>
