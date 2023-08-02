<script lang="ts">
  import { minutesAgoFromTimestamp } from "../utils";
  import { currentUser, type Message } from "../pocketbase";

  export let message: Message;

  $: owner = message.from.id === $currentUser.id;
</script>

<div class="flex flex-col gap-1 w-fit" class:self-end={owner}>
  <p class="text-white/60 text-sm" class:text-end={owner}>
    {minutesAgoFromTimestamp(message.created)}
  </p>
  <div
    class="py-2 px-3 rounded-t-lg"
    class:rounded-bl-lg={owner}
    class:rounded-br-lg={!owner}
    class:bg-primary-700={owner}
  >
    {message.content}
  </div>
</div>
