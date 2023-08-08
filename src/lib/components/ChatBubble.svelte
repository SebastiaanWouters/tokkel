<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { minutesAgoFromTimestamp } from "../utils";
  import { currentUser, type Message } from "../pocketbase";

  export let message: Message;
  export let open: boolean;
  export let src: string;

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

<div
  class="flex flex-col gap-1 w-fit"
  class:self-end={owner}
  class:items-end={owner}
>
  <p class="text-white/60 text-[0.92rem]" class:text-end={owner}>
    {minutesAgo}
  </p>
  <div class="flex flex-col gap-2">
    {#if message.image}
      <div
        class="cursor-pointer rounded-t-xl max-w-[16rem] overflow-wrap overflow-hidden"
      >
        <img
          on:click|stopPropagation={() => {
            src = message.image;
            open = true;
          }}
          src={message.image}
          alt="message content"
        />
      </div>
    {/if}
    <div
      class="py-2 px-3 rounded-t-xl max-w-[16rem] overflow-wrap overflow-hidden"
      style="overflow-wrap: break-word;"
      class:rounded-bl-xl={owner}
      class:rounded-bl-sm={!owner}
      class:rounded-br-xl={!owner}
      class:rounded-br-sm={owner}
      class:bg-neutral-700={!owner}
      class:bg-primary-700={owner}
    >
      <p>{message.content}</p>
    </div>
  </div>
</div>
