<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { minutesAgoFromTimestamp } from "../utils";
  import { currentUser, type Message } from "../pocketbase";

  export let message: Message;

  let owner = false;
  let minutesAgo = minutesAgoFromTimestamp(message.created);

  // Function to update the minutesAgo value
  const updateMinutesAgo = () => {
    minutesAgo = minutesAgoFromTimestamp(message.created);
  };

  // Check if the message is from the current user
  $: owner = message.from.id === $currentUser.id;

  // Update the time every 60 seconds (adjust interval as needed)
  let interval;
  onMount(() => {
    interval = setInterval(updateMinutesAgo, 20000); // 60 seconds
  });

  // Clear the interval when the component is destroyed
  onDestroy(() => {
    clearInterval(interval);
  });
</script>

<div class="flex flex-col gap-1 w-fit" class:self-end={owner}>
  <p class="text-white/60 text-sm" class:text-end={owner}>
    {minutesAgo}
  </p>
  <div
    class="py-2 px-3 rounded-t-lg max-w-[16rem] overflow-wrap"
    style="overflow-wrap: break-word;"
    class:rounded-bl-lg={owner}
    class:rounded-br-lg={!owner}
    class:bg-neutral-700={!owner}
    class:bg-primary-700={owner}
  >
    {message.content}
  </div>
</div>
